import { pgTable, text, integer, boolean, timestamp, real, serial } from "drizzle-orm/pg-core";

/**
 * Key-Value Store Table
 *
 * Built-in table for simple key-value storage.
 * Available immediately without schema changes.
 *
 * ⚠️ CRITICAL: DO NOT DELETE OR EDIT THIS TABLE DEFINITION ⚠️
 * This table is required for the app to function properly.
 * DO NOT delete, modify, rename, or change any part of this table.
 * Removing or editing it will cause database schema conflicts and prevent
 * the app from starting.
 *
 * Use for:
 * - User preferences/settings
 * - App configuration
 * - Simple counters
 * - Temporary data
 */
export const kv = pgTable("kv", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/**
 * Spots table — community-submitted spots in Boston
 */
export const spots = pgTable("spots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  neighborhood: text("neighborhood").notNull(),
  description: text("description").notNull(),
  address: text("address"),
  link: text("link"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  submittedByFid: integer("submitted_by_fid").notNull(),
  submittedByUsername: text("submitted_by_username").notNull(),
  submittedByDisplayName: text("submitted_by_display_name").notNull(),
  submittedByPfpUrl: text("submitted_by_pfp_url"),
  featured: boolean("featured").default(false).notNull(),
  status: text("status").default("approved").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  touristPick: boolean("tourist_pick").default(false).notNull(),
});

/**
 * Community happenings — user-submitted events in the Today tab
 */
export const communityHappenings = pgTable("community_happenings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  neighborhood: text("neighborhood").notNull(),
  dateLabel: text("date_label").notNull(),      // e.g. "This Saturday", "April 12"
  startDate: text("start_date"),                // ISO date YYYY-MM-DD (optional)
  endDate: text("end_date"),                    // ISO date YYYY-MM-DD (optional, for multi-day)
  emoji: text("emoji").notNull().default("📅"),
  url: text("url"),
  submittedByFid: integer("submitted_by_fid").notNull(),
  submittedByUsername: text("submitted_by_username").notNull(),
  submittedByDisplayName: text("submitted_by_display_name").notNull(),
  submittedByPfpUrl: text("submitted_by_pfp_url"),
  status: text("status").default("approved").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Builders table — Farcaster users in the Boston community
 */
export const builders = pgTable("builders", {
  id: text("id").primaryKey(),
  fid: integer("fid").notNull(),
  displayName: text("display_name").notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  projectName: text("project_name"),
  projectUrl: text("project_url"),
  neighborhood: text("neighborhood"),
  category: text("category"),
  // New multi-value fields (JSON-encoded string arrays)
  projectLinks: text("project_links"), // JSON string: string[]
  categories: text("categories"),       // JSON string: string[]
  talkAbout: text("talk_about"),
  featured: boolean("featured").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Submission errors table — logs failed form submissions for admin review
 */
export const submissionErrors = pgTable("submission_errors", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // "spot" | "happening" | "builder"
  payload: text("payload").notNull(), // JSON stringified form data
  errorMessage: text("error_message").notNull(),
  userFid: integer("user_fid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Dispatch table — daily AI-generated editorial newsletter
 */
export const dispatch = pgTable("dispatch", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD, unique per day
  content: text("content").notNull(),    // JSON string of structured dispatch
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  adminOverride: boolean("admin_override").default(false).notNull(),
});

/**
 * Dispatch poll responses — one row per vote on the daily dispatch poll
 */
export const dispatchPollResponses = pgTable("dispatch_poll_responses", {
  id: serial("id").primaryKey(),
  dispatchDate: text("dispatch_date").notNull(),  // "2026-04-26"
  option: text("option").notNull(),               // The option text selected
  fid: text("fid"),                               // Farcaster FID if authenticated, null if anonymous
  createdAt: timestamp("created_at").defaultNow(),
});
