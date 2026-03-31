import { pgTable, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";

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
  featured: boolean("featured").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
