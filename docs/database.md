# Wandr — Database Design

**ORM:** Drizzle ORM
**Database:** PostgreSQL
**Schema file:** `shared/schema.ts`
**Storage layer:** `server/storage.ts`

---

## Tables

### `users`
Authenticated user accounts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `varchar` (UUID) | Primary key, auto-generated |
| `username` | `text` | Unique |
| `password` | `text` | Hashed |

---

### `anonymous_sessions`
Tracks AI generation usage for users who haven't signed up. One row per browser session.

| Column | Type | Notes |
|--------|------|-------|
| `session_id` | `varchar` | Primary key — Express session ID |
| `generation_count` | `integer` | How many AI calls this session has made. Max: 2 |
| `created_at` | `timestamp` | Auto |
| `expires_at` | `timestamp` | Set to 24 hours from creation |

**Rules:**
- Anonymous users are limited to **2 AI generations per session**
- Sessions expire after **24 hours** — limit resets naturally on expiry
- If a session is expired, `isGenerationAllowed()` returns `true` and the count resets

---

### `trips`
One row per trip planning session. Created when the user submits the intake form.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `varchar` (UUID) | Primary key, auto-generated |
| `user_id` | `varchar` | FK → `users.id`. Null for anonymous users |
| `anonymous_session_id` | `varchar` | FK → `anonymous_sessions.session_id`. Null for auth users |
| `destination` | `varchar` | e.g. "Vancouver" |
| `start_date` | `varchar` | Date string from intake form |
| `duration_days` | `integer` | Number of days |
| `group_type` | `varchar` | `solo` \| `duo` \| `group` \| `family` |
| `preferences` | `jsonb` | Full intake form payload (see below) |
| `current_version` | `integer` | Points to the latest itinerary version. Default: 1 |
| `created_at` | `timestamp` | Auto |
| `updated_at` | `timestamp` | Updated whenever a new itinerary version is generated |

**Notes:**
- Exactly one of `user_id` or `anonymous_session_id` will be set per row
- `current_version` is bumped automatically when a new itinerary version is created

**`preferences` JSON shape:**
```json
{
  "energy": 3,
  "budget": "mid",
  "activityTypes": ["food", "culture"],
  "food": ["local", "vegetarian"],
  "anchorActivity": "visit a local market",
  "activityNotes": "...",
  "dietaryNotes": "...",
  "soloVibe": "explorer",
  "duoStyle": null,
  "groupDynamic": null,
  "kidsAges": [],
  "familyNeeds": []
}
```

---

### `itinerary_versions`
Every AI generation creates a new row. Trips are never overwritten — all versions are retained.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `varchar` (UUID) | Primary key, auto-generated |
| `trip_id` | `varchar` | FK → `trips.id` |
| `version_number` | `integer` | Starts at 1, increments on each regeneration |
| `itinerary_data` | `jsonb` | Full itinerary JSON (see below) |
| `preference_hash` | `varchar` | SHA-256 of the preferences JSON. Indexed |
| `generated_by` | `varchar` | `"solo"` for single-user, participant name for multi-user |
| `created_at` | `timestamp` | When this version was generated |

**Indexes:**
- `idx_itinerary_versions_trip_id` on `trip_id` — fast version lookups per trip
- `idx_itinerary_versions_preference_hash` on `preference_hash` — fast deduplication checks

**`itinerary_data` JSON shape:**
```json
{
  "destination": "Vancouver",
  "country": "Canada",
  "durationDays": 2,
  "groupType": "solo",
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-03-20",
      "blocks": [
        {
          "id": "block-1",
          "timeSlot": "morning",
          "primary": {
            "name": "Café Medina",
            "type": "cafe",
            "description": "...",
            "whyForYou": "...",
            "costRange": "$10–15",
            "imageUrl": "...",
            "lat": 49.2827,
            "lng": -123.1207
          },
          "backup": {
            "name": "Revolver Coffee",
            "costRange": "$8–12"
          }
        }
      ]
    }
  ]
}
```

---

## Relationships

```
users
  └── trips (one user → many trips)

anonymous_sessions
  └── trips (one session → up to 2 trips)

trips
  └── itinerary_versions (one trip → many versions)
        version 1  ← initial generation
        version 2  ← after person 2 joins (multi-user)
        version 3  ← after person 3 joins (multi-user)
```

---

## Key Logic

### Anonymous user flow
1. User hits the app → Express session created (lasts 24 hours)
2. Session ID stored in `anonymous_sessions` on first generation attempt
3. `isGenerationAllowed(sessionId)` checked before every AI call
4. `incrementGenerationCount(sessionId)` called after every AI call
5. On sign-up, `trips.user_id` is set and `trips.anonymous_session_id` is cleared

### Preference deduplication (skip AI call)
1. Incoming preferences are hashed with SHA-256 → `preferenceHash`
2. `getItineraryByHash(hash)` checks if an identical itinerary was already generated
3. If found → copy `itinerary_data` to a new `itinerary_versions` row for the new trip (no AI call)
4. If not found → call AI, store result with hash

### Itinerary versioning
1. New trip created → `trips.current_version = 1`
2. `createItineraryVersion()` inserts new row with `version_number = N`
3. Same call updates `trips.current_version = N` and `trips.updated_at`
4. `GET /api/trips/:id` always fetches the version matching `current_version`
5. All previous versions remain in the table (available for history/rollback)

---

## Storage Layer Functions

| Function | Description |
|----------|-------------|
| `getUser(id)` | Fetch user by ID |
| `getUserByUsername(username)` | Fetch user by username |
| `createUser(user)` | Insert new user |
| `getOrCreateAnonymousSession(sessionId)` | Find or create anon session record |
| `isGenerationAllowed(sessionId)` | Check if under the 2-call limit |
| `incrementGenerationCount(sessionId)` | Add 1 to session generation count |
| `createTrip(trip)` | Insert new trip row |
| `getTrip(id)` | Fetch trip by ID |
| `createItineraryVersion(version)` | Insert version + bump `current_version` |
| `getLatestItineraryVersion(tripId)` | Fetch version matching `current_version` |
| `getItineraryByHash(hash)` | Find existing itinerary by preference hash |
| `getAllItineraryVersions(tripId)` | All versions for a trip, newest first |
