"use server";

import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { privateConfig } from "@/config/private-config";

const ADMIN_FID = 218957;

let _client: NeynarAPIClient | null = null;
function getClient() {
  if (!_client) {
    _client = new NeynarAPIClient(
      new Configuration({ apiKey: privateConfig.neynarApiKey })
    );
  }
  return _client;
}

/**
 * Verify a caller FID is real by looking it up via Neynar.
 * Returns true if the FID exists and the API confirms it.
 */
export async function verifyFid(fid: number): Promise<boolean> {
  if (!fid || fid <= 0) return false;
  try {
    const resp = await getClient().fetchBulkUsers({ fids: [fid] });
    const users = resp?.users ?? [];
    return users.some((u: { fid: number }) => u.fid === fid);
  } catch {
    return false;
  }
}

/**
 * Verify the caller is the admin (FID matches AND exists on Neynar).
 */
export async function verifyAdmin(callerFid: number): Promise<boolean> {
  if (callerFid !== ADMIN_FID) return false;
  return verifyFid(callerFid);
}
