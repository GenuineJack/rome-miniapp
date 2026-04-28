"use server";

import { db } from "@/neynar-db-sdk/db";
import { spots, builders, communityHappenings, submissionErrors } from "@/db/schema";
import { eq, desc, and, gte, or, isNull, count } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Builder, Spot } from "@/features/boston/types";
import { verifyAdmin, verifyFid } from "@/db/actions/admin-auth";

function parseBuilderRow(row: Record<string, unknown>): Builder {
  const r = row as Builder & { projectLinks?: string | null; categories?: string | null };
  return {
    ...r,
    projectLinks: typeof r.projectLinks === "string" ? JSON.parse(r.projectLinks) : r.projectLinks ?? [],
    categories: typeof r.categories === "string" ? JSON.parse(r.categories) : r.categories ?? [],
  };
}

// ─── Spots ───────────────────────────────────────────────────────────────────

export async function getSpots(opts?: {
  category?: string;
  neighborhood?: string;
  submitterFid?: number;
  limit?: number;
}) {
  // Intentionally throws — lets mini-app.tsx .catch() fire
  // and show the real error state to the user
  const conditions = [eq(spots.status, "approved")];

  if (opts?.category && opts.category !== "All") {
    conditions.push(eq(spots.category, opts.category));
  }
  if (opts?.neighborhood) {
    conditions.push(eq(spots.neighborhood, opts.neighborhood));
  }
  if (opts?.submitterFid !== undefined) {
    conditions.push(eq(spots.submittedByFid, opts.submitterFid));
  }

  return await db
    .select()
    .from(spots)
    .where(and(...conditions))
    .orderBy(desc(spots.createdAt))
    .limit(opts?.limit ?? 100);
}

export async function getFeaturedSpots() {
  try {
    return await db
      .select()
      .from(spots)
      .where(and(eq(spots.featured, true), eq(spots.status, "approved")))
      .orderBy(desc(spots.createdAt))
      .limit(10);
  } catch (error) {
    console.error("Failed to get featured spots:", error);
    return [];
  }
}

