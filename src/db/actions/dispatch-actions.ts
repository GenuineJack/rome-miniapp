"use server";

import { db } from "@/neynar-db-sdk/db";
import { dispatch, dispatchPollResponses } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function getDispatchForDate(date: string) {
  const rows = await db
    .select()
    .from(dispatch)
    .where(eq(dispatch.date, date))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveDispatch(date: string, content: string) {
  const existing = await getDispatchForDate(date);
  if (existing) return existing;

  const id = randomUUID();
  await db.insert(dispatch).values({
    id,
    date,
    content,
    adminOverride: false,
  });
  return { id, date, content };
}

export async function updateDispatchContent(
  date: string,
  content: string,
  adminOverride = true,
) {
  await db
    .update(dispatch)
    .set({ content, adminOverride })
    .where(eq(dispatch.date, date));
}

export async function deleteDispatchForDate(date: string) {
  await db.delete(dispatch).where(eq(dispatch.date, date));
}

// ─── Daily Poll ──────────────────────────────────────────────────────────────

export type PollResultRow = {
  option: string;
  count: number;
  percentage: number;
};

export type PollResults = {
  date: string;
  results: PollResultRow[];
  total: number;
};

export async function getPollResults(date: string): Promise<PollResults> {
  const rows = await db
    .select({
      option: dispatchPollResponses.option,
      count: sql<number>`count(*)::int`,
    })
    .from(dispatchPollResponses)
    .where(eq(dispatchPollResponses.dispatchDate, date))
    .groupBy(dispatchPollResponses.option);

  const total = rows.reduce((acc, r) => acc + Number(r.count), 0);
  const results: PollResultRow[] = rows.map((r) => ({
    option: r.option,
    count: Number(r.count),
    percentage: total === 0 ? 0 : Math.round((Number(r.count) / total) * 100),
  }));

  return { date, results, total };
}

export async function recordPollVote(
  date: string,
  option: string,
  fid: string | null,
): Promise<{ ok: true; results: PollResults } | { ok: false; error: string; status: number }> {
  if (!date || !option) {
    return { ok: false, error: "Missing date or option", status: 400 };
  }

  if (fid) {
    const existing = await db
      .select({ id: dispatchPollResponses.id })
      .from(dispatchPollResponses)
      .where(
        and(
          eq(dispatchPollResponses.dispatchDate, date),
          eq(dispatchPollResponses.fid, fid),
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      return { ok: false, error: "Already voted", status: 409 };
    }
  }

  await db.insert(dispatchPollResponses).values({
    dispatchDate: date,
    option,
    fid: fid ?? null,
  });

  const results = await getPollResults(date);
  return { ok: true, results };
}

const ADMIN_FID = 218957;

/**
 * Admin server action: generate (or regenerate) today's dispatch.
 * Runs server-side so secrets stay safe.
 */
export async function triggerDispatchGeneration(
  adminFid: number,
  force: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (adminFid !== ADMIN_FID) {
    return { ok: false, error: "Unauthorized" };
  }

  // Dynamic import to avoid pulling AI deps into every server action bundle
  const { generateDispatchContent } = await import("@/lib/dispatch-generator");
  return generateDispatchContent({ force });
}
