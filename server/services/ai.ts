import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface IntakePreferences {
  destination: string;
  startDate?: string;
  durationDays: number;
  groupType: "solo" | "duo" | "group" | "family";
  energy: number;           // 0–100 slider (0 = Decompress, 50 = Balanced, 100 = Pack it in)
  budget?: string;          // "under-100" | "100-200" | "200-350" | "350-plus" — optional
  activityTypes: string[];  // "hidden-gems" | "iconic-landmarks" | "food-drink" | "history-museums" | "nature-parks" | "markets-shopping" | "nightlife" | "art-culture"
  food: string[];           // "street-food" | "neighbourhood" | "sit-down" | "special-evening"
  anchorActivity?: string;
  activityNotes?: string;
  dietaryNotes?: string;
  soloVibe?: string | null; // "explorer" | "immersive" | "spontaneous"
  duoStyle?: string | null;
  groupDynamic?: string | null;
  kidsAges?: string[];
  familyNeeds?: string[];
  participantNames?: string[]; // group trips: names of all participants for matchedFor tagging
  participantPreferences?: Array<{  // per-person preferences for selective matchedFor tagging
    name: string;
    activityTypes: string[];
    food: string[];
  }>;
  firstTime?: boolean;        // true = first visit, false = returning — adjusts landmark vs hidden-gem weighting
}

export interface GeneratedItinerary {
  destination: string;
  country: string;
  durationDays: number;
  groupType: string;
  tripVibe?: string;
  days: ItineraryDay[];
}

interface ItineraryDay {
  dayNumber: number;
  date: string;
  blocks: ActivityBlock[];
}

interface ActivityBlock {
  id: string;
  timeSlot: "morning" | "afternoon" | "evening";
  matchedFor: string[];
  primary: {
    name: string;
    type: string;
    description: string;
    whyForYou: string;
    costRange: string;
    imageUrl: string;
    lat: number;
    lng: number;
    address: string;
  };
  backup: {
    name: string;
    type: string;
    description: string;
    costRange: string;
  };
}

export interface AIServiceResult {
  itineraryData: GeneratedItinerary;
  preferenceHash: string;
}

// ─── Preference Hashing ────────────────────────────────────────────────────────

