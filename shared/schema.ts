import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── Anonymous Sessions ───────────────────────────────────────────────────────
// Tracks how many AI generations an anonymous session has used.
// Resets naturally when the session expires after 24 hours.

export const anonymousSessions = pgTable("anonymous_sessions", {
  sessionId: varchar("session_id").primaryKey(),
  generationCount: integer("generation_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type AnonymousSession = typeof anonymousSessions.$inferSelect;

// ─── Trips ────────────────────────────────────────────────────────────────────
// One row per trip planning session. Belongs to either an authenticated user
// or an anonymous session (one of user_id / anonymous_session_id will be set).

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),                      // null for anonymous users
  anonymousSessionId: varchar("anonymous_session_id"), // null for auth users
  destination: varchar("destination").notNull(),
  startDate: varchar("start_date"),
  durationDays: integer("duration_days").notNull(),
  groupType: varchar("group_type").notNull(),       // solo | duo | group | family
  preferences: jsonb("preferences").notNull(),      // full intake form payload
  currentVersion: integer("current_version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  currentVersion: true,
  createdAt: true,
  updatedAt: true,
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

// ─── Itinerary Versions ───────────────────────────────────────────────────────
// Every AI generation creates a new version row. Trips are never overwritten.
// preference_hash allows us to skip the AI call and reuse itinerary data when
// the same preferences are submitted by a different user.

export const itineraryVersions = pgTable(
  "itinerary_versions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tripId: varchar("trip_id").notNull().references(() => trips.id),
    versionNumber: integer("version_number").notNull().default(1),
    itineraryData: jsonb("itinerary_data").notNull(), // full itinerary JSON
    preferenceHash: varchar("preference_hash").notNull(), // SHA-256 of preferences
    generatedBy: varchar("generated_by").notNull().default("solo"), // solo | participant name
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_itinerary_versions_trip_id").on(table.tripId),
    index("idx_itinerary_versions_preference_hash").on(table.preferenceHash),
  ]
);

export const insertItineraryVersionSchema = createInsertSchema(itineraryVersions).omit({
  id: true,
  createdAt: true,
});

export type ItineraryVersion = typeof itineraryVersions.$inferSelect;
export type InsertItineraryVersion = z.infer<typeof insertItineraryVersionSchema>;
