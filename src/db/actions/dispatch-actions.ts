"use server";

import { db } from "@/neynar-db-sdk/db";
import { dispatch, dispatchPollResponses, romeDispatchCache } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
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

type DbMethod = "select" | "insert" | "update" | "delete";

function hasDbMethod(method: DbMethod) {
  return typeof (db as unknown as Record<string, unknown>)[method] === "function";
}

function getRomeDate(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
}

export async function getRomeDispatchForDate(date: string) {
  if (!hasDbMethod("select")) return null;

  const rows = await db
    .select()
    .from(romeDispatchCache)
    .where(eq(romeDispatchCache.date, date))
    .orderBy(desc(romeDispatchCache.generatedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateRomeDispatchContent(date: string, content: string) {
  if (!hasDbMethod("select") || !hasDbMethod("update") || !hasDbMethod("insert")) {
    return {
      ok: false,
      error:
        "Database is not configured. Set DATABASE_URL to enable editing cached dispatch.",
    };
  }

  try {
    JSON.parse(content);
  } catch {
    return { ok: false, error: "Dispatch content must be valid JSON" };
  }

  const existing = await getRomeDispatchForDate(date);
  if (existing) {
    await db
      .update(romeDispatchCache)
      .set({ content, model: "admin-override" })
      .where(eq(romeDispatchCache.id, existing.id));
    return { ok: true };
  }

  await db.insert(romeDispatchCache).values({
    id: randomUUID(),
    date,
    content,
    model: "admin-override",
  });

  return { ok: true };
}

export async function triggerRomeDispatchGeneration(
  adminFid: number,
  force: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (adminFid !== ADMIN_FID) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const date = getRomeDate();
    const hasSelect = hasDbMethod("select");
    const hasDelete = hasDbMethod("delete");

    if (!hasSelect || !hasDelete) {
      const { generateRomeDispatch } = await import("@/lib/rome-dispatch-generator");
      await generateRomeDispatch(date);
      return { ok: true };
    }

    if (!force) {
      const existing = await getRomeDispatchForDate(date);
      if (existing) {
        return { ok: true };
      }
    } else {
      await db.delete(romeDispatchCache).where(eq(romeDispatchCache.date, date));
    }

    const { generateRomeDispatch } = await import("@/lib/rome-dispatch-generator");
    await generateRomeDispatch(date);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Dispatch generation failed",
    };
  }
}

/**
 * Admin server action: generate (or regenerate) today's dispatch.
 * Runs server-side so secrets stay safe.
 */
export async function triggerDispatchGeneration(
  adminFid: number,
  force: boolean,
): Promise<{ ok: boolean; error?: string }> {
  return triggerRomeDispatchGeneration(adminFid, force);
}
