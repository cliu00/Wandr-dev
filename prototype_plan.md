# Wandr — Design Prototype Plan

## What We're Building
A fully navigable design prototype of Wandr — a luxury AI travel planning app.
All screens and flows are complete with hardcoded mock data. No database, no backend,
no real AI calls. The goal is to experience the full product as if it were live.

---

## Approach
- Pure frontend only — all data in `client/src/lib/mock-data.ts`
- No backend changes — `server/` files untouched
- No database — no schema, no migrations
- Simulated AI — loading screen then hardcoded itinerary
- Simulated group flow — share/status screens with mock participants
- Real navigation — all routes work, no dead ends
- Luxury design — the primary deliverable

---

## Design System

### Color Palette — Light Mode

| Token             | HSL Value       | Role                              |
|-------------------|-----------------|-----------------------------------|
| Background        | 40 20% 97%      | Page backgrounds                  |
| Foreground        | 25 15% 12%      | All primary text                  |
| Primary           | 155 35% 22%     | Buttons, active states, progress  |
| Primary Foreground| 0 0% 98%        | Text on green buttons             |
| Accent / Gold     | 42 70% 52%      | Decorative lines, stars, progress |
| Card              | 0 0% 100%       | Activity cards, panels            |
| Border            | 40 15% 88%      | Dividers, card edges              |
| Muted             | 40 15% 93%      | Secondary section backgrounds     |
| Muted Foreground  | 25 10% 48%      | Secondary/tertiary text           |
| Secondary         | 40 15% 90%      | Pills, secondary buttons          |
| Destructive       | 0 72% 51%       | Error states                      |

### Color Palette — Dark Mode

| Token             | HSL Value       |
|-------------------|-----------------|
| Background        | 25 12% 9%       |
| Foreground        | 40 15% 92%      |
| All other tokens adjusted proportionally for dark surfaces |

### Typography

| Use               | Font                              |
|-------------------|-----------------------------------|
| Headings/Editorial| Playfair Display (serif)          |
| Body / UI         | Inter (sans-serif)                |
| Decorative accent | Italic Playfair Display           |

---

## Mock Data (`client/src/lib/mock-data.ts`)

- **MOCK_ITINERARY** — London, 2-day group trip (Alice + Bob), all blocks populated
  (Morning/Afternoon/Evening per day, each with name, description, whyForYou,
  costRange, imageUrl, lat/lng, backup, groupAttribution)
- **CURATED_ESCAPES** — 6 destinations: London, Paris, Tokyo, Lisbon, Barcelona, Kyoto
  (id, tagline, imageUrl, dates, duration, pricePerDay, tags)
- **MOCK_PARTICIPANTS** — Alice (completed), Bob (completed), Charlie (pending)
- **STOCK_IMAGES** — map of destination/category keys to Unsplash CDN URLs

> *Image note: Static Unsplash CDN URLs used for prototype.
> Future upgrade: replace with Unsplash API dynamic search.*

---

## Screens & Tasks

### T001 — Theme & Design System
**Files:** `client/src/index.css`, `tailwind.config.ts`

- Apply full luxury color palette above to all CSS variables
- Set `--font-sans` to Inter, `--font-serif` to Playfair Display
- Add `gold` color token in Tailwind config
- Set subtle warm shadows for card depth

---

### T002 — Mock Data File
**Files:** `client/src/lib/mock-data.ts`

- Create all hardcoded data exports listed above
- All Unsplash image URLs must be direct CDN links (no API key required)

---

### T003 — Landing Page (`/`)
**Files:** `client/src/pages/home.tsx`

**Navigation**
- Logo "48HRS" in Playfair Display — left
- Destinations + Journal links — center-right
- Bookmark icon + Login button (shows "Login coming soon" toast in prototype)

**Hero Section** (full viewport height)
- Atmospheric background photo + dark gradient wash (bottom 60%)
- Large serif headline: *"Quick Getaways, Masterfully Planned."*
- Thin gold decorative underline beneath headline
- Subheading: *"Specializing in curated 2–4 day escapes for individuals and groups."*
- White pill search bar: destination input + Group toggle + "Curate My Escape →" green button
- Category filter pills: Culture / Adventure / Relaxation / Dining / History

**Curated Escapes Section** (below hero, light background)
- Section heading in serif + subheading
- Horizontally scrollable row of 6 destination cards:
  - Full-bleed destination photo + dark gradient overlay
  - "from $X/day" white pill badge — top right
  - Destination name + tagline — bottom white text
  - Date range + duration below card
- Clicking any card → `/intake?destination=<city>&escape=<id>`

**How It Works Section**
- 3 steps with icons: Tell us your style / We curate your escape / Adjust until perfect

**Footer** — minimal links

---

### T004 — Intake Quiz (`/intake`)
**Files:** `client/src/pages/intake.tsx`

- Light background, no nav chrome
- Thin green progress bar top + step counter "X/8" right
- Framer Motion slide transitions between steps
- Sticky full-width dark green Continue button bottom

| Step | Question                       | Input                                        | Notes                    |
|------|--------------------------------|----------------------------------------------|--------------------------|
| 1    | How long is your escape?       | 4 tiles: 2 / 3 / 4 / 4+ days                |                          |
| 2    | When are you travelling?       | Date range calendar picker                   | Min date = today         |
| 3    | Who's coming?                  | 4 stacked rows with icon + sublabel          | Sets isGroupTrip flag    |
| 4    | What's your energy?            | Horizontal slider                            | 3 labels                 |
| 5    | Daily budget per person?       | 2×2 grid of tiles with sublabels             |                          |
| 6    | What kind of finds?            | 2-col multi-select grid                      | Multiple selections      |
| 7    | How do you feel about food?    | 3 stacked rows with icon + sublabel          |                          |
| 8    | Want built-in downtime?        | 2 tiles: Yes / No                            | Solo only, skip for group|

