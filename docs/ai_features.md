# Wandr — AI Features

## Overview

All AI generation is handled by **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) via the Anthropic SDK. The core logic lives in `server/services/ai.ts`. Generation is asynchronous — the server creates a trip record immediately, fires generation in the background, and the client polls until `status === "ready"`.

---

## 1. Itinerary Generation

**File:** `server/services/ai.ts` → `generateItinerary(preferences)`

The primary feature. Given a user's intake preferences, the AI generates a full multi-day itinerary structured as JSON.

### What it produces
- **3 activity blocks per day** — morning, afternoon, evening
- Each block has a **primary activity** and a **backup option**
- Fields per activity: `name`, `type`, `description`, `whyForYou`, `costRange`, `address`, `lat`, `lng`, `matchedFor`

### Design principles baked into the prompt
1. Geo-cluster activities per day to minimise travel time
2. Match energy pacing to the traveller's slider (0 = relaxed → 100 = packed)
3. Prioritise hidden gems and local favourites over tourist traps
4. `whyForYou` capped at 10 words, tied specifically to stated preferences
5. `description` is 1 sentence — specific and vivid, never generic
6. Cost estimates calibrated to destination and budget tier
7. Each block always includes a backup activity

### Token budget
Scaled by trip duration to avoid truncation:
| Duration | `max_tokens` |
|---|---|
| 1–2 days | 3,500 |
| 3 days | 4,500 |
| 4 days | 5,500 |

### Prompt caching
The system prompt is marked `cache_control: ephemeral` — eligible for Anthropic's prompt caching, which reduces cost and latency on repeated calls with the same system prompt.

---

## 2. Structured Prompt Construction

**File:** `server/services/ai.ts` → `buildUserMessage(prefs)`

The user message is dynamically assembled from intake form answers. It translates raw preference values into descriptive language before sending to the AI.

### Mappings
- **Energy slider** → `"very relaxed"` / `"relaxed"` / `"balanced"` / `"active"` / `"high energy"`
- **Budget tier** → `"$50–100/day"` through `"$350+/day"`
- **Activity types** → full label + description (e.g. `"Hidden Gems — off-the-beaten-path spots locals love"`)
- **Food preferences** → full label + description (e.g. `"Neighbourhood gems — mom-and-pop spots, family-run kitchens beloved by locals"`)

### Persona context (injected per group type)
- **Solo** → Solo vibe (Explorer / Immersive / Spontaneous) with full description
- **Duo** → Duo style label
- **Group** → Group dynamic (Together / Loosely together / Mix of both)
- **Family** → Kids' ages + specific family needs

### Optional fields
- `anchorActivity` — a must-do activity the user specified
- `activityNotes` — freetext notes about activities
- `dietaryNotes` — dietary restrictions passed through to food planning

---

## 3. Temporal Awareness (Seasonal Events)

**File:** `server/services/ai.ts` → System prompt, instruction #11

The AI uses the trip's **start date** to factor in time-sensitive events when selecting activities.

### What this does
- Identifies seasonal highlights relevant to the destination and travel dates (e.g. cherry blossoms in Tokyo in April, Oktoberfest in Munich in October, Christmas markets in December, peak autumn foliage)
- Incorporates notable events as **primary or backup activities** when they fall within the trip window
- References the timing in the `whyForYou` field (e.g. *"Peak cherry blossom season — perfect timing"*)

### How the date is passed
`startDate` is included in the intake preferences and passed in the user message:
```
Start date: 2026-03-19
```
If no date is provided, the current date is used as a fallback.

---

## 4. Group Preference Merging

**File:** `server/routes.ts` → `mergeGroupPreferences()` (called on survey respond)

When companions add their preferences via the invite link, the AI regenerates the itinerary blending everyone's input rather than just the organiser's.

### Flow
1. Organiser creates trip with their preferences (version 1)
2. Friend opens `/survey/join?tripId=...&from=Sarah`, submits their preferences
3. Server calls `mergeGroupPreferences()` — combines all responded participants' preferences with the organiser's
4. A fresh `generateItinerary()` call is made with the merged preferences (cache is deliberately skipped)
5. Result is stored as a new **version** (`versionNumber` increments)
6. Organiser's itinerary page detects the version bump via polling and shows the update banner + toast

### Merging strategy
Activity types and food preferences from all participants are union-merged. Energy and budget are averaged across the group. Group dynamic from the organiser's intake takes precedence for structure.

### Versioning
Every regeneration creates a new `itinerary_versions` row. The client always loads the latest version. The `generatedBy` field stores the name of the companion who triggered the latest regeneration.

---

## 5. Activity Attribution (matchedFor Tagging)

**File:** `server/services/ai.ts` → System prompt instruction #12; `client/src/components/activity-card.tsx`

For **group trips only**, the AI tags each activity block with the names of participants whose preferences it satisfies.

### How it works
- When regenerating after a companion submits, `participantNames` (array of first names of all responded participants) is included in the user message
- The AI returns a `matchedFor: string[]` field on each block (e.g. `["Sarah", "Mike"]`)
- For solo/duo/family trips, the AI always returns `matchedFor: []` — the field is never displayed

