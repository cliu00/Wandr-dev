import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  anonymousSessions,
  trips,
  itineraryVersions,
  type User,
  type InsertUser,
  type AnonymousSession,
  type Trip,
  type InsertTrip,
  type ItineraryVersion,
  type InsertItineraryVersion,
} from "@shared/schema";
import { randomUUID } from "crypto";

const ANON_SESSION_MAX_GENERATIONS = 2;
const ANON_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Anonymous sessions
  getOrCreateAnonymousSession(sessionId: string): Promise<AnonymousSession>;
  isGenerationAllowed(sessionId: string): Promise<boolean>;
  incrementGenerationCount(sessionId: string): Promise<void>;

  // Trips
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: string): Promise<Trip | undefined>;
  markTripFailed(id: string): Promise<void>;

  // Itinerary versions
  createItineraryVersion(version: InsertItineraryVersion): Promise<ItineraryVersion>;
  getLatestItineraryVersion(tripId: string): Promise<ItineraryVersion | undefined>;
  getItineraryByHash(preferenceHash: string): Promise<ItineraryVersion | undefined>;
  getAllItineraryVersions(tripId: string): Promise<ItineraryVersion[]>;
}

// ─── Database Storage ─────────────────────────────────────────────────────────

export class DatabaseStorage implements IStorage {

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // ── Anonymous Sessions ─────────────────────────────────────────────────────

  async getOrCreateAnonymousSession(sessionId: string): Promise<AnonymousSession> {
    const [existing] = await db
      .select()
      .from(anonymousSessions)
      .where(eq(anonymousSessions.sessionId, sessionId));

    if (existing) return existing;

    const expiresAt = new Date(Date.now() + ANON_SESSION_TTL_MS);
    const [created] = await db
      .insert(anonymousSessions)
      .values({ sessionId, generationCount: 0, expiresAt })
      .returning();
    return created;
  }

  async isGenerationAllowed(sessionId: string): Promise<boolean> {
    const session = await this.getOrCreateAnonymousSession(sessionId);
    const now = new Date();
    // Expired sessions are treated as fresh (limit resets after 24h)
    if (session.expiresAt < now) return true;
    return session.generationCount < ANON_SESSION_MAX_GENERATIONS;
  }

  async incrementGenerationCount(sessionId: string): Promise<void> {
    const session = await this.getOrCreateAnonymousSession(sessionId);
    const now = new Date();

    // If session expired, reset count and extend expiry
    if (session.expiresAt < now) {
      await db
        .update(anonymousSessions)
        .set({ generationCount: 1, expiresAt: new Date(Date.now() + ANON_SESSION_TTL_MS) })
        .where(eq(anonymousSessions.sessionId, sessionId));
      return;
    }

    await db
      .update(anonymousSessions)
      .set({ generationCount: session.generationCount + 1 })
      .where(eq(anonymousSessions.sessionId, sessionId));
  }

  // ── Trips ──────────────────────────────────────────────────────────────────

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [created] = await db.insert(trips).values(trip).returning();
    return created;
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async markTripFailed(id: string): Promise<void> {
    await db
      .update(trips)
      .set({ generationFailed: true, updatedAt: new Date() })
      .where(eq(trips.id, id));
  }

  // ── Itinerary Versions ─────────────────────────────────────────────────────

  async createItineraryVersion(version: InsertItineraryVersion): Promise<ItineraryVersion> {
    const [created] = await db
      .insert(itineraryVersions)
      .values(version)
      .returning();

    // Bump current_version on the parent trip
    await db
      .update(trips)
      .set({ currentVersion: version.versionNumber, updatedAt: new Date() })
      .where(eq(trips.id, version.tripId));

    return created;
  }

  async getLatestItineraryVersion(tripId: string): Promise<ItineraryVersion | undefined> {
    const trip = await this.getTrip(tripId);
    if (!trip) return undefined;

    const [version] = await db
      .select()
      .from(itineraryVersions)
      .where(
        and(
          eq(itineraryVersions.tripId, tripId),
          eq(itineraryVersions.versionNumber, trip.currentVersion)
        )
      );
    return version;
  }

  async getItineraryByHash(preferenceHash: string): Promise<ItineraryVersion | undefined> {
    // Returns the most recent itinerary generated from identical preferences.
    // Used to skip the AI call and copy the itinerary data to a new trip.
    const [version] = await db
      .select()
      .from(itineraryVersions)
      .where(eq(itineraryVersions.preferenceHash, preferenceHash))
      .orderBy(desc(itineraryVersions.createdAt))
      .limit(1);
    return version;
  }

  async getAllItineraryVersions(tripId: string): Promise<ItineraryVersion[]> {
    return db
      .select()
      .from(itineraryVersions)
      .where(eq(itineraryVersions.tripId, tripId))
      .orderBy(desc(itineraryVersions.versionNumber));
  }
}

export const storage = new DatabaseStorage();