- Solo final CTA: "Curate My Escape →" → `/generating`
- Group final CTA: "Invite My Crew →" → `/survey/invite`
- Query param `?destination=London` shows read-only destination label on every step

---

### T005 — Generation Loading Screen (`/generating`)
**Files:** `client/src/pages/generating.tsx`

**Phase 1: Atmospheric Moment (0–4s)**
- Full viewport destination photo + dark overlay
- Large Playfair serif destination name + trip duration subtitle
- Animated text sequence (fade in/out):
  1. "Mapping your destination..."
  2. "Discovering hidden gems locals love..."
  3. "Balancing your schedule..."
  4. "Adding the finishing touches..."
- Thin gold progress bar: 0 → 75%

**Phase 2: Skeleton Reveal (4–6s)**
- Transition to light background
- Shimmer skeleton blocks: Day 1 header + 3 blocks, Day 2 header + 3 blocks
- Gold progress bar: 75 → 100%
- Auto-navigate to `/itinerary/london-2day` after 6s

---

### T006 — Itinerary View (`/itinerary/:id`)
**Files:** `client/src/pages/itinerary.tsx`, `client/src/components/activity-card.tsx`,
`client/src/components/itinerary-map.tsx`

**Layout**
- Desktop: two-column (55% itinerary left, 45% sticky map right)
- Mobile: single column + floating "View Map" button → bottom sheet

**Header**
- Back arrow / "[Destination] · [N]-day itinerary" center / Share icon (copies fake URL, toast)

**Day Sections**
- "Day 1", "Day 2" in prominent Playfair serif with date

**Activity Cards** (one per time block)
- Time badge with icon: Morning (sun) / Afternoon / Evening (moon) / Rest (bed)
- Stock photo — full card width, 180px height, object-cover
- Venue name in Playfair serif (large)
- Category label — muted, small caps
- Description paragraph
- "Why this for you" box — gold star icon, italic text, muted background
- Group attribution chips — small name badges per participant satisfied
- Backup row — "Backup: [Name] · [cost]" + Swap button
  - Swap: shows spinner then swaps primary/backup content
- Rest blocks — softer background, no backup option

**Map Panel**
- OpenStreetMap via react-leaflet
- Custom markers (no default Leaflet blue):
  - Day 1 = dark green circles with activity number
  - Day 2 = gold circles with activity number
- Clicking marker scrolls to corresponding card (desktop)

---

### T007 — Group Survey Flow

#### Invite Screen (`/survey/invite`)
**Files:** `client/src/pages/survey-invite.tsx`

- "Invite your crew" heading + destination/dates
- Fake shareable URL in copy-able input + copy button
- Share buttons: Email / SMS / WhatsApp (toast: "Sharing coming in the full version")
- "Track responses" → `/survey/status`

#### Participant Intake (`/survey/join`)
**Files:** `client/src/pages/survey-join.tsx`

- Name input (required) + email (optional) → "Join the planning →"
- Runs intake Steps 4–7 with destination/dates shown as read-only context at top
- Confirmation screen: *"Thanks [Name]! Your preferences have been added."*
  with atmospheric destination background

#### Organizer Status (`/survey/status`)
**Files:** `client/src/pages/survey-status.tsx`

- "Who's in?" heading + trip destination/dates
- Participant list (from MOCK_PARTICIPANTS):
  - Alice — Completed (green badge) + timestamp
  - Bob — Completed (green badge) + timestamp
  - Charlie — Pending (muted badge) + "Waiting..."
- "2 of 3 responded" progress bar
- "Generate Itinerary" CTA → `/generating`
- "Invite more people" link → `/survey/invite`

---

### T008 — App Wiring, Empty & Error States
**Files:** `client/src/App.tsx`, `client/src/components/nav.tsx`,
`client/src/components/empty-state.tsx`, `client/src/components/error-state.tsx`

**Routes**

| Path               | Component         | Nav visible? |
|--------------------|-------------------|--------------|
| `/`                | Home              | Yes          |
| `/intake`          | Intake            | No           |
| `/generating`      | GeneratingScreen  | No           |
| `/itinerary/:id`   | ItineraryView     | Yes          |
| `/survey/invite`   | SurveyInvite      | No           |
| `/survey/join`     | SurveyJoin        | No           |
| `/survey/status`   | SurveyStatus      | No           |
| `*`                | 404               | No           |

**Empty State Component**
- Atmospheric background image, serif headline, subheading, optional CTA button

**Error State Component**
- On-brand copy, retry button, back to home link
- 404: *"This escape couldn't be found."*
- Generation error: *"We hit a snag curating your escape. Want to try again?"*

---

## Future Upgrades (Post-Prototype)
- Replace static stock image URLs with Unsplash API dynamic search*
- Replace OpenStreetMap with Mapbox custom luxury tile style*
- Connect OpenAI API for real itinerary generation
- Add PostgreSQL database for saved itineraries and group surveys
- Implement Replit Auth for user accounts
- Add real Email/SMS/WhatsApp sharing
- Session-based itinerary save on login
