import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { romeAttendees } from "@/db/schema";
import { db } from "@/neynar-db-sdk/db";
import type { RomeAttendee } from "@/features/rome/types";
import { fetchFarconAttendees } from "@/lib/farcon-attendees";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

async function readAttendeesFromDb(): Promise<RomeAttendee[]> {
  try {
    const rows = await db
      .select()
      .from(romeAttendees)
      .orderBy(desc(romeAttendees.ticketVerified), desc(romeAttendees.createdAt));
    return rows as RomeAttendee[];
  } catch (error) {
    console.error("[rome-attendees] DB read failed:", error);
    return [];
  }
}

function lastSyncedAt(rows: RomeAttendee[]): number {
  let max = 0;
  for (const row of rows) {
    const ts = (row as RomeAttendee & { lastSyncedAt?: Date | string | null }).lastSyncedAt;
    if (!ts) continue;
    const time = ts instanceof Date ? ts.getTime() : new Date(ts).getTime();
    if (Number.isFinite(time) && time > max) max = time;
  }
  return max;
}

async function refreshSilently(force: boolean): Promise<void> {
  try {
    await fetchFarconAttendees({ force });
  } catch (error) {
    console.error("[rome-attendees] background refresh failed:", error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  let rows = await readAttendeesFromDb();
  const lastSync = lastSyncedAt(rows);
  const verifiedCount = rows.filter((r) => r.ticketVerified).length;
  const isStale = Date.now() - lastSync > REFRESH_INTERVAL_MS;
  const needsBlockingRefresh = force || verifiedCount === 0;

  let refreshError: string | null = null;
  if (needsBlockingRefresh) {
    try {
      await fetchFarconAttendees({ force: true });
      rows = await readAttendeesFromDb();
    } catch (error) {
      refreshError =
        error instanceof Error ? error.message : "Unable to refresh ticket holders.";
      console.error("[rome-attendees] blocking refresh failed:", error);
    }
  } else if (isStale) {
    // Fire-and-forget; serve cached DB rows immediately.
    void refreshSilently(false);
  }

  return NextResponse.json({
    attendees: rows,
    verifiedCount: rows.filter((r) => r.ticketVerified).length,
    selfAddedCount: rows.filter((r) => r.selfAdded).length,
    lastSyncedAt: lastSyncedAt(rows),
    error: refreshError,
  });
}
