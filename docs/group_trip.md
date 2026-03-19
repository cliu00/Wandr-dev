# Group Trip — Backend Implementation Steps

## Overview
Multi-user flow: an organizer creates a group trip, invites companions via personal links, each participant fills a short survey, and Wandr merges everyone's preferences before calling Claude once to generate a shared itinerary.

---

## Step 1 — Database Schema (`shared/schema.ts`)

Added 2 tables:

### `group_trips`
One row per group planning event. Created when the organizer submits the intake form with `groupType="group"`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `trip_id` | FK → trips | null until itinerary is generated |
| `organizer_name` | varchar | shown on participant welcome screen |
| `destination` | varchar | from organizer's intake |
| `start_date` | varchar | from organizer's intake |
| `duration_days` | int | from organizer's intake |
| `status` | varchar | `open` → `generating` → `complete` |
| `created_at` | timestamp | |

### `group_participants`
One row per invited person. The `token` is a random string embedded in their personal join URL — it identifies who is submitting without requiring a login.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `group_trip_id` | FK → group_trips | links back to the group |
| `name` | varchar | entered by organizer |
| `token` | varchar unique | random hex string, goes in the join URL |
| `responded` | boolean | false until survey is submitted |
| `preferences` | jsonb | null until survey submitted |
| `created_at` | timestamp | |

Indexes on `group_trip_id` and `token` for fast lookups.

---

## Step 2 — Storage Methods (`server/storage.ts`)

### Group trip methods
- `createGroupTrip(data)` — insert a new group trip row
- `getGroupTrip(id)` — fetch by ID
- `updateGroupTripStatus(id, status)` — progress through `open → generating → complete`
- `linkGroupTripToTrip(id, tripId)` — sets `trip_id` once the itinerary is ready, also marks `complete`

### Participant methods
- `createParticipant(data)` — insert a participant row with token
- `getParticipantByToken(token)` — used when participant opens their join link to identify who they are
- `getParticipantsByGroup(groupTripId)` — fetch all participants for a group (used for status page and preference merging)
- `updateParticipantResponse(token, preferences)` — saves survey answers, flips `responded` to true

---

## Step 3 — API Routes (`server/routes.ts`)

### `POST /api/groups/create`
Called when organizer completes intake with `groupType="group"`.
- Validates: `organizerName`, `destination`, `startDate`, `durationDays`
- Creates a `group_trips` row with `status = "open"`
- Returns `{ groupTripId }`

### `POST /api/groups/:id/participants`
Organizer enters companion names on the invite page.
- Accepts `{ names: string[] }`
- Creates one participant row per name with a random 10-char hex token
- Returns `{ participants: [{ id, name, token, joinUrl }] }`
- Join URL format: `/survey/join?token=<token>`

### `GET /api/groups/join/:token`
Called when a participant opens their personal link.
- Looks up the token in `group_participants`
- Returns group context for the welcome screen: `organizerName`, `destination`, `startDate`, `durationDays`, `participantName`, `alreadyResponded`

### `POST /api/groups/join/:token`
Participant submits their survey answers.
- Validates: `groupDynamic`, `energy`, `budget`, `activities`, `food`, `activityNotes`, `dietaryNotes`
- Returns 409 if participant already responded
- Calls `updateParticipantResponse` to save answers and mark responded

### `GET /api/groups/:id/status`
Organizer polls this to see who has responded.
- Returns `{ groupTrip, participants, respondedCount, totalCount }`
- Participant objects include `{ id, name, responded, joinUrl }` (no preferences exposed)

### `POST /api/groups/:id/generate`
Organizer triggers itinerary generation.
1. Validates group trip exists and hasn't already started generating
2. Fetches all responded participants
3. Returns 400 if no responses yet
4. Merges all preferences into one `IntakePreferences` object
5. Creates a `trips` row immediately, returns `{ tripId }`
6. Sets group trip status to `"generating"`
7. Fires AI generation in the background (same async pattern as solo)
8. On success: stores itinerary version, calls `linkGroupTripToTrip`
9. On failure: marks trip failed, sets group status to `"failed"`

Client polls `GET /api/trips/:id` until `status === "ready"` — same as solo flow.

---

## Step 4 — Preference Merging (`server/routes.ts`)

`mergeGroupPreferences(responses, groupTrip)` runs before the AI call and blends all participant answers into a single `IntakePreferences` object.

| Field | Merge rule |
|---|---|
| `energy` | Average across all responses |
| `budget` | Most conservative (lowest tier) — so no one is priced out |
| `activityTypes` | Union of all picks, sorted by how many people chose each. Labels mapped to values (e.g. `"Hidden Gems"` → `"hidden-gems"`) |
| `food` | Union of all picks |
| `groupDynamic` | Majority vote; ties fall back to `"mix"` |
| `dietaryNotes` | All non-empty notes joined with `"; "` |
| `destination`, `startDate`, `durationDays` | Always taken from the group trip record (set by organizer) |

### Activity label → value mapping
The participant survey stores activity display labels. These are mapped back to the value keys the AI prompt expects:

| Label | Value |
|---|---|
| Hidden Gems | `hidden-gems` |
| Iconic Landmarks | `iconic-landmarks` |
| Food & Drink | `food-drink` |
| History & Museums | `history-museums` |
| Nature & Parks | `nature-parks` |
| Markets & Shopping | `markets-shopping` |
| Nightlife | `nightlife` |
| Art & Culture | `art-culture` |

---

## Step 5 — Frontend Pages to Wire Up (next)

| Page | What needs to change |
|---|---|
| `survey-invite.tsx` | After organizer intake, call `POST /api/groups/create`. When names are entered, call `POST /api/groups/:id/participants` to get real tokens and join URLs. |
| `survey-join.tsx` | On load, call `GET /api/groups/join/:token` to populate destination, dates, and organizer name. On final step, call `POST /api/groups/join/:token`. |
| `survey-status.tsx` | Poll `GET /api/groups/:id/status`. Generate button calls `POST /api/groups/:id/generate`, then polls `GET /api/trips/:id` until ready. |

---

## Key Design Decisions

- **Token-based identity** — no login required for participants. The token in the URL is enough to identify and authenticate each participant's submission.
- **Organizer controls generation** — participants can respond at any time, but only the organizer decides when to generate. This allows waiting for stragglers.
- **Conservative budget merging** — takes the lowest budget tier so the itinerary is accessible to everyone in the group.
- **Same async generation pattern as solo** — `POST /api/groups/:id/generate` returns `tripId` immediately; client polls `GET /api/trips/:id`. No new polling infrastructure needed.
- **Preference hash cache still applies** — if two groups happen to submit identical merged preferences, the second group gets the cached itinerary at no AI cost.