### Adaptive display in the UI (`activity-card.tsx`)
| Group size | Display |
|---|---|
| 1–4 matched | Circular initials bubbles — `S` `M` `J` — with full name on hover |
| 5+ matched | Count pill — `👥 7 wandrers` |

The badges appear inline with the time badge (Morning / Afternoon / Evening) and are only rendered when `isGroupTrip === true` and `matchedFor` is non-empty.

---

## 6. Preference Hashing (Deduplication Cache)

**File:** `server/services/ai.ts` → `hashPreferences(preferences)`

Before calling the AI, the server hashes the normalised intake preferences using SHA-256. If an identical hash already exists in `itinerary_versions`, the cached result is returned — no AI call is made.

### What is hashed
Destination, duration, group type, energy, budget, activity types (sorted), food (sorted), anchor activity, solo vibe, duo style, group dynamic, kids ages, family needs.

### What is excluded
Free-text notes (`activityNotes`, `dietaryNotes`) and `startDate` are excluded from the hash — so seasonal variance between trips to the same destination is still generated fresh.

> **Note:** Group preference regenerations deliberately **skip the hash cache** so that merged preferences always produce a fresh itinerary reflecting all members' input.

---

---

## 7. Trip Personality Label

**File:** `server/services/ai.ts` → System prompt; `client/src/pages/itinerary.tsx`

The AI generates a single evocative line characterising the overall vibe of the itinerary. Displayed in italic under the destination name on the itinerary hero.

### Examples
- *"A foodie's deep dive with room to wander"*
- *"High energy with local roots"*
- *"Slow mornings, hidden gems, and one unforgettable dinner"*

### Implementation
- `tripVibe` added as a top-level field in the AI JSON schema
- System prompt instruction: *"tripVibe: one short evocative line (max 10 words) capturing the overall character of this itinerary"*
- ~15–20 extra output tokens per generation

---

## 8. First Time in City Detection

**File:** `client/src/pages/intake.tsx`; `server/services/ai.ts`

A binary question added to the intake form after destination selection: *"First time in [city]?"* The answer is passed to the AI as a flag.

### What it changes in the prompt
- `firstTime: true` → AI weights iconic landmarks more heavily (at least one per day) and adds orientation context to `whyForYou` fields
- `firstTime: false` → AI skews toward hidden gems, local-only spots, and assumes city familiarity
- ~20 extra input tokens per call

---

## 9. Countdown to Trip

**File:** `client/src/pages/itinerary.tsx`

Client-side date calculation. No AI involvement, no API calls.

- Computes `tripStartDate − today` and displays *"In 12 days"* as a pill in the itinerary hero
- Hidden if the trip start date has already passed
- After trip end date passes, replaced by an *"How was your trip?"* prompt (see roadmap)

---

## 10. Personalised Itinerary Title

**File:** `client/src/pages/itinerary.tsx`

Client-side string composition. No AI involvement.

- **Solo**: *"Sarah's [Destination]"* — derived from auth user name or invite inviterName
- **Group**: *"The [Destination] Crew"*
- **Duo**: *"[Name] & [Destination]"*
- Falls back to plain destination name if no name is available

---

## 11. Weather Teaser

**File:** `client/src/pages/itinerary.tsx`

Fetches forecast data from the **Open-Meteo API** (free, no API key required) and displays average high temperature + weather condition for the first day of the trip.

### API used
`api.open-meteo.com/v1/forecast` — uses lat/lng from the first activity block (already returned by the AI) to avoid a separate geocoding step.

### Display
Subtle single line in the itinerary hero: *"Expect 18°C and sunny on Day 1"*

---

## 12. Group Complete Moment (Option A)

**File:** `client/src/pages/itinerary.tsx`

When the **first companion** adds their preferences and the itinerary updates, a special banner replaces the generic update message:

> *"Your first wandrer joined — itinerary updated!"*

Detected by checking `contributorCount === 2` (organiser + first companion) on version bump. No schema changes required.

---

## 13. Activity Swap Animation (Card Flip)

**File:** `client/src/components/activity-card.tsx`

Replaces the plain 800ms content-swap with a Framer Motion 3D card flip (`rotateY`). The front face shows the current activity; the back face reveals the backup activity mid-flip.

No AI involvement. Pure animation enhancement.

---

## Future AI Features (see `docs/roadmap.md`)

- **Layer 2 temporal awareness** — live events API (Ticketmaster, Eventbrite) injected as context before generation
- **Itinerary regeneration** — "Regenerate" button to re-run AI with the same preferences but a different seed
- **Budget breakdown** — AI-estimated per-activity costs summed into a trip total
- **Natural language refinement** — chat interface to tweak the itinerary ("make Day 2 more relaxed")
- **Dynamic image search** — Unsplash API queried per activity name instead of static CDN URLs
- **"You've been here before" memory** — exclude prior activity names from prompt for returning visitors
- **End-of-trip rating** — 1–5 rating stored per trip, feeds future preference weighting
