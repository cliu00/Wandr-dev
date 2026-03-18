import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateItinerary, hashPreferences, type IntakePreferences } from "./services/ai";
import { z } from "zod";

// ─── Validation Schema ────────────────────────────────────────────────────────

const createTripSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string().optional(),
  durationDays: z.number().int().min(1).max(4),
  groupType: z.enum(["solo", "duo", "group", "family"]),
  energy: z.number().min(0).max(100),
  budget: z.enum(["under-100", "100-200", "200-350", "350-plus"]),
  activityTypes: z.array(z.string()).default([]),
  food: z.array(z.string()).default([]),
  anchorActivity: z.string().optional(),
  activityNotes: z.string().optional(),
  dietaryNotes: z.string().optional(),
  soloVibe: z.string().nullable().optional(),
  duoStyle: z.string().nullable().optional(),
  groupDynamic: z.string().nullable().optional(),
  kidsAges: z.array(z.string()).default([]),
  familyNeeds: z.array(z.string()).default([]),
});

// ─── Helper: get session ID from request ──────────────────────────────────────

function getSessionId(req: Request): string {
  // Express session ID — guaranteed to exist after session middleware is set up.
  // For now we fall back to a header for local testing without session middleware.
  return (req.session as any)?.id ?? req.headers["x-session-id"] as string ?? "anonymous";
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── POST /api/trips/create ─────────────────────────────────────────────────
  // Accepts intake form preferences, generates an itinerary via Claude,
  // stores it, and returns the trip ID for the client to navigate to.

  app.post("/api/trips/create", async (req: Request, res: Response) => {
    // 1. Validate the request body
    const parsed = createTripSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid preferences",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const preferences: IntakePreferences = parsed.data;
    const sessionId = getSessionId(req);
    const isAuthenticated = !!(req.session as any)?.userId;

    // 2. Check generation limit for anonymous users
    if (!isAuthenticated) {
      const allowed = await storage.isGenerationAllowed(sessionId);
      if (!allowed) {
        return res.status(429).json({
          message: "Generation limit reached",
          hint: "Sign up to generate unlimited itineraries.",
        });
      }
    }

    // 3. Hash the preferences — check if identical itinerary already exists
    const preferenceHash = hashPreferences(preferences);
    const existingVersion = await storage.getItineraryByHash(preferenceHash);

    let itineraryData: any;
    let usedCache = false;

    if (existingVersion) {
      // Cache hit — reuse itinerary data, skip the AI call
      itineraryData = existingVersion.itineraryData;
      usedCache = true;
    } else {
      // Cache miss — call Claude
      try {
        const result = await generateItinerary(preferences);
        itineraryData = result.itineraryData;
      } catch (err: any) {
        console.error("AI generation failed:", err);
        return res.status(500).json({
          message: "Failed to generate itinerary. Please try again.",
        });
      }

      // Only count against the limit when we actually called the AI
      if (!isAuthenticated) {
        await storage.incrementGenerationCount(sessionId);
      }
    }

    // 4. Create the trip row
    const trip = await storage.createTrip({
      destination: preferences.destination,
      startDate: preferences.startDate,
      durationDays: preferences.durationDays,
      groupType: preferences.groupType,
      preferences: preferences as any,
      userId: isAuthenticated ? (req.session as any).userId : null,
      anonymousSessionId: isAuthenticated ? null : sessionId,
    });

    // 5. Store the itinerary version
    await storage.createItineraryVersion({
      tripId: trip.id,
      versionNumber: 1,
      itineraryData: itineraryData as any,
      preferenceHash,
      generatedBy: "solo",
    });

    return res.status(201).json({
      tripId: trip.id,
      usedCache,
    });
  });

  // ── GET /api/trips/:id ─────────────────────────────────────────────────────
  // Returns the trip metadata and its current (latest) itinerary version.

  app.get("/api/trips/:id", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;

    const trip = await storage.getTrip(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const version = await storage.getLatestItineraryVersion(id);
    if (!version) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    return res.json({
      trip,
      itinerary: version.itineraryData,
      versionNumber: version.versionNumber,
      generatedAt: version.createdAt,
    });
  });

  // ── GET /api/trips/:id/versions ────────────────────────────────────────────
  // Returns all itinerary versions for a trip (for future version history UI).

  app.get("/api/trips/:id/versions", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;

    const trip = await storage.getTrip(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const versions = await storage.getAllItineraryVersions(id);
    return res.json({ versions });
  });

  return httpServer;
}
