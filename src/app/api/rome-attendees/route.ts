import { NextResponse } from "next/server";
import { fetchFarconAttendees } from "@/lib/farcon-attendees";
import { getRomeAttendees } from "@/db/actions/rome-actions";
import type { RomeAttendee } from "@/features/rome/types";

export const dynamic = "force-dynamic";

export async function GET() {
  let verified: RomeAttendee[] = [];
  let fetchedAt = Date.now();
  let error: string | null = null;
  let unmappedWallets = 0;

  try {
    const result = await fetchFarconAttendees();
    verified = result.verified;
    fetchedAt = result.fetchedAt;
    unmappedWallets = result.unmappedWallets;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to fetch verified ticket holders.";
    console.error("[rome-attendees] verified fetch failed:", err);
  }

  let selfAdded: RomeAttendee[] = [];
  try {
    selfAdded = (await getRomeAttendees("self")) as RomeAttendee[];
  } catch (err) {
    console.error("[rome-attendees] self-added fetch failed:", err);
  }

  // Merge: verified by FID takes precedence; self-added rows are appended only if
  // their FID isn't already in the verified list.
  const verifiedFids = new Set<number>();
  for (const v of verified) {
    if (typeof v.fid === "number") verifiedFids.add(v.fid);
  }

  const merged: RomeAttendee[] = [...verified];
  for (const s of selfAdded) {
    if (typeof s.fid === "number" && verifiedFids.has(s.fid)) continue;
    merged.push(s);
  }

  merged.sort((a, b) => {
    if (a.ticketVerified !== b.ticketVerified) return a.ticketVerified ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return NextResponse.json({
    attendees: merged,
    verifiedCount: verified.length,
    selfAddedCount: selfAdded.length,
    unmappedWallets,
    fetchedAt,
    error,
  });
}
