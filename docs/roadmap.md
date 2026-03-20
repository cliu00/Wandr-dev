# Wandr — Product Roadmap

Future ideas and planned improvements. Items are roughly ordered by impact vs. effort.

---

## Near-term

### Temporal Awareness — Layer 2 (Real-time Events)
Before calling Claude, query an events API for the destination + date range and inject the top 3–5 results as context into the prompt. Claude then decides whether to incorporate them.

- **API options**: PredictHQ (demand intelligence), Ticketmaster Discovery, Eventbrite
- **Implementation**: new `fetchEvents(destination, startDate, endDate)` function in `server/services/ai.ts`, runs in parallel with prompt build, 1s timeout with silent fallback
- **Architecture**: new "Events API" box in the Server → AI API flow; no changes to DB schema or client
- **Covers**: concerts, sports playoffs, pop-up festivals, one-off events (e.g. Taylor Swift in Vancouver)

### Map Tiles — Luxury Style
Replace OpenStreetMap tiles with Mapbox luxury/light style tiles for a more premium look on the itinerary map.

c
---

## Medium-term

### Saved Itineraries

### Itinerary Regeneration / Refinement
Allow users to give feedback on individual cards ("too touristy", "I've been here before") and regenerate just that block without regenerating the full itinerary.

### Export / Share
- PDF export of the full itinerary
- Calendar export (`.ics`) so users can add activities to their calendar
- Read-only public share link (already partially built)

### Budget Breakdown
Show an estimated total trip cost based on the per-activity cost ranges, broken down by category (food, activities, transport).

---

## Longer-term

### Booking Integrations
Surface direct booking links for activities and restaurants (e.g. OpenTable for restaurants, GetYourGuide/Viator for activities).

### Neighbourhood-based Planning
Let users anchor to a specific neighbourhood ("I'm staying in Le Marais") and cluster all recommendations within walking distance.

### Post-trip Memory
After the trip, let users mark what they actually did, rate it, and use that to personalise future itineraries.

### Multi-city Itineraries
Support trips that span more than one city (e.g. Tokyo → Kyoto → Osaka over 7 days).
