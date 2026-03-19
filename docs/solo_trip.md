# Solo Trip — Backend Implementation Steps

## Overview
Single-user flow: one person completes the intake form, Wandr calls Claude, and returns a personalised itinerary.

---

## Step 1 — Database Schema (`shared/schema.ts`)

Added 3 tables to the existing `users` table:

### `anonymous_sessions`
Tracks how many AI generations an anonymous (not logged-in) user has made.
- `session_id` — primary key, tied to the user's Express session
- `generation_count` — increments each time the AI is called
- `expires_at` — resets after 24 hours

### `trips`
One row per trip planning session.
- Belongs to either an authenticated user (`user_id`) or anonymous session (`anonymous_session_id`)
- Stores the full intake form payload in `preferences` (JSONB)
- `current_version` — pointer to the latest itinerary version
- `generation_failed` — boolean flag set if background AI generation fails

### `itinerary_versions`
Every AI generation creates a new version row. Trips are never overwritten.
- `trip_id` — FK to trips
- `itinerary_data` — full Claude-generated JSON (JSONB)
- `preference_hash` — SHA-256 of the intake preferences, used to skip duplicate AI calls
- Indexed on `trip_id` and `preference_hash`

---

## Step 2 — Storage Layer (`server/storage.ts`)

Replaced in-memory storage with `DatabaseStorage` class backed by Neon (PostgreSQL via Drizzle ORM).

### Anonymous session methods
- `getOrCreateAnonymousSession(sessionId)` — upsert session row
- `isGenerationAllowed(sessionId)` — checks count < 2 and session not expired
- `incrementGenerationCount(sessionId)` — bumps count, resets if expired

### Trip methods
- `createTrip(data)` — insert a new trip row
- `getTrip(id)` — fetch by ID
- `markTripFailed(id)` — sets `generation_failed = true` for error signalling

### Itinerary version methods
- `createItineraryVersion(data)` — insert version row, bump `current_version` on parent trip
- `getLatestItineraryVersion(tripId)` — fetch the version matching `current_version`
- `getItineraryByHash(hash)` — fetch most recent version with matching preference hash (cache lookup)
- `getAllItineraryVersions(tripId)` — fetch all versions ordered by version number

---

## Step 3 — AI Service (`server/services/ai.ts`)

### Preference hashing
`hashPreferences(preferences)` — normalises and SHA-256 hashes the intake payload. Used to detect identical preference sets and skip the AI call.

### Prompt building
Split into two parts for prompt caching:
- **`SYSTEM_PROMPT`** — static rules and JSON schema example, marked with `cache_control: "ephemeral"`. Cached by Anthropic for 5 minutes, billed at 10% of normal input token price.
- **`buildUserMessage(prefs)`** — compact per-request traveller profile (~80 tokens)

### Generation
`generateItinerary(preferences)` — calls `claude-haiku-4-5-20251001` with `max_tokens: 3000`, strips markdown code fences from the response, parses JSON, returns `{ itineraryData, preferenceHash }`.

---

## Step 4 — API Routes (`server/routes.ts`)

### `POST /api/trips/create`
1. Validates request body with Zod
2. Checks anonymous generation limit (2 per 24-hour session)
3. Creates the trip row immediately and returns `{ tripId }` (fast response)
4. Fires AI generation in the background (async, no await)
5. On success: stores itinerary version, increments anon counter
6. On failure: calls `markTripFailed`

### `GET /api/trips/:id`
Returns the trip with its latest itinerary version and a `status` field:
- `generating` — trip exists but no itinerary version yet
- `ready` — itinerary is available
- `failed` — background generation failed

### `GET /api/trips/:id/versions`
Returns all itinerary versions for a trip (for future version history UI).

---

## Step 5 — Session Middleware (`server/index.ts`)

Added `express-session` with `memorystore` so every visitor gets a unique session ID.
- Session TTL: 24 hours
- Session ID used as the anonymous user identifier for rate limiting

Also added `import "dotenv/config"` as the first line so environment variables load before any other imports.

---

## Step 6 — Frontend Wiring

### `client/src/pages/intake.tsx`
- `handleSubmit()` saves preferences to `sessionStorage` under `wandr_pending_preferences`
- Fixed `activityTypes` to store values (`"hidden-gems"`) not labels (`"History & Museums"`)

### `client/src/pages/generating.tsx`
- Reads preferences from `sessionStorage`
- `POST /api/trips/create` — fires immediately, gets `tripId` back in ~100ms
- Polls `GET /api/trips/:id` every 2 seconds until `status === "ready"`
- Navigates to `/itinerary/:tripId` on success
- Shows error states for `limit_reached` (429) and `generation_failed`

### `client/src/pages/itinerary.tsx`
- Replaced hardcoded `MOCK_ITINERARY` with TanStack Query fetching `GET /api/trips/:id`
- Uses `useParams` to get the trip ID from the URL
- Loading skeleton and error states added

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Claude API access |
| `SESSION_SECRET` | Express session signing key |
| `PORT` | Server port (default 5000; use 3001 locally to avoid AirPlay conflict) |

---

## Key Design Decisions

- **Async generation** — POST returns immediately so the UI isn't blocked waiting for Claude
- **Preference hash cache** — identical preference sets reuse the stored itinerary, zero AI cost
- **Prompt caching** — static system prompt cached by Anthropic, ~90% cheaper on repeated calls
- **Anonymous rate limit** — 2 AI calls per session per 24 hours, tracked in DB not memory
- **Version history** — all itinerary versions retained; only `current_version` is shown
