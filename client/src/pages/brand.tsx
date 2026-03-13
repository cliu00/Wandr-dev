import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/nav";

const P = "hsl(155, 35%, 22%)";
const G = "#b8965a";

const CONCEPTS = [
  {
    id: "compass",
    name: "Compass Rose",
    description: "Four cardinal points reduced to pure geometry. Orientation, not decoration.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* outer ring */}
        <circle cx="50" cy="50" r="36" stroke={P} strokeWidth="1.5" opacity="0.25" />
        {/* N pointer */}
        <path d="M50 14 L44 50 L50 46 L56 50 Z" fill={P} />
        {/* S pointer */}
        <path d="M50 86 L44 50 L50 54 L56 50 Z" fill={P} opacity="0.45" />
        {/* E pointer */}
        <path d="M86 50 L50 44 L54 50 L50 56 Z" fill={P} opacity="0.45" />
        {/* W pointer */}
        <path d="M14 50 L50 44 L46 50 L50 56 Z" fill={P} opacity="0.45" />
        {/* gold centre */}
        <circle cx="50" cy="50" r="5" fill={G} />
        <circle cx="50" cy="50" r="2.5" fill="white" />
        {/* N label */}
        <text x="50" y="11" textAnchor="middle" fontSize="7" fill={P} fontWeight="600" fontFamily="serif">N</text>
      </svg>
    ),
  },
  {
    id: "waypoint",
    name: "Waypoint Arc",
    description: "Two filled circles — origin and destination — joined by a single fluid curve. The current Wandr mark, refined.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="75" r="7" fill={P} />
        <circle cx="80" cy="25" r="7" fill={P} />
        <path d="M20 68 C20 38 80 62 80 32" stroke={P} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* gold midpoint dot */}
        <circle cx="50" cy="52" r="3.5" fill={G} />
      </svg>
    ),
  },
  {
    id: "winding-road",
    name: "Winding Road",
    description: "An S-curve path with terminal dots — the top-down view of every road worth taking.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* road shadow */}
        <path d="M50 88 C72 88 78 68 50 55 C22 42 28 22 50 12" stroke={P} strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.12" />
        {/* main road */}
        <path d="M50 88 C72 88 78 68 50 55 C22 42 28 22 50 12" stroke={P} strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* centre line dashes */}
        <path d="M50 88 C72 88 78 68 50 55 C22 42 28 22 50 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 6" fill="none" opacity="0.5" />
        {/* endpoint dots */}
        <circle cx="50" cy="12" r="5" fill={G} />
        <circle cx="50" cy="88" r="5" fill={G} />
      </svg>
    ),
  },
  {
    id: "paper-plane",
    name: "Paper Plane",
    description: "An origami plane mid-flight on a wandering arc — spontaneous direction, purposeful speed.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* dotted trail arc */}
        <path d="M18 75 Q30 30 72 22" stroke={P} strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" />
        {/* plane body */}
        <g transform="translate(72, 22) rotate(-35)">
          {/* main triangle */}
          <path d="M0 0 L-18 8 L-14 0 L-18 -8 Z" fill={P} />
          {/* wing fold */}
          <path d="M-14 0 L-18 8 L-14 4 Z" fill="white" opacity="0.25" />
        </g>
        {/* gold origin dot */}
        <circle cx="18" cy="75" r="4" fill={G} />
      </svg>
    ),
  },
  {
    id: "hiking-pack",
    name: "Hiking Pack",
    description: "The wanderer's carry-all — an alternative to boots and footprints. Everything you need, nothing you don't.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* main body */}
        <rect x="22" y="28" width="56" height="60" rx="14" fill={P} opacity="0.1" />
        <rect x="22" y="28" width="56" height="60" rx="14" stroke={P} strokeWidth="2.5" fill="none" />
        {/* top handle arc */}
        <path d="M38 28 C38 17 62 17 62 28" stroke={P} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* front zip pocket */}
        <rect x="30" y="52" width="40" height="26" rx="8" fill={P} opacity="0.06" />
        <rect x="30" y="52" width="40" height="26" rx="8" stroke={P} strokeWidth="2" fill="none" opacity="0.55" />
        {/* zip line */}
        <path d="M32 52 Q50 48 68 52" stroke={P} strokeWidth="1.2" strokeDasharray="3 3" fill="none" opacity="0.35" />
        {/* gold zipper pull */}
        <circle cx="50" cy="52" r="3.5" fill={G} />
        {/* top panel divider */}
        <line x1="22" y1="40" x2="78" y2="40" stroke={P} strokeWidth="1.5" opacity="0.18" />
      </svg>
    ),
  },
  {
    id: "folded-map",
    name: "Folded Map",
    description: "A trifold map opened flat — the physical artefact of every trip planned before departure. Route marked, destination pinned.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* left panel */}
        <path d="M10 24 L10 80 L36 76 L36 20 Z" fill={P} opacity="0.1" />
        <path d="M10 24 L10 80 L36 76 L36 20 Z" stroke={P} strokeWidth="2" strokeLinejoin="round" fill="none" />
        {/* centre panel */}
        <path d="M36 20 L36 76 L64 76 L64 20 Z" fill={P} opacity="0.06" />
        <path d="M36 20 L36 76 L64 76 L64 20 Z" stroke={P} strokeWidth="2" strokeLinejoin="round" fill="none" />
        {/* right panel */}
        <path d="M64 20 L64 76 L90 80 L90 24 Z" fill={P} opacity="0.1" />
        <path d="M64 20 L64 76 L90 80 L90 24 Z" stroke={P} strokeWidth="2" strokeLinejoin="round" fill="none" />
        {/* dashed route on centre panel */}
        <path d="M42 66 Q50 46 58 34" stroke={G} strokeWidth="2" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
        {/* destination pin */}
        <circle cx="58" cy="34" r="5.5" fill={G} />
        <circle cx="58" cy="34" r="2.5" fill="white" opacity="0.7" />
        {/* origin dot */}
        <circle cx="42" cy="66" r="3.5" fill={P} />
      </svg>
    ),
  },
  {
    id: "luggage-tag",
    name: "Luggage Tag",
    description: "A personal mark tied to every bag — the smallest, most intimate travel artefact. Your name, your destination.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* tag body */}
        <rect x="20" y="26" width="60" height="66" rx="9" fill={P} opacity="0.08" />
        <rect x="20" y="26" width="60" height="66" rx="9" stroke={P} strokeWidth="2.5" fill="none" />
        {/* string loop */}
        <circle cx="50" cy="16" r="6" stroke={P} strokeWidth="2.5" fill="none" />
        <line x1="50" y1="22" x2="50" y2="26" stroke={P} strokeWidth="2.5" />
        {/* W monogram */}
        <text x="50" y="65" textAnchor="middle" fontSize="30" fill={P} fontWeight="300" fontFamily="serif">W</text>
        {/* info lines */}
        <rect x="30" y="74" width="40" height="2" rx="1" fill={P} opacity="0.2" />
        <rect x="30" y="81" width="26" height="2" rx="1" fill={G} opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "globe",
    name: "Globe Meridian",
    description: "A wireframe globe with equator and meridians — every destination is reachable, every route a line on the surface.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* globe fill */}
        <circle cx="50" cy="50" r="36" fill={P} opacity="0.05" />
        {/* outer ring */}
        <circle cx="50" cy="50" r="36" stroke={P} strokeWidth="2" fill="none" />
        {/* equator */}
        <path d="M14 50 Q50 63 86 50" stroke={P} strokeWidth="1.5" fill="none" opacity="0.45" />
        <path d="M14 50 Q50 37 86 50" stroke={P} strokeWidth="1" fill="none" opacity="0.25" />
        {/* left meridian */}
        <path d="M50 14 Q30 32 30 50 Q30 68 50 86" stroke={P} strokeWidth="1.5" fill="none" opacity="0.35" />
        {/* right meridian */}
        <path d="M50 14 Q70 32 70 50 Q70 68 50 86" stroke={P} strokeWidth="1.5" fill="none" opacity="0.35" />
        {/* central vertical */}
        <line x1="50" y1="14" x2="50" y2="86" stroke={P} strokeWidth="1" opacity="0.2" />
        {/* gold destination pin */}
        <circle cx="64" cy="36" r="5.5" fill={G} />
        <circle cx="64" cy="36" r="2.5" fill="white" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "binoculars",
    name: "Binoculars",
    description: "Forward-facing lenses in silhouette — the scout's tool, the traveller's instinct. Always looking at what's ahead.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* left lens outer */}
        <circle cx="31" cy="57" r="19" fill={P} opacity="0.08" />
        <circle cx="31" cy="57" r="19" stroke={P} strokeWidth="2.5" fill="none" />
        {/* left lens inner */}
        <circle cx="31" cy="57" r="11" fill={P} opacity="0.1" />
        <circle cx="31" cy="57" r="11" stroke={P} strokeWidth="1.5" fill="none" opacity="0.45" />
        {/* right lens outer */}
        <circle cx="69" cy="57" r="19" fill={P} opacity="0.08" />
        <circle cx="69" cy="57" r="19" stroke={P} strokeWidth="2.5" fill="none" />
        {/* right lens inner */}
        <circle cx="69" cy="57" r="11" fill={P} opacity="0.1" />
        <circle cx="69" cy="57" r="11" stroke={P} strokeWidth="1.5" fill="none" opacity="0.45" />
        {/* bridge */}
        <path d="M43 47 Q50 41 57 47" stroke={P} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* top housing */}
        <rect x="36" y="36" width="28" height="10" rx="5" fill={P} opacity="0.2" />
        {/* gold focal dots */}
        <circle cx="31" cy="57" r="3.5" fill={G} />
        <circle cx="69" cy="57" r="3.5" fill={G} />
      </svg>
    ),
  },
];

