# 48HRS — Luxury AI Travel Planning App

## Overview
Design prototype of **48hrs** — a luxury AI travel planning app specializing in curated 2–4 day escapes. Pure frontend prototype with hardcoded mock data. No backend changes, no database, no real AI calls.

## Architecture

### Stack
- **Frontend**: React 18 + TypeScript, Vite, TanStack Query, Wouter routing
- **Styling**: Tailwind CSS + Shadcn UI components
- **Animations**: Framer Motion
- **Map**: react-leaflet v4 (OpenStreetMap tiles) — v4 required for React 18 compatibility
- **Date picker**: react-day-picker

### Design System
- **Primary color**: Deep forest green `hsl(155 35% 22%)`
- **Accent/Gold**: Warm gold `hsl(42 70% 52%)`
- **Background**: Warm off-white `hsl(40 20% 97%)`
- **Heading font**: Playfair Display (serif)
- **Body font**: Inter (sans-serif)
- **Gold tailwind token**: `gold` → points to `--accent` CSS variable

### Prototype Scope
All data is hardcoded in `client/src/lib/mock-data.ts`. No API calls are made to the backend for prototype content.

## File Structure

```
client/src/
├── lib/
│   └── mock-data.ts          # All prototype data (itinerary, escapes, participants, images)
├── pages/
│   ├── home.tsx              # Landing page with hero, curated escapes, how-it-works
│   ├── intake.tsx            # 8-step quiz (solo/group branching)
│   ├── generating.tsx        # Cinematic loading screen (2 phases)
│   ├── itinerary.tsx         # Full itinerary view with map
│   ├── survey-invite.tsx     # Group invite / share link screen
│   ├── survey-join.tsx       # Participant intake wizard (4 steps)
│   ├── survey-status.tsx     # Organizer view of group responses
│   └── not-found.tsx         # 404 page
├── components/
│   ├── nav.tsx               # Navigation (transparent/solid variants)
│   ├── activity-card.tsx     # Itinerary activity card with swap
│   ├── itinerary-map.tsx     # react-leaflet map component
│   ├── empty-state.tsx       # Reusable empty state with optional bg image
│   └── error-state.tsx       # Reusable error state
└── App.tsx                   # Route definitions
```

## Routes
| Path | Component | Notes |
|------|-----------|-------|
| `/` | Home | Landing page |
| `/intake` | Intake | 8-step quiz, supports `?destination=` param |
| `/generating` | Generating | Auto-navigates to `/itinerary/london-2day` after 6.5s |
| `/itinerary/:id` | ItineraryView | Always loads MOCK_ITINERARY |
| `/survey/invite` | SurveyInvite | Share link screen |
| `/survey/join` | SurveyJoin | Participant intake (4 steps) |
| `/survey/status` | SurveyStatus | Organizer dashboard |
| `*` | NotFound | Custom 404 |

## Key Design Notes
- Hero sections use Unsplash CDN URLs (no API key) — `?w=1600&q=85` for hero, `?w=800&q=80` for cards
- Map markers: custom `DivIcon` circles — Day 1 = forest green, Day 2 = gold
- Swap button on activity cards toggles between primary and backup activity
- Group survey flow: invite → join (per-participant survey) → status → generating
- Rest blocks in itinerary have softened card styling and no backup/swap option

## Future Upgrade Notes
- Map: replace OpenStreetMap tiles with Mapbox luxury style tiles for visual refinement
- Images: replace static Unsplash CDN URLs with Unsplash API for dynamic search
- Authentication: Replit Auth integration already scaffolded (javascript_log_in_with_replit)
- AI: OpenAI integration installed (javascript_openai) — ready to replace mock itinerary generation
