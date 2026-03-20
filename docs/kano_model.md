# Kano Model Analysis — Wandr

Applying the Kano framework to categorise Wandr's current and potential features by their relationship to user satisfaction. Features are mapped across five categories based on how users respond to their presence or absence.

---

## Must-Have (Basic Features)
> Expected baseline. Absence causes strong dissatisfaction; presence is taken for granted.

| Feature | Why it's a Must-Have |
|---|---|
| Destination input | Without this, nothing works — the entire product fails |
| Duration selection | Core trip planning parameter; users assume this exists |
| AI itinerary generation | The core value proposition; a broken or missing result destroys trust |
| Morning / afternoon / evening structure | Users expect a day-by-day, time-structured plan |
| Activity & food preference inputs | Without personalisation inputs, the output feels generic |
| Accurate activity names & addresses | Wrong or invented locations erode trust immediately |
| Cost range estimates | Travellers need to sanity-check affordability |
| Mobile-responsive layout | Most users plan on their phone; a broken mobile view is a dealbreaker |
| Account sign-up & login | Required for any saved state, trip history, or group coordination |
| Trip persistence (saved to account) | Once generated, users expect their trip to be retrievable |

---

## Performance / One-Dimensional (More = Better)
> Linear relationship — higher quality directly increases satisfaction; lower quality increases dissatisfaction.

| Feature | Why it scales linearly |
|---|---|
| Quality & specificity of AI recommendations | Better local knowledge → more satisfied users; generic output → dissatisfaction |
| Speed of itinerary generation | Faster = better; every extra second of waiting reduces confidence |
| Number of trip days supported | More days = more useful for longer trips |
| Accuracy of lat/lng coordinates on activities | More accurate pinpoints → better usability when navigating in-destination |
| Relevance of activity swaps / backups | More relevant alternatives → more useful when conditions change |
| Breadth of destination coverage | More cities supported = wider addressable market |
| Preference options (activity types, food, vibe) | More granular inputs → more personalised and satisfying output |

---

## Attractive / Delighters
> Unexpected. Absence causes no dissatisfaction; presence creates disproportionate delight and loyalty.

| Feature | Why it delights |
|---|---|
| Solo → Group upgrade (friend joins, itinerary regenerates) | Nobody expects a trip to evolve dynamically when a friend adds preferences — genuinely surprising |
| matchedFor badges | Seeing your name on activities that match your specific preferences feels personal and considered |
| Trip vibe tagline ("A foodie's deep dive with room to wander") | A single evocative line that captures the character of the trip — feels like a human curator wrote it |
| Seasonal & festival awareness | AI incorporates cherry blossom season, Oktoberfest, Christmas markets based on travel dates — unexpected, impressive |
| Cinematic generating screen | Two-phase animated loading experience (hero image → preference chips) makes waiting feel intentional, not frustrating |
| Day countdown ("In 14 days" / "Tomorrow" / "Today!") | Small flourish that makes the trip feel real and imminent |
| Weather forecast for Day 1 | Practical and delightful — users don't expect a travel planning app to surface live weather |
| Export to PDF & iCal | Removes friction between planning and doing; feels like a complete product |
| Editable trip name | Giving the trip a personal name ("The Crew's Tokyo Run") creates ownership and emotional attachment |
| whyForYou copy on each activity | A 10-word explanation tied to the user's stated preferences — feels like a thoughtful friend explained it |

---

## Indifferent (Neutral)
> Presence or absence doesn't meaningfully shift satisfaction. Often internal assumptions that missed the user.

| Feature | Why it's neutral |
|---|---|
| Survey status page (`/survey/status`) | The organiser dashboard for the formal group flow — most users never encounter or need it |
| Formal group invite flow (`/survey/invite`) | Replaced by the simpler in-itinerary invite link; the multi-step flow added friction without value |
| Brand / style guide page | Internal reference only; users have no reason to visit |
| FAQ page | Users don't read FAQs — they abandon or ask |
| Version history (`/api/trips/:id/versions`) | Power feature with no UI — technically scaffolded but provides no current user value |

---

## Reverse (Presence hurts)
> Actively decreases satisfaction. Better off removed or made optional.

| Feature | Why it backfires | Status |
|---|---|---|
| Generic "tourist trap" recommendations | If AI outputs obvious choices the user already knows, the core promise fails | **Ongoing** — system prompt deprioritises tourist traps but output quality varies by destination; not fully controllable |
| Intake steps without progress clarity | A long form without a visible end creates abandonment anxiety | **Partial** — numeric counter (e.g. "3/8") exists but no visual progress bar; step count varies by group type which can feel unpredictable |

---

## Migration Notes
The Kano Model predicts that **delighters become must-haves over time** as competitors copy them and user expectations rise. Features to watch:

- **AI-generated itineraries** were a delighter in 2022-23; they are approaching must-have status as users now expect AI personalisation from travel tools
- **matchedFor group tagging** is currently a delighter — will become a performance feature as group travel planning tools mature
- **Seasonal awareness** remains a differentiator but will commoditise as LLM quality improves across all competitors
- **PDF / iCal export** is already a must-have for business travel tools; for leisure it is still a delighter — this will shift

---

## Prioritisation Takeaways

1. **Protect the must-haves first** — AI quality, address accuracy, and trip persistence are non-negotiable before any feature work
2. **Invest in performance features as competitive defence** — generation speed and recommendation specificity are the primary battlegrounds
3. **Double down on delighters for differentiation** — the group upgrade flow, seasonal awareness, and matchedFor personalisation are the hardest things to copy and the most memorable to users
4. **Remove or deprioritise indifferent features** — the formal survey flow and duo/family types should be cut or deferred until there is validated demand
5. **Never add reverse features under pressure** — forced registration, aggressive upsells, or mandatory social sharing will reliably damage conversion and retention
