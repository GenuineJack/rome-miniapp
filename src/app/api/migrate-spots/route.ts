import { NextRequest, NextResponse } from "next/server";
import { migrateSpotsFid, migrateSpotsLinks } from "@/db/actions/rome-actions";
import { privateConfig } from "@/config/private-config";

// Simple secret guard — same pattern as seed-spots
const SEED_SECRET = privateConfig.seedSecret;

/**
 * POST /api/migrate-spots
 *
 * Runs two one-time data migrations:
 *   1. Fix FID 0 — updates spots seeded with submittedByFid=0 to genuinejack's real FID (218957)
 *   2. Backfill links — fills in null link values for seeded spots that have known URLs
 *
 * Requires x-seed-secret header or ?secret= query param matching SEED_SECRET env var.
 * Safe to call multiple times — both migrations only touch rows that still need fixing.
 */
export async function POST(request: NextRequest) {
  const headerSecret = request.headers.get("x-seed-secret");
  const querySecret = new URL(request.url).searchParams.get("secret");

  if (!SEED_SECRET || (headerSecret !== SEED_SECRET && querySecret !== SEED_SECRET)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const [fidResult, linksResult] = await Promise.all([
    migrateSpotsFid(),
    migrateSpotsLinks(),
  ]);

  if (fidResult.error || linksResult.error) {
    return NextResponse.json(
      {
        success: false,
        fidMigration: fidResult,
        linksMigration: linksResult,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    fidMigration: { updated: fidResult.updated },
    linksMigration: { updated: linksResult.updated },
  });
}
