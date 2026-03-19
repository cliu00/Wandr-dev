# Place Finder Feature

Autocomplete for the destination input on the homepage, restricted to cities, states, and provinces in the US and Canada.

---

## Overview

When a user types in the destination search bar on the homepage, suggestions appear in a dropdown below the input. Suggestions are fetched from the [Photon API](https://photon.komoot.io/) (by Komoot), which uses Elasticsearch under the hood and supports **prefix matching** — meaning partial words like "vanc" correctly return "Vancouver".

---

## Why Photon (not Nominatim)

Nominatim (OpenStreetMap's geocoder) was evaluated first but rejected because it requires complete words — typing "vanc" returns no results for Vancouver. Photon works on partial prefixes, making it suitable for real-time autocomplete.

---

## Implementation

All changes are in `client/src/pages/home.tsx`.

### State

```ts
interface PlaceSuggestion { id: string; label: string; }
const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const searchBarRef = useRef<HTMLDivElement>(null);
```

### Fetching suggestions

Called after a 300ms debounce on every keystroke (minimum 2 characters):

```ts
async function fetchSuggestions(query: string) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=12&lang=en`;
  const res = await fetch(url);
  const data = await res.json();

  const seen = new Set<string>();
  const results: PlaceSuggestion[] = [];

  for (const feature of data.features ?? []) {
    const p = feature.properties ?? {};
    const cc = (p.countrycode ?? "").toUpperCase();

    // US and Canada only
    if (cc !== "US" && cc !== "CA") continue;

    // Cities, towns, villages, states/provinces only — no counties, streets, POIs
    const type = (p.type ?? "") as string;
    if (!["city", "town", "village", "state"].includes(type)) continue;

    const name: string = p.name ?? "";
    const state: string = p.state ?? "";
    const country = cc === "CA" ? "Canada" : "USA";

    if (!name) continue;

    const label = type === "state"
      ? `${name}, ${country}`
      : state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;

    if (!seen.has(label)) {
      seen.add(label);
      results.push({ id: String(p.osm_id ?? label), label });
    }
    if (results.length >= 6) break;
  }

  setSuggestions(results);
  setShowSuggestions(results.length > 0);
}
```

### Selecting a suggestion

The country suffix is stripped before setting the destination value:

```ts
function selectSuggestion(label: string) {
  const short = label.replace(/, (USA|Canada)$/, "");
  setDestination(short);
  setSuggestions([]);
  setShowSuggestions(false);
}
```

### Close on click-outside

```ts
useEffect(() => {
  function onMouseDown(e: MouseEvent) {
    if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
      setShowSuggestions(false);
    }
  }
  document.addEventListener("mousedown", onMouseDown);
  return () => document.removeEventListener("mousedown", onMouseDown);
}, []);
```

### Input behaviour

- `autoComplete="off"` to suppress browser autocomplete
- `onFocus`: reopens dropdown if suggestions already exist
- `onKeyDown`: `Enter` submits, `Escape` closes dropdown
- Dropdown uses `onMouseDown` + `e.preventDefault()` to prevent the input blur from firing before the click registers

---

## Scope

| Included | Excluded |
|---|---|
| Cities, towns, villages | Airports, neighbourhoods, streets |
| States & provinces | Counties (e.g. "Los Angeles County") |
| US and Canada only | All other countries |

---

## Example Results

| Query | Top suggestions |
|---|---|
| `vanc` | Vancouver, British Columbia, Canada · Vancouver, Washington, USA |
| `tor` | Toronto, Ontario, Canada |
| `los` | Los Angeles, California, USA |
| `british` | British Columbia, Canada |
