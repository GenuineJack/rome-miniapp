"use server";

import { db } from "@/neynar-db-sdk/db";
import { monthlyHappenings } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { verifyAdmin } from "@/db/actions/admin-auth";

export type MonthlyHappening = {
  id: string;
  month: string;
  slot: number;
  title: string;
  emoji: string;
  summary: string;
  body: string;
  imageUrl: string | null;
  sourceLinks: { label: string; url: string }[];
  createdAt: Date;
};

function parseSourceLinks(raw: string | null): { label: string; url: string }[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
  });
  // en-CA gives YYYY-MM format directly when only year+month are requested
  return fmt.format(now); // e.g. "2026-04"
}

export async function getMonthlyHappenings(month?: string): Promise<MonthlyHappening[]> {
  try {
    const target = month ?? getCurrentMonthStr();
    const rows = await db
      .select()
      .from(monthlyHappenings)
      .where(eq(monthlyHappenings.month, target))
      .orderBy(asc(monthlyHappenings.slot));
    return rows.map((r) => ({
      id: r.id,
      month: r.month,
      slot: r.slot,
      title: r.title,
      emoji: r.emoji,
      summary: r.summary,
      body: r.body,
      imageUrl: r.imageUrl,
      sourceLinks: parseSourceLinks(r.sourceLinks),
      createdAt: r.createdAt,
    }));
  } catch (e) {
    console.error("[monthly-happenings] getMonthlyHappenings failed:", e);
    return [];
  }
}

export async function getMonthlyHappeningById(id: string): Promise<MonthlyHappening | null> {
  try {
    const rows = await db
      .select()
      .from(monthlyHappenings)
      .where(eq(monthlyHappenings.id, id))
      .limit(1);
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      month: r.month,
      slot: r.slot,
      title: r.title,
      emoji: r.emoji,
      summary: r.summary,
      body: r.body,
      imageUrl: r.imageUrl,
      sourceLinks: parseSourceLinks(r.sourceLinks),
      createdAt: r.createdAt,
    };
  } catch (e) {
    console.error("[monthly-happenings] getMonthlyHappeningById failed:", e);
    return null;
  }
}

type UpsertInput = {
  month: string;
  slot: number;
  title: string;
  emoji: string;
  summary: string;
  body: string;
  imageUrl?: string | null;
  sourceLinks?: { label: string; url: string }[];
};

/** Insert a single slot row, removing any existing row with the same (month, slot). */
export async function setMonthlySlot(input: UpsertInput) {
  const existing = await db
    .select({ id: monthlyHappenings.id, slot: monthlyHappenings.slot, month: monthlyHappenings.month })
    .from(monthlyHappenings)
    .where(eq(monthlyHappenings.month, input.month));
  const dupe = existing.find((r) => r.slot === input.slot);
  if (dupe) {
    await db.delete(monthlyHappenings).where(eq(monthlyHappenings.id, dupe.id));
  }
  await db.insert(monthlyHappenings).values({
    id: randomUUID(),
    month: input.month,
    slot: input.slot,
    title: input.title,
    emoji: input.emoji,
    summary: input.summary,
    body: input.body,
    imageUrl: input.imageUrl ?? null,
    sourceLinks: JSON.stringify(input.sourceLinks ?? []),
  });
}

/** Admin-only: regenerate the current month's three rows (deletes existing first). */
export async function adminRegenerateCurrentMonth(adminFid: number): Promise<{ ok: boolean; error?: string }> {
  const ok = await verifyAdmin(adminFid);
  if (!ok) {
    return { ok: false, error: "Unauthorized" };
  }
  const month = getCurrentMonthStr();
  await db.delete(monthlyHappenings).where(eq(monthlyHappenings.month, month));
  // Dynamic import keeps AI deps out of every server bundle.
  const { generateMonthlyHappenings } = await import("@/lib/monthly-happenings-generator");
  return generateMonthlyHappenings({ month, force: true });
}

/** Admin-only: list monthly happenings for a given month (defaults to current). */
export async function adminListMonthlyHappenings(
  adminFid: number,
  month?: string,
): Promise<MonthlyHappening[]> {
  const ok = await verifyAdmin(adminFid);
  if (!ok) return [];
  return getMonthlyHappenings(month ?? getCurrentMonthStr());
}

/** Admin-only: hard-delete a single monthly happening row. */
export async function adminDeleteMonthlyHappening(
  adminFid: number,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const ok = await verifyAdmin(adminFid);
  if (!ok) return { ok: false, error: "Unauthorized" };
  await db.delete(monthlyHappenings).where(eq(monthlyHappenings.id, id));
  return { ok: true };
}
