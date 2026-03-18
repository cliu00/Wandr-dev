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
  budget: string;           // "under-100" | "100-200" | "200-350" | "350-plus"
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
}

export interface GeneratedItinerary {
  destination: string;
  country: string;
  durationDays: number;
  groupType: string;
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
  primary: {
    name: string;
    type: string;
    description: string;
    whyForYou: string;
    costRange: string;
    imageUrl: string;
    lat: number;
    lng: number;
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

function buildPrompt(prefs: IntakePreferences): string {
  // Energy: 0–100 slider mapped to a descriptive label
  const energyLabel = prefs.energy <= 20 ? "very relaxed — minimal walking, slow mornings, plenty of downtime"
    : prefs.energy <= 40 ? "relaxed — unhurried pace, a couple of activities per day"
    : prefs.energy <= 60 ? "balanced — mix of activity and rest, moderate walking"
    : prefs.energy <= 80 ? "active — full days, multiple stops, energetic pace"
    : "high energy — pack it in, maximise every hour, back-to-back experiences";

  // Budget: map intake form values to dollar ranges
  const budgetLabel = prefs.budget === "under-100"  ? "Budget-friendly (~$50–100/day total spend)"
    : prefs.budget === "100-200" ? "Comfortable (~$100–200/day total spend)"
    : prefs.budget === "200-350" ? "Treat yourself (~$200–350/day total spend)"
    : prefs.budget === "350-plus" ? "Luxury ($350+/day total spend)"
    : "mid-range";

  // Activities: map values to full labels with descriptions
  const activityList = prefs.activityTypes.length
    ? prefs.activityTypes.map(a => `  • ${ACTIVITY_LABELS[a] ?? a}`).join("\n")
    : "  • Open to anything";

  // Food: map values to full labels with descriptions
  const foodList = prefs.food.length
    ? prefs.food.map(f => `  • ${FOOD_LABELS[f] ?? f}`).join("\n")
    : "  • No specific preferences";

  // Solo vibe: full description
  const personaContext = prefs.groupType === "solo" && prefs.soloVibe
    ? `Solo traveller persona: ${SOLO_VIBE_LABELS[prefs.soloVibe] ?? prefs.soloVibe}`
    : prefs.groupType === "duo" && prefs.duoStyle
    ? `Travelling as a duo with style: "${prefs.duoStyle}"`
    : prefs.groupType === "group" && prefs.groupDynamic
    ? `Group travel with dynamic: "${prefs.groupDynamic}"`
    : prefs.groupType === "family" && prefs.kidsAges?.length
    ? `Family trip with kids aged: ${prefs.kidsAges.join(", ")}.${prefs.familyNeeds?.length ? ` Family needs: ${prefs.familyNeeds.join(", ")}.` : ""}`
    : "";

  const anchorNote = prefs.anchorActivity
    ? `Must-do anchor activity (work this into the itinerary): "${prefs.anchorActivity}"`
    : "";

  const activityNote = prefs.activityNotes
    ? `Additional activity notes from the traveller: "${prefs.activityNotes}"`
    : "";

  const dietaryNote = prefs.dietaryNotes
    ? `Dietary requirements: "${prefs.dietaryNotes}"`
    : "";

  const startDate = prefs.startDate ?? new Date().toISOString().split("T")[0];

  return `You are a world-class travel curator specialising in personalised, local, and authentic travel experiences.
You create itineraries that feel curated by a knowledgeable local friend — never generic, never tourist-trap heavy.

Generate a ${prefs.durationDays}-day itinerary for ${prefs.destination} based on the following traveller profile:

TRAVELLER PROFILE:
- Group type: ${prefs.groupType}
- Energy level: ${energyLabel} (${prefs.energy}/100)
- Budget: ${budgetLabel}
- Preferred activity types:
${activityList}
- Food preferences:
${foodList}
${personaContext ? `- ${personaContext}` : ""}
${anchorNote ? `- ${anchorNote}` : ""}
${activityNote ? `- ${activityNote}` : ""}
${dietaryNote ? `- ${dietaryNote}` : ""}

ITINERARY DESIGN PRINCIPLES:
1. Each day has exactly 3 blocks: morning, afternoon, evening
2. Activities must be geographically clustered — minimise travel time between blocks on the same day
3. Pace the energy across the day — match the traveller's energy level (e.g. low energy = relaxed starts, no back-to-back intense activities)
4. Prioritise hidden gems and local favourites over well-known tourist spots where possible
5. Each primary recommendation must include a specific "why this for you" explanation tied to their preferences
6. Each block must have a backup option in case the primary is unavailable or not to their taste
7. Cost estimates must be realistic for ${prefs.destination} at the ${prefs.budget} budget level
8. For food blocks, respect dietary preferences: ${prefs.dietaryNotes || "none specified"}
9. Image URLs must use this exact Unsplash format: https://images.unsplash.com/photo-[ID]?w=800&q=80

REQUIRED OUTPUT FORMAT:
Return ONLY a valid JSON object — no explanation, no markdown, no code blocks. Exactly this structure:

{
  "destination": "${prefs.destination}",
  "country": "<country name>",
  "durationDays": ${prefs.durationDays},
  "groupType": "${prefs.groupType}",
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "blocks": [
        {
          "id": "day1-morning",
          "timeSlot": "morning",
          "primary": {
            "name": "<specific place name>",
            "type": "<cafe | restaurant | attraction | park | market | museum | bar | activity>",
            "description": "<2-3 sentences describing the place and experience>",
            "whyForYou": "<1-2 sentences specifically tied to this traveller's preferences>",
            "costRange": "<e.g. $10–15 per person>",
            "imageUrl": "https://images.unsplash.com/photo-<relevant-photo-id>?w=800&q=80",
            "lat": <latitude as number>,
            "lng": <longitude as number>
          },
          "backup": {
            "name": "<specific backup place name>",
            "type": "<type>",
            "description": "<1-2 sentences>",
            "costRange": "<cost range>"
          }
        }
      ]
    }
  ]
}

Generate all ${prefs.durationDays} days, each with exactly 3 blocks (morning, afternoon, evening).
Use block IDs in format: "day1-morning", "day1-afternoon", "day1-evening", "day2-morning", etc.
Dates should increment from ${startDate}.
Return ONLY the JSON. Nothing else.`;
}

// ─── Main Service Function ─────────────────────────────────────────────────────

export async function generateItinerary(
  preferences: IntakePreferences
): Promise<AIServiceResult> {
  const preferenceHash = hashPreferences(preferences);
  const prompt = buildPrompt(preferences);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  let itineraryData: GeneratedItinerary;
  try {
    itineraryData = JSON.parse(rawText);
  } catch {
    throw new Error(`Claude returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  return { itineraryData, preferenceHash };
}
