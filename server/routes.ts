import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { generateItinerary, hashPreferences, type IntakePreferences } from "./services/ai";
import { generatePDF } from "./services/pdf";
import { generateIcal } from "./services/ical";
import { z } from "zod";

// ─── Validation Schema ────────────────────────────────────────────────────────

const createTripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().optional(),
  durationDays: z.number().int().min(1).max(4),
  groupType: z.enum(["solo", "duo", "group", "family"]),
  energy: z.number().min(0).max(100),
  budget: z.enum(["under-100", "100-200", "200-350", "350-plus"]).optional(),
  activityTypes: z.array(z.string()).default([]),
  food: z.array(z.string()).default([]),
  anchorActivity: z.string().optional(),
  activityNotes: z.string().optional(),
  dietaryNotes: z.string().optional(),
  soloVibe: z.string().nullable().optional(),
  duoStyle: z.string().nullable().optional(),
  organizerName: z.string().optional(),
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

// ─── Feature Flags ────────────────────────────────────────────────────────────
// TODO: set ENABLE_RATE_LIMIT=true in .env before going to production
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === "true";

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
    // For group trips with an organizer name, seed participantNames so v1 has matchedFor tags
    if (preferences.groupType === "group" && (parsed.data as any).organizerName) {
      preferences.participantNames = [(parsed.data as any).organizerName];
    }
    const sessionId = getSessionId(req);
    const isAuthenticated = !!(req.session as any)?.userId;

    // 2. Check generation limit for anonymous users
    if (ENABLE_RATE_LIMIT && !isAuthenticated) {
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
          if (ENABLE_RATE_LIMIT && !isAuthenticated) {
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

    // For group trips, include how many companions have added preferences
    let contributorCount = 1; // organizer is always 1
    let latestContributorName: string | null = null;
    if (trip.groupType === "group") {
      const groupTrip = await storage.getGroupTripByTripId(id);
      if (groupTrip) {
        const participants = await storage.getParticipantsByGroup(groupTrip.id);
        const responded = participants.filter((p) => p.responded);
        contributorCount = 1 + responded.length;
        // Most recently created responded participant
        if (responded.length > 0) {
          const latest = responded.reduce((a, b) =>
            new Date(a.createdAt) > new Date(b.createdAt) ? a : b
          );
          latestContributorName = latest.name;
        }
      }
    }

    return res.json({
      status: "ready",
      trip,
      itinerary: version.itineraryData,
      versionNumber: version.versionNumber,
      generatedAt: version.createdAt,
      contributorCount,
      latestContributorName,
      generatedBy: version.generatedBy,
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

  // ── POST /api/groups/create ────────────────────────────────────────────────
  // Called when organizer completes the intake form with groupType="group".
  // Creates a group trip record and returns the groupTripId for the invite page.

  app.post("/api/groups/create", async (req: Request, res: Response) => {
    const parsed = z.object({
      organizerName: z.string().min(1),
      destination: z.string().default(""),
      startDate: z.string().optional(),
      durationDays: z.number().int().min(1).max(4),
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten().fieldErrors });
    }

    const groupTrip = await storage.createGroupTrip({
      organizerName: parsed.data.organizerName,
      destination: parsed.data.destination,
      startDate: parsed.data.startDate,
      durationDays: parsed.data.durationDays,
      status: "open",
      tripId: null,
    });

    return res.status(201).json({ groupTripId: groupTrip.id });
  });

  // ── POST /api/groups/:id/participants ──────────────────────────────────────
  // Organizer submits a list of companion names.
  // Creates one participant row per name with a unique token.
  // Returns the list with their personal join URLs.

  app.post("/api/groups/:id/participants", async (req: Request, res: Response) => {
    const groupTripId = req.params["id"] as string;

    const groupTrip = await storage.getGroupTrip(groupTripId);
    if (!groupTrip) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    const parsed = z.object({
      names: z.array(z.string().min(1)).min(1).max(20),
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten().fieldErrors });
    }

    const participants = await Promise.all(
      parsed.data.names.map(async (name) => {
        const token = randomBytes(5).toString("hex"); // 10-char hex token
        const participant = await storage.createParticipant({
          groupTripId,
          name,
          token,
          responded: false,
          preferences: null,
        });
        return {
          id: participant.id,
          name: participant.name,
          token: participant.token,
          joinUrl: `/survey/join?token=${participant.token}`,
        };
      })
    );

    return res.status(201).json({ participants });
  });

  // ── GET /api/groups/join/:token ────────────────────────────────────────────
  // Called when a participant opens their personal join link.
  // Returns the group context they need for the welcome screen.
  // NOTE: must be registered before /api/groups/:id routes to avoid conflict.

  app.get("/api/groups/join/:token", async (req: Request, res: Response) => {
    const token = req.params["token"] as string;

    const participant = await storage.getParticipantByToken(token);
    if (!participant) {
      return res.status(404).json({ message: "Invite link not found or expired" });
    }

    const groupTrip = await storage.getGroupTrip(participant.groupTripId);
    if (!groupTrip) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    return res.json({
      participantName: participant.name,
      alreadyResponded: participant.responded,
      groupTripId: groupTrip.id,
      organizerName: groupTrip.organizerName,
      destination: groupTrip.destination,
      startDate: groupTrip.startDate,
      durationDays: groupTrip.durationDays,
      status: groupTrip.status,
    });
  });

  // ── POST /api/groups/join/:token ───────────────────────────────────────────
  // Participant submits their survey answers.
  // Saves preferences and marks them as responded.

  app.post("/api/groups/join/:token", async (req: Request, res: Response) => {
    const token = req.params["token"] as string;

    const participant = await storage.getParticipantByToken(token);
    if (!participant) {
      return res.status(404).json({ message: "Invite link not found or expired" });
    }
    if (participant.responded) {
      return res.status(409).json({ message: "You have already submitted your preferences" });
    }

    const parsed = z.object({
      groupDynamic: z.string().nullable().optional(),
      energy: z.number().min(0).max(100).default(50),
      budget: z.enum(["under-100", "100-200", "200-350", "350-plus"]).nullable().optional(),
      activities: z.array(z.string()).default([]),
      food: z.array(z.string()).default([]),
      activityNotes: z.string().optional(),
      dietaryNotes: z.string().optional(),
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid preferences", errors: parsed.error.flatten().fieldErrors });
    }

    await storage.updateParticipantResponse(token, parsed.data);

    return res.json({ message: "Preferences saved" });
  });

  // ── GET /api/groups/:id/status ─────────────────────────────────────────────
  // Returns the group trip details and the full participant list with
  // responded status. Used by the organizer's status page.

  app.get("/api/groups/:id/status", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;

    const groupTrip = await storage.getGroupTrip(id);
    if (!groupTrip) {
      return res.status(404).json({ message: "Group trip not found" });
    }

    const participants = await storage.getParticipantsByGroup(id);
    const respondedCount = participants.filter((p) => p.responded).length;

    return res.json({
      groupTrip,
      participants: participants.map((p) => ({
        id: p.id,
        name: p.name,
        responded: p.responded,
        joinUrl: `/survey/join?token=${p.token}`,
      })),
      respondedCount,
      totalCount: participants.length,
    });
  });

  // ── POST /api/groups/:id/generate ─────────────────────────────────────────
  // Organizer triggers itinerary generation once enough participants responded.
  // Merges all participant preferences, fires the AI call in the background,
  // and returns a tripId to poll on GET /api/trips/:id.

  app.post("/api/groups/:id/generate", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;

    const groupTrip = await storage.getGroupTrip(id);
    if (!groupTrip) {
      return res.status(404).json({ message: "Group trip not found" });
    }
    if (groupTrip.status === "generating" || groupTrip.status === "complete") {
      return res.status(409).json({ message: "Generation already started" });
    }

    const participants = await storage.getParticipantsByGroup(id);
    const responded = participants.filter((p) => p.responded && p.preferences);
    if (responded.length === 0) {
      return res.status(400).json({ message: "No participant responses yet" });
    }

    // Merge participant preferences into one set of IntakePreferences
    const merged = mergeGroupPreferences(responded.map((p) => p.preferences as any), groupTrip);

    // Tag all names + per-person prefs so the AI can selectively tag matchedFor
    merged.participantNames = [
      ...(groupTrip.organizerName && groupTrip.organizerName !== "Organizer" ? [groupTrip.organizerName] : []),
      ...responded.map((p) => p.name),
    ];

    // Per-person preference breakdown for selective matchedFor tagging
    const groupParticipantPrefs: Array<{ name: string; activityTypes: string[]; food: string[] }> = [];
    if (groupTrip.organizerName && groupTrip.organizerName !== "Organizer" && groupTrip.organizerPreferences) {
      const op = groupTrip.organizerPreferences as any;
      groupParticipantPrefs.push({ name: groupTrip.organizerName, activityTypes: op.activityTypes ?? [], food: op.food ?? [] });
    }
    for (const p of responded) {
      const prefs = p.preferences as any;
      groupParticipantPrefs.push({ name: p.name, activityTypes: prefs?.activityTypes ?? [], food: prefs?.food ?? [] });
    }
    if (groupParticipantPrefs.length) merged.participantPreferences = groupParticipantPrefs;

    // Create the trip row immediately and return
    const sessionId = (req.session as any)?.id ?? "anonymous";
    const trip = await storage.createTrip({
      destination: groupTrip.destination,
      startDate: groupTrip.startDate,
      durationDays: groupTrip.durationDays,
      groupType: "group",
      preferences: merged as any,
      userId: null,
      anonymousSessionId: sessionId,
      generationFailed: false,
    });

    await storage.updateGroupTripStatus(id, "generating");

    res.status(201).json({ tripId: trip.id });

    // Fire AI generation in the background
    const preferenceHash = hashPreferences(merged);
    (async () => {
      try {
        const existingVersion = await storage.getItineraryByHash(preferenceHash);
        const itineraryData = existingVersion
          ? existingVersion.itineraryData
          : (await generateItinerary(merged)).itineraryData;

        // Safety net: fill matchedFor with all participant names on any block the AI left empty
        if (merged.participantNames?.length) {
          for (const day of (itineraryData as any).days ?? []) {
            for (const block of day.blocks ?? []) {
              if (!block.matchedFor?.length) {
                block.matchedFor = merged.participantNames;
              }
            }
          }
        }

        await storage.createItineraryVersion({
          tripId: trip.id,
          versionNumber: 1,
          itineraryData: itineraryData as any,
          preferenceHash,
          generatedBy: "group",
        });

        await storage.linkGroupTripToTrip(id, trip.id);
      } catch (err: any) {
        console.error("Group AI generation failed for group", id, ":", err?.message ?? err);
        await storage.markTripFailed(trip.id).catch(() => {});
        await storage.updateGroupTripStatus(id, "failed").catch(() => {});
      }
    })();
  });

  // ── POST /api/survey/:tripId/respond ──────────────────────────────────────
  // A companion opens the shared itinerary URL, fills the quick survey, and
  // submits here. We save their preferences, then regenerate the itinerary as
  // a new version so the organizer's page auto-updates.

  app.post("/api/survey/:tripId/respond", async (req: Request, res: Response) => {
    const tripId = req.params["tripId"] as string;

    const trip = await storage.getTrip(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Upgrade solo trips to group when a friend joins
    if (trip.groupType !== "group") {
      await storage.updateTripGroupType(tripId, "group");
    }

    const parsed = z.object({
      name: z.string().min(1),
      organizerName: z.string().optional(),
      firstTime: z.boolean().optional(),
      groupDynamic: z.string().nullable().optional(),
      energy: z.number().min(0).max(100).default(50),
      budget: z.enum(["under-100", "100-200", "200-350", "350-plus"]).nullable().optional(),
      activityTypes: z.array(z.string()).default([]),
      food: z.array(z.string()).default([]),
      activityNotes: z.string().optional(),
      dietaryNotes: z.string().optional(),
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid preferences", errors: parsed.error.flatten().fieldErrors });
    }

    // Find or create the group_trip record linked to this trip
    let groupTrip = await storage.getGroupTripByTripId(tripId);
    if (!groupTrip) {
      groupTrip = await storage.createGroupTrip({
        tripId,
        organizerName: parsed.data.organizerName || (trip.preferences as any)?.organizerName || "Organizer",
        destination: trip.destination,
        startDate: trip.startDate,
        durationDays: trip.durationDays,
        status: "open",
        organizerPreferences: trip.preferences as any,
      });
    }

    // Create the participant record
    const token = randomBytes(5).toString("hex");
    await storage.createParticipant({
      groupTripId: groupTrip.id,
      name: parsed.data.name,
      token,
      responded: true,
      preferences: parsed.data as any,
    });

    // Respond immediately — regeneration happens in the background
    res.json({ message: "Preferences saved" });

    // Gather all participants + organizer prefs, then regenerate
    const capturedGroupTripId = groupTrip!.id;
    (async () => {
      try {
        // Re-fetch the trip to get the current version number — the outer `trip`
        // may be stale if another companion submitted concurrently.
        const freshTrip = await storage.getTrip(tripId);
        if (!freshTrip) return;

        const participants = await storage.getParticipantsByGroup(capturedGroupTripId);
        const responded = participants.filter((p) => p.responded && p.preferences);
        const merged = mergeGroupPreferences(
          responded.map((p) => p.preferences as any),
          { destination: freshTrip.destination, startDate: freshTrip.startDate, durationDays: freshTrip.durationDays },
          freshTrip.preferences as any,
        );

        // Pass all participant names + per-person prefs so the AI can selectively tag matchedFor
        const freshGroupTrip = await storage.getGroupTripByTripId(tripId);
        const organizerName = freshGroupTrip?.organizerName;
        const organizerPrefs = freshTrip.preferences as any;
        const allNames = [
          ...(organizerName && organizerName !== "Organizer" ? [organizerName] : []),
          ...responded.map((p) => p.name),
        ];
        merged.participantNames = allNames;

        // Build per-person preference breakdown for selective matchedFor tagging
        const participantPreferences: Array<{ name: string; activityTypes: string[]; food: string[] }> = [];
        if (organizerName && organizerName !== "Organizer" && organizerPrefs) {
          participantPreferences.push({
            name: organizerName,
            activityTypes: organizerPrefs.activityTypes ?? [],
            food: organizerPrefs.food ?? [],
          });
        }
        for (const p of responded) {
          const prefs = p.preferences as any;
          participantPreferences.push({
            name: p.name,
            activityTypes: prefs?.activityTypes ?? prefs?.activities ?? [],
            food: prefs?.food ?? [],
          });
        }
        if (participantPreferences.length) merged.participantPreferences = participantPreferences;

        const nextVersion = freshTrip.currentVersion + 1;

        // Always call the AI — skip the hash cache so that merged preferences
        // always produce a fresh itinerary reflecting everyone's input.
        const { itineraryData } = await generateItinerary(merged);
        const preferenceHash = hashPreferences(merged);

        // Safety net: ensure all participant names appear on every block's matchedFor
        if (merged.participantNames?.length) {
          for (const day of (itineraryData as any).days ?? []) {
            for (const block of day.blocks ?? []) {
              if (!block.matchedFor?.length) {
                block.matchedFor = merged.participantNames;
              }
            }
          }
        }

        await storage.createItineraryVersion({
          tripId,
          versionNumber: nextVersion,
          itineraryData: itineraryData as any,
          preferenceHash,
          generatedBy: parsed.data.name,
        });
      } catch (err: any) {
        console.error("Background regeneration failed for trip", tripId, ":", err?.message ?? err);
      }
    })();
  });

  // ── PATCH /api/trips/:id/name ──────────────────────────────────────────────
  // Trip creator updates the custom trip name shown on the itinerary hero.

  app.patch("/api/trips/:id/name", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;
    const parsed = z.object({ tripName: z.string().max(80) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid name" });

    const trip = await storage.getTrip(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await storage.updateTripName(id, parsed.data.tripName.trim());
    return res.json({ tripName: parsed.data.tripName.trim() });
  });

  // ── GET /api/trips/:id/pdf ─────────────────────────────────────────────────
  // Returns the itinerary as a downloadable PDF.

  app.get("/api/trips/:id/pdf", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;
    const version = await storage.getLatestItineraryVersion(id);
    if (!version) return res.status(404).json({ message: "Itinerary not found" });
    try {
      const itinerary = version.itineraryData as any;
      const pdfBuffer = await generatePDF(itinerary);
      const filename = `wandr-${itinerary.destination.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("PDF generation error:", err);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // ── GET /api/trips/:id/ical ────────────────────────────────────────────────
  // Returns the itinerary as a downloadable .ics calendar file.

  app.get("/api/trips/:id/ical", async (req: Request, res: Response) => {
    const id = req.params["id"] as string;
    const version = await storage.getLatestItineraryVersion(id);
    if (!version) return res.status(404).json({ message: "Itinerary not found" });
    const itinerary = version.itineraryData as any;
    const icsContent = generateIcal(itinerary);
    const filename = `wandr-${itinerary.destination.toLowerCase().replace(/\s+/g, "-")}.ics`;
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(icsContent);
  });

  return httpServer;
}

// ─── Preference Merging ───────────────────────────────────────────────────────
// Maps activity labels (from survey-join) back to the value keys the AI prompt expects.
const ACTIVITY_LABEL_TO_VALUE: Record<string, string> = {
  "Hidden Gems":       "hidden-gems",
  "Iconic Landmarks":  "iconic-landmarks",
  "Food & Drink":      "food-drink",
  "History & Museums": "history-museums",
  "Nature & Parks":    "nature-parks",
  "Markets & Shopping":"markets-shopping",
  "Nightlife":         "nightlife",
  "Art & Culture":     "art-culture",
};

const BUDGET_RANK: Record<string, number> = {
  "under-100": 1,
  "100-200":   2,
  "200-350":   3,
  "350-plus":  4,
};

function mergeGroupPreferences(
  responses: Array<Record<string, any>>,
  groupTrip: { destination: string; startDate?: string | null; durationDays: number },
  organizerPrefs?: Record<string, any>
): IntakePreferences {
  // Include organizer's prefs as the first "response" if provided
  if (organizerPrefs) responses = [organizerPrefs, ...responses];
  // Energy — average across all responses
  const avgEnergy = Math.round(
    responses.reduce((sum, r) => sum + (r.energy ?? 50), 0) / responses.length
  );

  // Budget — most conservative (lowest rank wins)
  const budgets = responses.map((r) => r.budget).filter(Boolean);
  const budget = budgets.length
    ? budgets.reduce((a, b) => (BUDGET_RANK[a] <= BUDGET_RANK[b] ? a : b))
    : "100-200";

  // Activities — union ordered by how many people picked each, mapped to values
  // Participants submit under "activityTypes"; organizer prefs use "activityTypes" too.
  const activityCounts: Record<string, number> = {};
  for (const r of responses) {
    const acts = (r.activityTypes ?? r.activities ?? []) as string[];
    for (const label of acts) {
      const value = ACTIVITY_LABEL_TO_VALUE[label] ?? label;
      activityCounts[value] = (activityCounts[value] ?? 0) + 1;
    }
  }
  const activityTypes = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);

  // Food — union of all picks
  const foodSet = new Set<string>();
  for (const r of responses) {
    for (const f of (r.food ?? []) as string[]) foodSet.add(f);
  }

  // Group dynamic — majority vote, ties fall back to "mix"
  const dynamicCounts: Record<string, number> = {};
  for (const r of responses) {
    if (r.groupDynamic) dynamicCounts[r.groupDynamic] = (dynamicCounts[r.groupDynamic] ?? 0) + 1;
  }
  const groupDynamic = Object.entries(dynamicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "mix";

  // Dietary notes — join all non-empty
  const dietaryNotes = responses
    .map((r) => r.dietaryNotes)
    .filter(Boolean)
    .join("; ");

  // firstTime — true if ANY participant is visiting for the first time
  const firstTimeValues = responses.map((r) => r.firstTime).filter((v) => v !== undefined && v !== null);
  const firstTime = firstTimeValues.length
    ? firstTimeValues.some((v) => v === true)
    : undefined;

  return {
    destination: groupTrip.destination,
    startDate: groupTrip.startDate ?? undefined,
    durationDays: groupTrip.durationDays,
    groupType: "group",
    energy: avgEnergy,
    budget,
    activityTypes,
    food: Array.from(foodSet),
    groupDynamic,
    dietaryNotes: dietaryNotes || undefined,
    firstTime,
  };
}
