import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import type { User } from "@neynar/nodejs-sdk/build/api/models";
import { randomUUID } from "crypto";
import { inArray, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { romeAttendees } from "@/db/schema";
import { db } from "@/neynar-db-sdk/db";

export const dynamic = "force-dynamic";

const HOLDER_PAGE_SIZE = 1000;
const MAX_PAGES = 20;
const NEYNAR_BATCH_SIZE = 300;

type UnlockKeyRow = {
  owner?: string | null;
};

type UnlockGraphResponse = {
  data?: {
    keys?: UnlockKeyRow[];
  };
  errors?: Array<{
    message?: string;
  }>;
};

const KEYS_QUERY_BY_LOCK = `
  query GetLockKeys($lockAddress: String!, $first: Int!, $skip: Int!) {
    keys(where: { lock: $lockAddress }, first: $first, skip: $skip) {
      owner
    }
  }
`;

const KEYS_QUERY_BY_LOCK_NESTED = `
  query GetLockKeysNested($lockAddress: String!, $first: Int!, $skip: Int!) {
    keys(where: { lock_: { address: $lockAddress } }, first: $first, skip: $skip) {
      owner
    }
  }
`;

function normalizeAddress(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(normalized) ? normalized : null;
}

function resolveUnlockChainId(rawChain: string | undefined): number {
  const normalized = (rawChain ?? "").trim().toLowerCase();
  if (["unlock", "base", "8453"].includes(normalized)) return 8453;
  if (["mainnet", "ethereum", "1"].includes(normalized)) return 1;
  if (["optimism", "10"].includes(normalized)) return 10;
  if (["polygon", "137"].includes(normalized)) return 137;

  const asNumber = Number.parseInt(normalized, 10);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : 8453;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchUnlockKeysPage(
  endpoint: string,
  query: string,
  lockAddress: string,
  skip: number,
): Promise<UnlockKeyRow[]> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query,
      variables: {
        lockAddress,
        first: HOLDER_PAGE_SIZE,
        skip,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unlock subgraph request failed (${response.status})`);
  }

  const json = (await response.json()) as UnlockGraphResponse;
  if (json.errors?.length) {
    const message = json.errors
      .map((error) => error.message)
      .filter(Boolean)
      .join("; ");
    throw new Error(message || "Unlock subgraph returned errors");
  }

  return json.data?.keys ?? [];
}

async function fetchHolderAddresses(lockAddress: string, chainId: number) {
  const endpoint = `https://subgraph.unlock-protocol.com/${chainId}`;
  const warnings: string[] = [];
  const holders = new Set<string>();
  let query = KEYS_QUERY_BY_LOCK;

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * HOLDER_PAGE_SIZE;
    let rows: UnlockKeyRow[] = [];

    try {
      rows = await fetchUnlockKeysPage(endpoint, query, lockAddress, skip);
    } catch (error) {
      if (page === 0 && query === KEYS_QUERY_BY_LOCK) {
        query = KEYS_QUERY_BY_LOCK_NESTED;
        warnings.push("Unlock query fallback used for lock key lookup.");
        rows = await fetchUnlockKeysPage(endpoint, query, lockAddress, skip);
      } else {
        throw error;
      }
    }

    for (const row of rows) {
      const owner = normalizeAddress(row.owner);
      if (owner) holders.add(owner);
    }

    if (rows.length < HOLDER_PAGE_SIZE) break;
    if (page === MAX_PAGES - 1) {
      warnings.push(`Pagination capped at ${MAX_PAGES} pages. Some holders may not be synced.`);
    }
  }

  return { holders: Array.from(holders), warnings };
}

async function mapAddressesToUsers(addresses: string[], neynarApiKey: string) {
  const client = new NeynarAPIClient(
    new Configuration({
      apiKey: neynarApiKey,
    }),
  );

  const byFid = new Map<number, { user: User; walletAddress: string }>();
  let matchedWallets = 0;

  for (const batch of chunk(addresses, NEYNAR_BATCH_SIZE)) {
    const response = await client.fetchBulkUsersByEthOrSolAddress({ addresses: batch });

    for (const [address, users] of Object.entries(response ?? {})) {
      if (!Array.isArray(users) || users.length === 0) continue;
      matchedWallets += 1;

      const walletAddress = normalizeAddress(address) ?? address.toLowerCase();
      for (const user of users) {
        if (!byFid.has(user.fid)) {
          byFid.set(user.fid, { user, walletAddress });
        }
      }
    }
  }

  return {
    byFid,
    unmappedWallets: Math.max(addresses.length - matchedWallets, 0),
  };
}

async function upsertVerifiedAttendees(
  attendees: Map<number, { user: User; walletAddress: string }>,
  contractAddress: string,
) {
  const fids = Array.from(attendees.keys());
  if (fids.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  const existingRows = await db
    .select({
      id: romeAttendees.id,
      fid: romeAttendees.fid,
      selfAdded: romeAttendees.selfAdded,
    })
    .from(romeAttendees)
    .where(inArray(romeAttendees.fid, fids));

  const existingByFid = new Map<number, { id: string; selfAdded: boolean }>();
  for (const row of existingRows) {
    if (typeof row.fid === "number") {
      existingByFid.set(row.fid, { id: row.id, selfAdded: row.selfAdded });
    }
  }

  let inserted = 0;
  let updated = 0;

  for (const [fid, payload] of attendees.entries()) {
    const user = payload.user;
    const displayName = (user.display_name || user.username || `fid-${fid}`).trim();
    const username = user.username || null;
    const pfpUrl = user.pfp_url || null;
    const bio = user.profile?.bio?.text?.trim() || null;
    const existing = existingByFid.get(fid);

    if (existing) {
      await db
        .update(romeAttendees)
        .set({
          username,
          displayName,
          pfpUrl,
          bio,
          walletAddress: payload.walletAddress,
          ticketVerified: true,
          contractAddress,
          selfAdded: existing.selfAdded,
        })
        .where(eq(romeAttendees.id, existing.id));
      updated += 1;
      continue;
    }

    await db.insert(romeAttendees).values({
      id: randomUUID(),
      fid,
      username,
      displayName,
      pfpUrl,
      bio,
      walletAddress: payload.walletAddress,
      ticketVerified: true,
      contractAddress,
      selfAdded: false,
    });
    inserted += 1;
  }

  return { inserted, updated };
}

async function runSync() {
  const contractAddress = normalizeAddress(process.env.FARCON_CONTRACT_ADDRESS);
  const neynarApiKey = (process.env.NEYNAR_API_KEY ?? "").trim();

  if (!contractAddress) {
    return NextResponse.json(
      {
        success: false,
        error: "FARCON_CONTRACT_ADDRESS is required to sync attendees.",
      },
      { status: 503 },
    );
  }

  if (!neynarApiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "NEYNAR_API_KEY is required to map ticket holders to Farcaster users.",
      },
      { status: 503 },
    );
  }

  const chainId = resolveUnlockChainId(process.env.FARCON_CHAIN);

  try {
    const { holders, warnings } = await fetchHolderAddresses(contractAddress, chainId);

    if (holders.length === 0) {
      return NextResponse.json({
        success: true,
        contractAddress,
        chainId,
        holdersFound: 0,
        mappedUsers: 0,
        inserted: 0,
        updated: 0,
        unmappedWallets: 0,
        warnings,
      });
    }

    const { byFid, unmappedWallets } = await mapAddressesToUsers(holders, neynarApiKey);
    const { inserted, updated } = await upsertVerifiedAttendees(byFid, contractAddress);

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      holdersFound: holders.length,
      mappedUsers: byFid.size,
      inserted,
      updated,
      unmappedWallets,
      warnings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to sync attendees",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return runSync();
}

export async function POST() {
  return runSync();
}
