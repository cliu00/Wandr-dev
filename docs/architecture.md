# Wandr — Application Architecture

The source diagram is at `docs/architecture.excalidraw` (open with [Excalidraw](https://excalidraw.com)).

---

## Components

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript (Vite) |
| API | REST — Node.js / Express |
| Backend | Business logic, prompt building |
| Database | PostgreSQL (Drizzle ORM) |
| AI Service | Claude API or OpenAI API |

---

## Flows

### Single-User Flow

1. User fills out intake form
2. `POST /api/trips/create {destination, vibe, budget, ...}`
3. Backend builds prompt → calls AI API → receives itinerary JSON
4. Itinerary stored in DB as **Trip ID** (e.g. `abc123`)
5. User is redirected to `/itinerary/abc123`
6. On return: `GET /api/trips/abc123` → loads saved itinerary

### Multi-User Flow

1. **Person 1** fills intake form → `POST /api/trips/create`
2. Backend builds prompt from P1 prefs → AI returns **v1 itinerary**
3. v1 stored under Trip ID `abc123`; Person 1 sees itinerary + shareable link
4. Person 1 shares link with companions
5. **Person 2** opens link, fills intake → `POST /api/survey/abc123/respond`
6. Backend fetches all prefs for `abc123` → builds merged prompt → AI returns **v2 itinerary**
7. Trip `abc123` is updated to v2; previous version is saved
8. Person 2 sees v2 directly
9. Person 1's itinerary page **auto-updates** to v2 with notification: *"Itinerary updated as Person 2 joined!"*

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/trips/create` | Create trip and generate initial itinerary |
| `GET` | `/api/trips/:id` | Fetch current itinerary for a trip |
| `POST` | `/api/survey/:id/respond` | Submit participant preferences, triggers regeneration |

---

## Itinerary Versioning

When a new participant joins and submits preferences, a new itinerary version is generated. The current version is updated but **all previous versions are retained**.

- Each version is stored with a version number and timestamp
- The current itinerary always reflects the latest version
- Previous versions can be accessed for comparison or rollback

---

## Open Design Questions

- Should the trip organizer approve the regenerated itinerary before it goes live?
- Should participants be able to see previous versions?
- What is the maximum number of participants per trip?