export default function Brand() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm mb-10">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>
        </Link>

        <h1 className="font-serif text-5xl font-light text-foreground mb-2 tracking-wide">
          Logo Concepts
        </h1>
        <p className="text-muted-foreground text-sm mb-14 max-w-xl leading-relaxed">
          Nine directions for the Wandr mark — each one a different answer to the same question: what does it mean to wander?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONCEPTS.map((concept) => (
            <div
              key={concept.id}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col"
              data-testid={`card-logo-${concept.id}`}
            >
              {/* SVG display */}
              <div className="w-full aspect-square max-h-36 flex items-center justify-center mb-5 rounded-xl bg-background border border-border/50 p-4">
                <div className="w-full h-full flex items-center justify-center">
                  {concept.svg}
                </div>
              </div>

              {/* Concept info */}
              <h2 className="font-serif text-lg font-light text-foreground mb-1.5">
                {concept.name}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {concept.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-2xl border border-border bg-card">
          <p className="font-serif text-xl font-light text-foreground mb-1">
            A note on the current mark
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Wandr wordmark currently uses the Waypoint Arc — two filled circles joined by a single curve. It's simple, directional, and works at any size. These nine concepts are explorations of where the identity could go next.
          </p>
        </div>
      </div>
    </div>
  );
}
