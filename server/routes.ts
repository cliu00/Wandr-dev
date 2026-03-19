import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateItinerary, hashPreferences, type IntakePreferences } from "./services/ai";
import { z } from "zod";

// ─── Validation Schema ────────────────────────────────────────────────────────

const createTripSchema = z.object({
  destination: z.string().default(""),
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
  // Accepts intake form preferences, creates the trip row immediately, fires
  // AI generation in the background, and returns { tripId } right away.
  // The client should poll GET /api/trips/:id until status === "ready".

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

    // 3. Create the trip row immediately so we have an ID to return
    const trip = await storage.createTrip({
      destination: preferences.destination,
      startDate: preferences.startDate,
      durationDays: preferences.durationDays,
      groupType: preferences.groupType,
      preferences: preferences as any,
      userId: isAuthenticated ? (req.session as any).userId : null,
      anonymousSessionId: isAuthenticated ? null : sessionId,
    });

    // 4. Return immediately — client will poll GET /api/trips/:id
    res.status(201).json({ tripId: trip.id });

    // 5. Fire AI generation in the background (after response is sent)
    const preferenceHash = hashPreferences(preferences);

    (async () => {
      try {
        const existingVersion = await storage.getItineraryByHash(preferenceHash);

        let itineraryData: any;
        if (existingVersion) {
          // Cache hit — reuse itinerary data, no AI call needed
          itineraryData = existingVersion.itineraryData;
        } else {
          // Cache miss — call Claude
          const result = await generateItinerary(preferences);
          itineraryData = result.itineraryData;

          // Only count against the limit when we actually called the AI
          if (!isAuthenticated) {
            await storage.incrementGenerationCount(sessionId);
          }
        }

        await storage.createItineraryVersion({
          tripId: trip.id,
          versionNumber: 1,
          itineraryData: itineraryData as any,
          preferenceHash,
          generatedBy: "solo",
        });
      } catch (err: any) {
        console.error("Background AI generation failed for trip", trip.id, ":", err?.message ?? err);
        // Mark the trip as failed so the client can show an error state
        await storage.markTripFailed(trip.id).catch(() => {});
      }
    })();
  });

  // ── GET /api/trips/:id ─────────────────────────────────────────────────────
  // Returns the trip with its latest itinerary version.
  // While generation is in progress, returns { status: "generating" }.
  // On failure, returns { status: "failed" }.

  app.get("/api/trips/:id", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;

    const trip = await storage.getTrip(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Trip was marked as failed during background generation
    if (trip.generationFailed) {
      return res.json({ status: "failed", trip });
    }

    const version = await storage.getLatestItineraryVersion(id);
    if (!version) {
      // Trip exists but no itinerary yet — generation is in progress
      return res.json({ status: "generating", trip });
    }

    return res.json({
      status: "ready",
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