export async function getRecentSpots(limit: number = 20) {
  try {
    return await db
      .select()
      .from(spots)
      .where(eq(spots.status, "approved"))
      .orderBy(desc(spots.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to get recent spots:", error);
    return [];
  }
}

export async function submitSpot(data: {
  name: string;
  category: string;
  subcategory?: string;
  neighborhood: string;
  description: string;
  address?: string;
  link?: string;
  submittedByFid: number;
  submittedByUsername: string;
  submittedByDisplayName: string;
  submittedByPfpUrl?: string;
}) {
  try {
    if (!(await verifyFid(data.submittedByFid))) {
      return { success: false, error: "Could not verify Farcaster identity" };
    }
    const id = randomUUID();
    await db.insert(spots).values({
      id,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory ?? null,
      neighborhood: data.neighborhood,
      description: data.description,
      address: data.address ?? null,
      link: data.link ?? null,
      latitude: null,
      longitude: null,
      submittedByFid: data.submittedByFid,
      submittedByUsername: data.submittedByUsername,
      submittedByDisplayName: data.submittedByDisplayName,
      submittedByPfpUrl: data.submittedByPfpUrl ?? null,
      featured: false,
      status: "approved",
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to submit spot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSpotCountByNeighborhood() {
  try {
    // Use GROUP BY to avoid fetching all rows just to count them
    const rows = await db
      .select({
        neighborhood: spots.neighborhood,
        cnt: count(spots.id),
      })
      .from(spots)
      .where(eq(spots.status, "approved"))
      .groupBy(spots.neighborhood);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      // Normalize to the slug format used in NEIGHBORHOODS
      // e.g. "Back Bay" → "back-bay", "Cambridge / Somerville" → "cambridge-somerville"
      const key = row.neighborhood
        .toLowerCase()
        .replace(/\s*\/\s*/g, "-")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      counts[key] = (counts[key] ?? 0) + row.cnt;
    }
    return counts;
  } catch (error) {
    console.error("Failed to get spot counts:", error);
    return {};
  }
}

// ─── Community Happenings ─────────────────────────────────────────────────────

export async function submitHappening(data: {
  title: string;
  description: string;
  neighborhood: string;
  dateLabel: string;
  startDate?: string;
  endDate?: string;
  emoji: string;
  url?: string;
  submittedByFid: number;
  submittedByUsername: string;
  submittedByDisplayName: string;
  submittedByPfpUrl?: string;
}) {
  try {
    if (!(await verifyFid(data.submittedByFid))) {
      return { success: false, error: "Could not verify Farcaster identity" };
    }
    const id = randomUUID();
    await db.insert(communityHappenings).values({
      id,
      title: data.title,
      description: data.description,
      neighborhood: data.neighborhood,
      dateLabel: data.dateLabel,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      emoji: data.emoji,
      url: data.url ?? null,
      submittedByFid: data.submittedByFid,
      submittedByUsername: data.submittedByUsername,
      submittedByDisplayName: data.submittedByDisplayName,
      submittedByPfpUrl: data.submittedByPfpUrl ?? null,
      status: "approved",
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to submit happening:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getCommunityHappenings(limit: number = 20) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const rows = await db
      .select()
      .from(communityHappenings)
      .where(
        and(
          eq(communityHappenings.status, "approved"),
          or(
            isNull(communityHappenings.endDate),
            gte(communityHappenings.endDate, todayStr)
          )
        )
      )
      .orderBy(desc(communityHappenings.createdAt))
      .limit(limit);

    return rows;
  } catch (error) {
    console.error("Failed to get community happenings:", error);
    return [];
  }
}

// ─── Builders ────────────────────────────────────────────────────────────────

export async function getBuilders() {
  try {
    return await db
      .select()
      .from(builders)
      .orderBy(desc(builders.featured), desc(builders.createdAt));
  } catch (error) {
    console.error("Failed to get builders:", error);
    return [];
  }
}

export async function getFeaturedBuilder() {
  try {
    const result = await db
      .select()
      .from(builders)
      .where(eq(builders.featured, true))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("Failed to get featured builder:", error);
    return null;
  }
}

export async function getBuildersWithSpotCounts(): Promise<(Builder & { spotCount: number })[]> {
  try {
    // Fetch both in parallel — no dependency between them
    const [allBuilders, spotCountRows] = await Promise.all([
      db
        .select()
        .from(builders)
        .orderBy(desc(builders.featured), desc(builders.createdAt)),
      db
        .select({ fid: spots.submittedByFid, cnt: count(spots.id) })
        .from(spots)
        .where(eq(spots.status, "approved"))
        .groupBy(spots.submittedByFid),
    ]);

    const spotCounts: Record<number, number> = {};
    for (const row of spotCountRows) {
      spotCounts[row.fid] = row.cnt;
    }

    return allBuilders.map((b) => ({
      ...parseBuilderRow(b as unknown as Record<string, unknown>),
      spotCount: spotCounts[b.fid] ?? 0,
    }));
  } catch (error) {
    console.error("Failed to get builders with spot counts:", error);
    return [];
  }
}

export async function getFilteredBuilders(opts?: {
  category?: string;
  neighborhood?: string;
}): Promise<(Builder & { spotCount: number })[]> {
  try {
    const allBuilders = await getBuildersWithSpotCounts();

    return allBuilders.filter((b) => {
      const catOk = !opts?.category || opts.category === "All" || b.category === opts.category || b.categories?.includes(opts.category);
      const nbrOk = !opts?.neighborhood || opts.neighborhood === "All" || b.neighborhood === opts.neighborhood;
      return catOk && nbrOk;
    });
  } catch (error) {
    console.error("Failed to get filtered builders:", error);
    return [];
  }
}

export async function joinBuilderDirectory(data: {
  fid: number;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  projectName?: string;
  projectLinks?: string[];
  categories?: string[];
  talkAbout?: string;
  neighborhood: string;
  category: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!(await verifyFid(data.fid))) {
      return { success: false, error: "Could not verify Farcaster identity" };
    }
    // Guard: prevent duplicate registrations
    const existing = await db
      .select()
      .from(builders)
      .where(eq(builders.fid, data.fid))
      .limit(1);
    if (existing.length > 0) {
      return { success: true, id: existing[0].id }; // idempotent — already in
    }

    const id = randomUUID();
    await db.insert(builders).values({
      id,
      fid: data.fid,
      displayName: data.displayName,
      username: data.username,
      avatarUrl: data.avatarUrl ?? null,
      bio: data.bio ?? null,
      projectName: data.projectName ?? null,
      projectUrl: data.projectLinks?.[0] ?? null,
      projectLinks: data.projectLinks?.length ? JSON.stringify(data.projectLinks) : null,
      categories: data.categories?.length ? JSON.stringify(data.categories) : null,
      talkAbout: data.talkAbout ?? null,
      neighborhood: data.neighborhood,
      category: data.category,
      featured: false,
      verified: false,
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to join builder directory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateBuilder(
  fid: number,
  data: {
    bio?: string;
    projectName?: string;
    projectLinks?: string[];
    categories?: string[];
    talkAbout?: string;
    neighborhood?: string;
    category?: string;
    [key: string]: unknown;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(builders)
      .set({
        bio: data.bio ?? null,
        projectName: data.projectName ?? null,
        projectUrl: data.projectLinks?.[0] ?? null,
        projectLinks: data.projectLinks?.length ? JSON.stringify(data.projectLinks) : null,
        categories: data.categories?.length ? JSON.stringify(data.categories) : null,
        talkAbout: data.talkAbout ?? null,
        neighborhood: data.neighborhood ?? undefined,
        category: data.category ?? undefined,
      })
      .where(eq(builders.fid, fid));
    return { success: true };
  } catch (error) {
    console.error("Failed to update builder:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function isBuilderInDirectory(fid: number): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(builders)
      .where(eq(builders.fid, fid))
      .limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("Failed to check builder directory:", error);
    return false;
  }
}

export async function getBuilderByFid(fid: number): Promise<Builder | null> {
  try {
    const result = await db
      .select()
      .from(builders)
      .where(eq(builders.fid, fid))
      .limit(1);
    return result[0] ? parseBuilderRow(result[0] as unknown as Record<string, unknown>) : null;
  } catch (error) {
    console.error("Failed to get builder by FID:", error);
    return null;
  }
}

export async function getSpotsByBuilder(fid: number, limit: number = 5): Promise<Spot[]> {
  try {
    return (await db
      .select()
      .from(spots)
      .where(and(eq(spots.submittedByFid, fid), eq(spots.status, "approved")))
      .orderBy(desc(spots.createdAt))
      .limit(limit)) as Spot[];
  } catch (error) {
    console.error("Failed to get spots by builder:", error);
    return [];
  }
}

export async function getSpotsByNeighborhood(neighborhoodName: string, limit: number = 100): Promise<Spot[]> {
  try {
    return (await db
      .select()
      .from(spots)
      .where(and(eq(spots.neighborhood, neighborhoodName), eq(spots.status, "approved")))
      .orderBy(desc(spots.createdAt))
      .limit(limit)) as Spot[];
  } catch (error) {
    console.error("Failed to get spots by neighborhood:", error);
    return [];
  }
}

// ─── Submission error logging ─────────────────────────────────────────────────

export async function logSubmissionError(data: {
  type: string;
  payload: string;
  errorMessage: string;
  userFid: number;
}) {
  try {
    await db.insert(submissionErrors).values({
      id: randomUUID(),
      type: data.type,
      payload: data.payload,
      errorMessage: data.errorMessage,
      userFid: data.userFid,
    });
  } catch (err) {
    console.error("Failed to log submission error:", err);
  }
}

export async function getSubmissionErrors(limit: number = 50, callerFid?: number) {
  if (!callerFid || !(await verifyAdmin(callerFid))) return [];
  try {
    return await db
      .select()
      .from(submissionErrors)
      .orderBy(desc(submissionErrors.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to get submission errors:", error);
    return [];
  }
}

// ─── Admin: Pending spots / happenings ────────────────────────────────────────

export async function getPendingSpots(callerFid?: number) {
  if (!callerFid || !(await verifyAdmin(callerFid))) return [];
  try {
    return await db
      .select()
      .from(spots)
      .where(eq(spots.status, "pending"))
      .orderBy(desc(spots.createdAt));
  } catch (error) {
    console.error("Failed to get pending spots:", error);
    return [];
  }
}

export async function approveSpot(id: string, callerFid?: number) {
  if (!callerFid || !(await verifyAdmin(callerFid))) return { success: false, error: "Not authorized" };
  try {
    await db.update(spots).set({ status: "approved" }).where(eq(spots.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to approve spot:", error);
    return { success: false };
  }
}

export async function rejectSpot(id: string, callerFid?: number) {
  if (!callerFid || !(await verifyAdmin(callerFid))) return { success: false, error: "Not authorized" };
  try {
    await db.update(spots).set({ status: "rejected" }).where(eq(spots.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to reject spot:", error);
    return { success: false };
  }
}

// ─── Admin: Community happenings moderation ──────────────────────────────────

export async function adminListAllCommunityHappenings(adminFid: number, limit: number = 50) {
  if (!(await verifyAdmin(adminFid))) return [];
  try {
    return await db
      .select()
      .from(communityHappenings)
      .orderBy(desc(communityHappenings.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to list community happenings:", error);
    return [];
  }
}

export async function adminDeleteCommunityHappening(adminFid: number, id: string) {
  if (!(await verifyAdmin(adminFid))) return { success: false, error: "Not authorized" };
  try {
    await db.delete(communityHappenings).where(eq(communityHappenings.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete community happening:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// ─── One-time migrations ──────────────────────────────────────────────────────

/**
 * Fix spots that were seeded with FID 0 (placeholder before genuinejack's real FID
 * was known). Updates submittedByFid and submittedByPfpUrl for all spots where
 * submittedByUsername is "genuinejack" and submittedByFid is still 0.
 *
 * Safe to call multiple times — only touches rows that still have FID 0.
 */
export async function migrateSpotsFid(): Promise<{ updated: number; error?: string }> {
  const GENUINEJACK_FID = 218957;
  const GENUINEJACK_PFP =
    "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/533a424d-d6f8-4c6a-30ec-7658555db700/original";

  try {
    // Find all spots still attributed to FID 0 with username "genuinejack"
    const toFix = await db
      .select({ id: spots.id })
      .from(spots)
      .where(and(eq(spots.submittedByFid, 0), eq(spots.submittedByUsername, "genuinejack")));

    if (toFix.length === 0) return { updated: 0 };

    await db
      .update(spots)
      .set({ submittedByFid: GENUINEJACK_FID, submittedByPfpUrl: GENUINEJACK_PFP })
      .where(and(eq(spots.submittedByFid, 0), eq(spots.submittedByUsername, "genuinejack")));

    console.log(`[migration] migrateSpotsFid: updated ${toFix.length} rows`);
    return { updated: toFix.length };
  } catch (error) {
    console.error("migrateSpotsFid failed:", error);
    return { updated: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Backfill the `link` column for seeded spots that have a null link but a known
 * URL in the seed CSV. Uses a static map keyed by spot id so this never needs
 * to read the filesystem at runtime.
 *
 * Safe to call multiple times — only updates rows where link IS NULL.
 */
export async function migrateSpotsLinks(): Promise<{ updated: number; error?: string }> {
  // Static link map built from spots_seed.csv
  const SEED_LINKS: Record<string, string> = {
    "a1b2c3d4-e5f6-7890-abcd-ef1234567801": "https://www.tattebakery.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567802": "https://flourbakery.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567803": "https://row34.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567804": "https://beehiveboston.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567805": "https://fenwayvictorygardens.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567806": "https://mikeandpattys.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567807": "https://pavementcoffeehouse.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567808": "https://sportelloboston.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567809": "https://reginapizzeria.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567810": "https://tridentbookscafe.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567813": "https://arboretum.harvard.edu",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567814": "https://harpoonbrewery.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567815": "https://brattlebookshop.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567816": "https://thegallowsboston.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567817": "https://icaboston.org",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567818": "https://lamplighterbrewing.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567820": "https://oleanarestaurant.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567824": "https://southendbuttery.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567825": "https://newburycomics.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567827": "https://areafour.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567828": "https://coppaboston.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567829": "https://tastyburger.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567831": "https://mfa.org",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567832": "https://notchbrewing.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567834": "https://sofrabakery.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567836": "https://haleyhouse.org",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567838": "https://broadsheetcoffee.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567839": "https://blackbirddoughnuts.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567840": "https://legalseafoods.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567842": "https://bpl.org",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567844": "https://oyarestaurantgroup.com",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567845": "https://hourlyoyster.com",
  };

  try {
    // Only touch rows where link is currently null
    const nullLinkSpots = await db
      .select({ id: spots.id })
      .from(spots)
      .where(isNull(spots.link));

    let updated = 0;
    for (const row of nullLinkSpots) {
      const link = SEED_LINKS[row.id];
      if (link) {
        await db.update(spots).set({ link }).where(eq(spots.id, row.id));
        updated++;
      }
    }

    console.log(`[migration] migrateSpotsLinks: updated ${updated} rows`);
    return { updated };
  } catch (error) {
    console.error("migrateSpotsLinks failed:", error);
    return { updated: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

/** @deprecated Use joinBuilderDirectory instead — this bypasses the duplicate check */
export async function addBuilder(data: {
  fid: number;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  projectName?: string;
  projectUrl?: string;
  neighborhood?: string;
  category?: string;
  featured?: boolean;
  verified?: boolean;
}) {
  try {
    const id = randomUUID();
    await db.insert(builders).values({
      id,
      fid: data.fid,
      displayName: data.displayName,
      username: data.username,
      avatarUrl: data.avatarUrl ?? null,
      bio: data.bio ?? null,
      projectName: data.projectName ?? null,
      projectUrl: data.projectUrl ?? null,
      neighborhood: data.neighborhood ?? null,
      category: data.category ?? null,
      featured: data.featured ?? false,
      verified: data.verified ?? false,
    });
    return { success: true, id };
  } catch (error) {
    console.error("Failed to add builder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── Tourist Picks ───────────────────────────────────────────────────────────

export async function toggleTouristPick(spotId: string, touristPick: boolean, adminFid: number) {
  verifyAdmin(adminFid);
  await db.update(spots).set({ touristPick }).where(eq(spots.id, spotId));
  return { success: true };
}
