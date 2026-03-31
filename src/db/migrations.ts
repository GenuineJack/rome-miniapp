"server-only";

import { sql } from "drizzle-orm";
import { db } from "@/neynar-db-sdk/db";

/**
 * Schema migrations — runs automatically on server startup via instrumentation.ts
 *
 * Each migration is idempotent (IF NOT EXISTS / IF EXISTS guards).
 * Safe to run multiple times.
 */
export async function runMigrations() {
  const migrations: string[] = [
    // spots: ensure the `link` column exists (was previously `url` in older deploys)
    `ALTER TABLE spots ADD COLUMN IF NOT EXISTS link text`,

    // spots: drop the old `url` column if it still exists from a previous deploy
    `ALTER TABLE spots DROP COLUMN IF EXISTS url`,

    // builders: ensure optional profile columns exist
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS bio text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS project_name text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS project_url text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS neighborhood text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS category text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false`,

    // community_happenings: create table if it doesn't exist (safety net for fresh deploys)
    `CREATE TABLE IF NOT EXISTS community_happenings (
      id text PRIMARY KEY,
      title text NOT NULL,
      description text NOT NULL,
      neighborhood text NOT NULL,
      date_label text NOT NULL,
      start_date text,
      end_date text,
      emoji text NOT NULL DEFAULT '📅',
      url text,
      submitted_by_fid integer NOT NULL,
      submitted_by_username text NOT NULL,
      submitted_by_display_name text NOT NULL,
      submitted_by_pfp_url text,
      status text DEFAULT 'approved' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )`,

    // community_happenings: ensure optional columns exist (safety net for older deploys)
    `ALTER TABLE community_happenings ADD COLUMN IF NOT EXISTS start_date text`,
    `ALTER TABLE community_happenings ADD COLUMN IF NOT EXISTS end_date text`,
    `ALTER TABLE community_happenings ADD COLUMN IF NOT EXISTS url text`,

    // builders: multi-value fields
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS project_links text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS categories text`,
    `ALTER TABLE builders ADD COLUMN IF NOT EXISTS talk_about text`,

    // Migrate existing single category → categories JSON array and projectUrl → projectLinks
    // Only runs on rows that still have old single values and empty new fields
    `UPDATE builders SET categories = CONCAT('["', category, '"]') WHERE category IS NOT NULL AND (categories IS NULL OR categories = '')`,
    `UPDATE builders SET project_links = CONCAT('["', project_url, '"]') WHERE project_url IS NOT NULL AND project_url != '' AND (project_links IS NULL OR project_links = '')`,

    // submission_errors: create table
    `CREATE TABLE IF NOT EXISTS submission_errors (
      id text PRIMARY KEY,
      type text NOT NULL,
      payload text NOT NULL,
      error_message text NOT NULL,
      user_fid integer,
      created_at timestamp DEFAULT now() NOT NULL
    )`,
  ];

  let applied = 0;
  for (const migration of migrations) {
    try {
      await db.execute(sql.raw(migration));
      applied++;
    } catch (e) {
      // Log but don't throw — a single migration failure shouldn't crash the app
      console.warn("[migrations] Warning on migration:", migration, e);
    }
  }

  console.log(`[migrations] Done — ${applied}/${migrations.length} migrations applied.`);
}
