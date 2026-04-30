/* eslint-disable @neynar/no-process-env */
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import type { User } from "@neynar/nodejs-sdk/build/api/models";
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import type { RomeAttendee } from "@/features/rome/types";

// Hardcoded Farcon Unlock lock addresses on Base. Env vars override if set.
const DEFAULT_BUILDER_ADDRESS = "0x6035d75e829197b02136b7c8f54f48e33bde3c08";
const DEFAULT_SUMMIT_ADDRESS = "0xc9ab9faaa4517a31f410acbc605d57728ce315e0";

const CACHE_TTL_MS = 5 * 60 * 1000;
const NEYNAR_BATCH_SIZE = 300;
const MULTICALL_BATCH_SIZE = 500;

const LOCK_ABI = parseAbi([
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
]);

type FarconAttendeesResult = {
  verified: RomeAttendee[];
  fetchedAt: number;
  chainId: number;
  unmappedWallets: number;
  warnings: string[];
};

let cache: { data: FarconAttendeesResult; expiresAt: number } | null = null;
let inflight: Promise<FarconAttendeesResult> | null = null;

function normalizeAddress(value: string | null | undefined): `0x${string}` | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(trimmed) ? (trimmed as `0x${string}`) : null;
}

function resolveLockAddresses(): { builder: `0x${string}`; summit: `0x${string}` } {
  const builder =
    normalizeAddress(process.env.FARCON_BUILDER_ADDRESS) ??
    (DEFAULT_BUILDER_ADDRESS as `0x${string}`);
  const summit =
    normalizeAddress(process.env.FARCON_SUMMIT_ADDRESS) ??
    (DEFAULT_SUMMIT_ADDRESS as `0x${string}`);
  return { builder, summit };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

type PublicClient = ReturnType<typeof createPublicClient>;

async function fetchOwnersForLock(
  client: PublicClient,
  lockAddress: `0x${string}`,
): Promise<{ owners: string[]; warnings: string[] }> {
  const warnings: string[] = [];

  let totalSupply = 0n;
  try {
    totalSupply = (await client.readContract({
      address: lockAddress,
      abi: LOCK_ABI,
      functionName: "totalSupply",
    })) as bigint;
  } catch (error) {
    warnings.push(
      `totalSupply() failed for ${lockAddress}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return { owners: [], warnings };
  }

  const total = Number(totalSupply);
  if (!Number.isFinite(total) || total <= 0) {
    return { owners: [], warnings };
  }

  // Read all tokenIds via multicall in batches.
  const tokenIds: bigint[] = [];
  for (let start = 0; start < total; start += MULTICALL_BATCH_SIZE) {
    const end = Math.min(start + MULTICALL_BATCH_SIZE, total);
    const calls = [];
    for (let i = start; i < end; i++) {
      calls.push({
        address: lockAddress,
        abi: LOCK_ABI,
        functionName: "tokenByIndex" as const,
        args: [BigInt(i)] as const,
      });
    }
    const results = await client.multicall({ contracts: calls, allowFailure: true });
    for (const r of results) {
      if (r.status === "success" && typeof r.result === "bigint") {
        tokenIds.push(r.result);
      }
    }
  }

  if (tokenIds.length === 0) {
    return { owners: [], warnings };
  }

  // Read owners for tokenIds via multicall in batches.
  const owners = new Set<string>();
  for (const batch of chunk(tokenIds, MULTICALL_BATCH_SIZE)) {
    const calls = batch.map((tokenId) => ({
      address: lockAddress,
      abi: LOCK_ABI,
      functionName: "ownerOf" as const,
      args: [tokenId] as const,
    }));
    const results = await client.multicall({ contracts: calls, allowFailure: true });
    for (const r of results) {
      if (r.status === "success" && typeof r.result === "string") {
        const normalized = normalizeAddress(r.result);
        if (normalized) owners.add(normalized);
      }
    }
  }

  return { owners: Array.from(owners), warnings };
}

async function mapAddressesToUsers(
  addresses: string[],
  neynarApiKey: string,
): Promise<{
  byAddress: Map<string, User>;
  unmappedWallets: number;
}> {
  if (addresses.length === 0) {
    return { byAddress: new Map(), unmappedWallets: 0 };
  }

  const client = new NeynarAPIClient(new Configuration({ apiKey: neynarApiKey }));
  const byAddress = new Map<string, User>();
  let matchedWallets = 0;

  for (const batch of chunk(addresses, NEYNAR_BATCH_SIZE)) {
    const response = await client.fetchBulkUsersByEthOrSolAddress({ addresses: batch });
    for (const [address, users] of Object.entries(response ?? {})) {
      if (!Array.isArray(users) || users.length === 0) continue;
      matchedWallets += 1;
      const normalized = normalizeAddress(address) ?? address.toLowerCase();
      // Pick the first user for that address (most reverse-mapping APIs return one).
      const user = users[0] as User;
      if (!byAddress.has(normalized)) byAddress.set(normalized, user);
    }
  }

  return {
    byAddress,
    unmappedWallets: Math.max(addresses.length - matchedWallets, 0),
  };
}

function userToAttendee(
  user: User,
  walletAddress: string,
  contractAddress: string,
): RomeAttendee {
  const displayName = (user.display_name || user.username || `fid-${user.fid}`).trim();
  return {
    id: `verified-${user.fid}`,
    fid: user.fid,
    username: user.username || null,
    displayName,
    pfpUrl: user.pfp_url || null,
    bio: user.profile?.bio?.text?.trim() || null,
    walletAddress,
    ticketVerified: true,
    contractAddress,
    selfAdded: false,
    createdAt: new Date(),
  };
}

async function runFetch(): Promise<FarconAttendeesResult> {
  const { builder, summit } = resolveLockAddresses();
  const neynarApiKey = (process.env.NEYNAR_API_KEY ?? "").trim();
  const warnings: string[] = [];

  if (!neynarApiKey) {
    throw new Error("NEYNAR_API_KEY is required to map ticket holders to Farcaster users.");
  }

  const rpcUrl = (process.env.BASE_RPC_URL ?? "").trim() || "https://mainnet.base.org";
  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
    batch: { multicall: true },
  }) as PublicClient;

  // Fetch owners per lock so we can attribute contractAddress.
  const locks: Array<{ address: `0x${string}`; label: "builder" | "summit" }> = [
    { address: builder, label: "builder" },
    { address: summit, label: "summit" },
  ];

  const ownerToContract = new Map<string, string>();
  const allOwners = new Set<string>();

  for (const lock of locks) {
    const { owners, warnings: lockWarnings } = await fetchOwnersForLock(client, lock.address);
    warnings.push(...lockWarnings);
    for (const owner of owners) {
      allOwners.add(owner);
      // First lock wins attribution; second only fills if not already set.
      if (!ownerToContract.has(owner)) ownerToContract.set(owner, lock.address);
    }
  }

  const { byAddress, unmappedWallets } = await mapAddressesToUsers(
    Array.from(allOwners),
    neynarApiKey,
  );

  // Dedupe by FID, preferring first match.
  const seenFids = new Set<number>();
  const verified: RomeAttendee[] = [];
  for (const [walletAddress, user] of byAddress.entries()) {
    if (seenFids.has(user.fid)) continue;
    seenFids.add(user.fid);
    const contractAddress = ownerToContract.get(walletAddress) ?? builder;
    verified.push(userToAttendee(user, walletAddress, contractAddress));
  }

  return {
    verified,
    fetchedAt: Date.now(),
    chainId: base.id,
    unmappedWallets,
    warnings,
  };
}

export async function fetchFarconAttendees(
  options: { force?: boolean } = {},
): Promise<FarconAttendeesResult> {
  const now = Date.now();
  if (!options.force && cache && cache.expiresAt > now) {
    return cache.data;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const data = await runFetch();
      cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
