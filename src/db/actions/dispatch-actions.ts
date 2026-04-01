"use server";

import { db } from "@/neynar-db-sdk/db";
import { dispatch } from "@/db/schema";
import { eq } from "drizzle-orm";
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