export function hashPreferences(preferences: IntakePreferences): string {
  // Normalise before hashing so minor ordering differences don't cause a miss
  const normalised = {
    destination: preferences.destination.toLowerCase().trim(),
    durationDays: preferences.durationDays,
    groupType: preferences.groupType,
    energy: preferences.energy,
    budget: preferences.budget,
    activityTypes: [...preferences.activityTypes].sort(),
    food: [...preferences.food].sort(),
    anchorActivity: preferences.anchorActivity?.toLowerCase().trim() ?? "",
    soloVibe: preferences.soloVibe ?? "",
    duoStyle: preferences.duoStyle ?? "",
    groupDynamic: preferences.groupDynamic ?? "",
    kidsAges: [...(preferences.kidsAges ?? [])].sort(),
    familyNeeds: [...(preferences.familyNeeds ?? [])].sort(),
  };
  return createHash("sha256").update(JSON.stringify(normalised)).digest("hex");
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

// Maps activity type values to their full label + description as shown in the intake form
const ACTIVITY_LABELS: Record<string, string> = {
  "hidden-gems":       "Hidden Gems — off-the-beaten-path spots locals love",
  "iconic-landmarks":  "Iconic Landmarks — the must-sees, done right",
  "food-drink":        "Food & Drink — food tours, markets, local specialties",
  "history-museums":   "History & Museums — museums, historic sites, architecture",
  "nature-parks":      "Nature & Parks — parks, viewpoints, scenic walks",
  "markets-shopping":  "Markets & Shopping — local markets, boutiques, vintage finds",
  "nightlife":         "Nightlife — bars, live music, late-night spots",
  "art-culture":       "Art & Culture — galleries, street art, performances",
};

// Maps food preference values to their full label + description
const FOOD_LABELS: Record<string, string> = {
  "street-food":     "Street food & markets — stalls, vendors, food halls; the hunt is half the fun",
  "neighbourhood":   "Neighbourhood gems — mom-and-pop spots, family-run kitchens beloved by locals",
  "sit-down":        "Proper sit-downs — full menus, good wine, no rush; conversation over courses",
  "special-evening": "One standout meal — a memorable table as a trip highlight",
};

// Maps solo vibe values to their full description
const SOLO_VIBE_LABELS: Record<string, string> = {
  "explorer":    "The Explorer — seeks what's off the map; hidden spots, local neighbourhoods, the road less taken",
  "immersive":   "The Immersive — goes deep; one neighbourhood, one cuisine, one culture, fully absorbed",
  "spontaneous": "The Spontaneous — follows the day; a rough outline but always open to whatever comes up",
};

// Static system prompt — same for every call, eligible for prompt caching
const SYSTEM_PROMPT = `You are a world-class travel curator specialising in personalised, local, and authentic travel experiences.
You create itineraries that feel curated by a knowledgeable local friend — never generic, never tourist-trap heavy.

ITINERARY DESIGN PRINCIPLES:
1. Each day has EXACTLY 3 blocks: morning, afternoon, evening — never more, never less. One activity per time slot, even for large groups. Do NOT split a time slot into multiple blocks.
2. Geo-cluster activities — minimise travel between blocks on the same day
3. Match energy pacing to the traveller's level
4. Prioritise hidden gems and local favourites over tourist traps
5. "whyForYou": max 10 words tied specifically to their preferences
6. "description": 1 sentence — specific and vivid
7. Each block needs a backup option
8. Cost estimates must be realistic for the destination and budget
9. Do not include imageUrl in the output
10. "address": short street address + neighbourhood (e.g. "123 Main St, Midtown" or "Queen St W, Parkdale") — real, accurate
11. Temporal awareness: use the travel dates to factor in seasonal highlights, annual festivals, and recurring cultural events (e.g. cherry blossoms in Tokyo in April, Oktoberfest in Munich in October, Christmas markets in December, peak foliage in autumn). If a notable event falls during the trip, incorporate it as a primary or backup activity and mention the timing in the whyForYou field (e.g. "Peak cherry blossom season — perfect timing")
12. "matchedFor": for group trips only, tag each activity with the names of participants whose stated preferences align with it. Use the "Participant preferences" section in the user message to determine who selected which activity types and food styles. Example: if 3 of 5 people selected "nature-parks", a national park activity should have those 3 names. If an activity serves the whole group equally (e.g. a shared dinner), include everyone. If no participant-level breakdown is available, include all names. For solo/duo/family trips, always output an empty array [].
13. "tripVibe": one short evocative line (max 10 words) capturing the overall character of this itinerary — e.g. "A foodie's deep dive with room to wander"

OUTPUT: Return ONLY valid JSON, no markdown, no explanation. Structure:
{"destination":"...","country":"...","durationDays":N,"groupType":"...","tripVibe":"...","days":[{"dayNumber":1,"date":"YYYY-MM-DD","blocks":[{"id":"day1-morning","timeSlot":"morning","matchedFor":[],"primary":{"name":"...","type":"cafe|restaurant|attraction|park|market|museum|bar|activity","description":"...","whyForYou":"...","costRange":"...","address":"...","lat":0.0,"lng":0.0},"backup":{"name":"...","type":"...","description":"...","costRange":"..."}}]}]}`;

function buildUserMessage(prefs: IntakePreferences): string {
  const energyLabel = prefs.energy <= 20 ? "very relaxed"
    : prefs.energy <= 40 ? "relaxed"
    : prefs.energy <= 60 ? "balanced"
    : prefs.energy <= 80 ? "active"
    : "high energy";

  const budgetLabel = !prefs.budget ? null
    : prefs.budget === "under-100"  ? "$50–100/day"
    : prefs.budget === "100-200" ? "$100–200/day"
    : prefs.budget === "200-350" ? "$200–350/day"
    : "$350+/day";

  const activityList = prefs.activityTypes.length
    ? prefs.activityTypes.map(a => ACTIVITY_LABELS[a] ?? a).join(", ")
    : "open to anything";

  const foodList = prefs.food.length
    ? prefs.food.map(f => FOOD_LABELS[f] ?? f).join(", ")
    : "no preference";

  const personaContext = prefs.groupType === "solo" && prefs.soloVibe
    ? `Persona: ${SOLO_VIBE_LABELS[prefs.soloVibe] ?? prefs.soloVibe}`
    : prefs.groupType === "duo" && prefs.duoStyle
    ? `Duo style: ${prefs.duoStyle}`
    : prefs.groupType === "group" && prefs.groupDynamic
    ? `Group dynamic: ${prefs.groupDynamic}`
    : prefs.groupType === "family" && prefs.kidsAges?.length
    ? `Family, kids aged: ${prefs.kidsAges.join(", ")}${prefs.familyNeeds?.length ? `. Needs: ${prefs.familyNeeds.join(", ")}` : ""}`
    : "";

  const startDate = prefs.startDate ?? new Date().toISOString().split("T")[0];

  // Build per-participant preference breakdown for selective matchedFor tagging
  const participantBreakdown = prefs.participantPreferences?.length
    ? "Participant preferences (for matchedFor tagging):\n" +
      prefs.participantPreferences.map((p) => {
        const acts = p.activityTypes.map((a) => ACTIVITY_LABELS[a] ?? a).join(", ") || "open";
        const foods = p.food.map((f) => FOOD_LABELS[f] ?? f).join(", ") || "any";
        return `- ${p.name}: activities=[${acts}], food=[${foods}]`;
      }).join("\n")
    : "";

  const extras = [
    personaContext,
    prefs.anchorActivity ? `Must-do: "${prefs.anchorActivity}"` : "",
    prefs.activityNotes  ? `Notes: "${prefs.activityNotes}"` : "",
    prefs.dietaryNotes   ? `Dietary: "${prefs.dietaryNotes}"` : "",
    participantBreakdown,
    !participantBreakdown && prefs.participantNames?.length
      ? `Group members (use for matchedFor tagging): ${prefs.participantNames.join(", ")}`
      : "",
    prefs.firstTime === true  ? "First time visiting this destination — include at least one iconic landmark per day; add orientation context in whyForYou" : "",
    prefs.firstTime === false ? "Returning visitor — skip generic tourist spots entirely; prioritise hyperlocal hidden gems and assume city familiarity" : "",
  ].filter(Boolean).join("\n");

  return `Generate a ${prefs.durationDays}-day itinerary for ${prefs.destination}.
Group: ${prefs.groupType} | Energy: ${energyLabel}${budgetLabel ? ` | Budget: ${budgetLabel}` : ""}
Activities: ${activityList}
Food: ${foodList}
${extras}
Start date: ${startDate}
Block IDs: day1-morning, day1-afternoon, day1-evening, day2-morning, …
Return ONLY the JSON.`;
}

// ─── Main Service Function ─────────────────────────────────────────────────────

export async function generateItinerary(
  preferences: IntakePreferences
): Promise<AIServiceResult> {
  const preferenceHash = hashPreferences(preferences);

  const maxTokens = preferences.durationDays <= 2 ? 3500
    : preferences.durationDays === 3 ? 4500
    : 5500;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // @ts-ignore — cache_control is supported by the API but not yet in the TS types
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(preferences) }],
  });

  const rawText = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  // Strip markdown code fences if Claude wraps the JSON (e.g. ```json ... ```)
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // Log if the response was cut off (stop_reason = max_tokens)
  if (message.stop_reason === "max_tokens") {
    console.error(`Claude hit max_tokens limit — response truncated. Consider increasing max_tokens.`);
  }

  let itineraryData: GeneratedItinerary;
  try {
    itineraryData = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude returned invalid JSON (stop_reason=${message.stop_reason}): ${cleaned.slice(0, 300)}`);
  }

  // Guard: enforce exactly one block per time slot per day.
  // If the AI generated duplicates, keep the first and merge matchedFor arrays.
  for (const day of itineraryData.days ?? []) {
    const seen: Record<string, any> = {};
    const deduped: any[] = [];
    for (const block of (day as any).blocks ?? []) {
      const slot: string = block.timeSlot;
      if (seen[slot]) {
        // Merge matchedFor from duplicate into the kept block
        const kept = seen[slot];
        const extra: string[] = block.matchedFor ?? [];
        kept.matchedFor = [...new Set([...(kept.matchedFor ?? []), ...extra])];
      } else {
        seen[slot] = block;
        deduped.push(block);
      }
    }
    (day as any).blocks = deduped;
  }

  return { itineraryData, preferenceHash };
}
