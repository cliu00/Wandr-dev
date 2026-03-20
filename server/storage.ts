import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  anonymousSessions,
  trips,
  itineraryVersions,
  groupTrips,
  groupParticipants,
  type User,
  type InsertUser,
  type AnonymousSession,
  type Trip,
  type InsertTrip,
  type ItineraryVersion,
  type InsertItineraryVersion,
  type GroupTrip,
  type InsertGroupTrip,
  type GroupParticipant,
  type InsertGroupParticipant,
} from "@shared/schema";
import { randomUUID } from "crypto";

const ANON_SESSION_MAX_GENERATIONS = 2;
const ANON_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Anonymous sessions
  getOrCreateAnonymousSession(sessionId: string): Promise<AnonymousSession>;
  isGenerationAllowed(sessionId: string): Promise<boolean>;
  incrementGenerationCount(sessionId: string): Promise<void>;

  // Trips
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: string): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
  markTripFailed(id: string): Promise<void>;
  updateTripGroupType(id: string, groupType: string): Promise<void>;
  updateTripName(id: string, tripName: string): Promise<void>;
  claimTrip(id: string, userId: string): Promise<void>;

  // Itinerary versions
  createItineraryVersion(version: InsertItineraryVersion): Promise<ItineraryVersion>;
  getLatestItineraryVersion(tripId: string): Promise<ItineraryVersion | undefined>;
  getItineraryByHash(preferenceHash: string): Promise<ItineraryVersion | undefined>;
  getAllItineraryVersions(tripId: string): Promise<ItineraryVersion[]>;

  // Group trips
  createGroupTrip(data: InsertGroupTrip): Promise<GroupTrip>;
  getGroupTrip(id: string): Promise<GroupTrip | undefined>;
  updateGroupTripStatus(id: string, status: string): Promise<void>;
  linkGroupTripToTrip(id: string, tripId: string): Promise<void>;

  // Group participants
  createParticipant(data: InsertGroupParticipant): Promise<GroupParticipant>;
  getParticipantByToken(token: string): Promise<GroupParticipant | undefined>;
  getParticipantsByGroup(groupTripId: string): Promise<GroupParticipant[]>;
  updateParticipantResponse(token: string, preferences: Record<string, any>): Promise<void>;

  // Extra group trip lookups
  getGroupTripByTripId(tripId: string): Promise<GroupTrip | undefined>;
}

// ─── Database Storage ─────────────────────────────────────────────────────────

export class DatabaseStorage implements IStorage {

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getTripsByUser(userId: string): Promise<Trip[]> {
    return db
      .select()
      .from(trips)
      .where(and(eq(trips.userId, userId), eq(trips.generationFailed, false)))
      .orderBy(desc(trips.createdAt));
  }

  async markTripFailed(id: string): Promise<void> {
    await db
      .update(trips)
      .set({ generationFailed: true, updatedAt: new Date() })
      .where(eq(trips.id, id));
  }

  async updateTripGroupType(id: string, groupType: string): Promise<void> {
    await db
      .update(trips)
      .set({ groupType: groupType as any, updatedAt: new Date() })
      .where(eq(trips.id, id));
  }

  async updateTripName(id: string, tripName: string): Promise<void> {
    await db
      .update(trips)
      .set({ tripName, updatedAt: new Date() })
      .where(eq(trips.id, id));
  }

  async claimTrip(id: string, userId: string): Promise<void> {
    await db
      .update(trips)
      .set({ userId, anonymousSessionId: null, updatedAt: new Date() })
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

  // ── Group Trips ────────────────────────────────────────────────────────────

  async createGroupTrip(data: InsertGroupTrip): Promise<GroupTrip> {
    const [created] = await db.insert(groupTrips).values(data).returning();
    return created;
  }

  async getGroupTrip(id: string): Promise<GroupTrip | undefined> {
    const [groupTrip] = await db
      .select()
      .from(groupTrips)
      .where(eq(groupTrips.id, id));
    return groupTrip;
  }

  async updateGroupTripStatus(id: string, status: string): Promise<void> {
    await db
      .update(groupTrips)
      .set({ status })
      .where(eq(groupTrips.id, id));
  }

  async linkGroupTripToTrip(id: string, tripId: string): Promise<void> {
    await db
      .update(groupTrips)
      .set({ tripId, status: "complete" })
      .where(eq(groupTrips.id, id));
  }

  // ── Group Participants ─────────────────────────────────────────────────────

  async createParticipant(data: InsertGroupParticipant): Promise<GroupParticipant> {
    const [created] = await db.insert(groupParticipants).values(data).returning();
    return created;
  }

  async getParticipantByToken(token: string): Promise<GroupParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(groupParticipants)
      .where(eq(groupParticipants.token, token));
    return participant;
  }

  async getParticipantsByGroup(groupTripId: string): Promise<GroupParticipant[]> {
    return db
      .select()
      .from(groupParticipants)
      .where(eq(groupParticipants.groupTripId, groupTripId))
      .orderBy(groupParticipants.createdAt);
  }

  async updateParticipantResponse(token: string, preferences: Record<string, any>): Promise<void> {
    await db
      .update(groupParticipants)
      .set({ preferences, responded: true })
      .where(eq(groupParticipants.token, token));
  }

  async getGroupTripByTripId(tripId: string): Promise<GroupTrip | undefined> {
    const [groupTrip] = await db
      .select()
      .from(groupTrips)
      .where(eq(groupTrips.tripId, tripId));
    return groupTrip;
  }
}

export const storage = new DatabaseStorage();
