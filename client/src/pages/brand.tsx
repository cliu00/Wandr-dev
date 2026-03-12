import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/nav";

const P = "hsl(155, 35%, 22%)";
const G = "#b8965a";

const CONCEPTS = [
  {
    id: "mobius",
    name: "Möbius Strip",
    description: "An infinite loop with a half-twist — no beginning, no end. The journey is perpetual.",
    svg: (
      <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* back half of right loop */}
        <path d="M50 30 C58 14 86 12 90 30 C94 48 68 52 50 30" stroke={P} strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.28" />
        {/* front left loop */}
        <path d="M50 30 C42 46 14 48 10 30 C6 12 32 8 50 30" stroke={P} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        {/* front right loop (gap at crossing) */}
        <path d="M54 28 C62 14 86 12 90 30 C94 48 68 52 50 30" stroke={P} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        {/* gold twist accent dot */}
        <circle cx="50" cy="30" r="3.5" fill={G} />
      </svg>
    ),
  },
  {
    id: "boot",
    name: "Walking Boot",
    description: "The wanderer's essential tool. A minimal boot silhouette — grounded, purposeful, ready.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* sole */}
        <rect x="14" y="74" width="66" height="10" rx="5" fill={P} />
        {/* toe cap accent */}
        <rect x="14" y="72" width="24" height="8" rx="4" fill={G} />
        {/* upper boot body */}
        <path d="M24 74 L24 42 C24 36 30 30 36 30 L50 30 L50 50 L68 50 L72 74 Z" fill={P} />
        {/* shaft */}
        <rect x="36" y="14" width="14" height="30" rx="4" fill={P} />
        {/* lace holes row */}
        <circle cx="43" cy="22" r="2" fill="white" opacity="0.6" />
        <circle cx="43" cy="30" r="2" fill="white" opacity="0.6" />
        <circle cx="43" cy="38" r="2" fill="white" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "stars",
    name: "Star Trail",
    description: "Five stars of descending size trace a wandering arc — the path of someone following curiosity across the sky.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* arc guide (invisible) */}
        {/* Stars along a gentle arc from bottom-left to top-right */}
        {[
          { cx: 18, cy: 78, r: 4.5 },
          { cx: 34, cy: 60, r: 6 },
          { cx: 50, cy: 46, r: 8 },
          { cx: 67, cy: 34, r: 6 },
          { cx: 82, cy: 22, r: 4.5 },
        ].map(({ cx, cy, r }, i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <polygon
              points={Array.from({ length: 5 }, (_, k) => {
                const outer = r;
                const inner = r * 0.42;
                const angle = (k * 72 - 90) * (Math.PI / 180);
                const inner_angle = angle + 36 * (Math.PI / 180);
                return `${outer * Math.cos(angle)},${outer * Math.sin(angle)} ${inner * Math.cos(inner_angle)},${inner * Math.sin(inner_angle)}`;
              }).join(" ")}
              fill={i === 2 ? G : P}
              opacity={i === 2 ? 1 : 0.75 + i * 0.02}
            />
          </g>
        ))}
        {/* dotted connecting trail */}
        <path d="M18 78 Q35 55 50 46 Q65 37 82 22" stroke={P} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.3" />
      </svg>
    ),
  },
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
    id: "footprints",
    name: "Footprints",
    description: "Left-right alternating footprints tracing a gentle curve — the most literal mark of a wanderer.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left foot - bottom */}
        <ellipse cx="32" cy="82" rx="7" ry="10" rx2="5" fill={P} transform="rotate(-15 32 82)" />
        <ellipse cx="26" cy="72" rx="3" ry="2.5" fill={P} transform="rotate(-15 26 72)" />
        <ellipse cx="32" cy="70" rx="3" ry="2.5" fill={P} transform="rotate(-15 32 70)" />
        <ellipse cx="38" cy="70" rx="2.5" ry="2" fill={P} transform="rotate(-15 38 70)" />
        {/* Right foot - middle */}
        <ellipse cx="62" cy="57" rx="7" ry="10" fill={P} transform="rotate(15 62 57)" />
        <ellipse cx="56" cy="46" rx="3" ry="2.5" fill={P} transform="rotate(15 56 46)" />
        <ellipse cx="62" cy="44" rx="3" ry="2.5" fill={P} transform="rotate(15 62 44)" />
        <ellipse cx="68" cy="44" rx="2.5" ry="2" fill={P} transform="rotate(15 68 44)" />
        {/* Left foot - top */}
        <ellipse cx="34" cy="32" rx="7" ry="10" fill={G} transform="rotate(-15 34 32)" opacity="0.8" />
        <ellipse cx="28" cy="22" rx="3" ry="2.5" fill={G} transform="rotate(-15 28 22)" opacity="0.8" />
        <ellipse cx="34" cy="20" rx="3" ry="2.5" fill={G} transform="rotate(-15 34 20)" opacity="0.8" />
        <ellipse cx="40" cy="20" rx="2.5" ry="2" fill={G} transform="rotate(-15 40 20)" opacity="0.8" />
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
    id: "horizon",
    name: "Rising Horizon",
    description: "A sunrise cresting over a curved horizon line — the moment a journey begins.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* horizon arc */}
        <path d="M12 65 Q50 45 88 65" stroke={P} strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* ground fill suggestion */}
        <path d="M12 65 Q50 45 88 65 L88 88 Q50 88 12 88 Z" fill={P} opacity="0.08" />
        {/* sun semicircle */}
        <path d="M30 65 Q50 38 70 65 Z" fill={G} opacity="0.9" />
        <circle cx="50" cy="65" r="0" />
        {/* sun rays */}
        {[0, 30, 60, 120, 150, 180].map((deg, i) => {
          if (deg > 0 && deg < 180) {
            const rad = (deg - 90) * (Math.PI / 180);
            return (
              <line key={i}
                x1={50 + 24 * Math.cos(rad)} y1={65 + 24 * Math.sin(rad)}
                x2={50 + 30 * Math.cos(rad)} y2={65 + 30 * Math.sin(rad)}
                stroke={G} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"
              />
            );
          }
          return null;
        })}
        {/* sun body */}
        <circle cx="50" cy="65" r="11" fill={G} />
        {/* horizon line on top */}
        <path d="M12 65 Q50 45 88 65" stroke={P} strokeWidth="3" strokeLinecap="round" fill="none" />
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
    id: "summit",
    name: "Summit Trail",
    description: "A mountain peak with a winding path to the top — effort, elevation, and the view that makes it worth it.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* mountain silhouette */}
        <path d="M10 82 L50 18 L90 82 Z" fill={P} opacity="0.12" />
        <path d="M10 82 L50 18 L90 82 Z" stroke={P} strokeWidth="3" strokeLinejoin="round" fill="none" />
        {/* snow cap */}
        <path d="M50 18 L38 42 L62 42 Z" fill={P} opacity="0.25" />
        {/* winding trail up the mountain */}
        <path d="M72 82 C64 75 40 72 38 65 C36 58 58 54 56 46 C54 38 44 36 50 28" stroke={G} strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
        {/* summit dot */}
        <circle cx="50" cy="18" r="4.5" fill={G} />
        {/* base dot */}
        <circle cx="72" cy="82" r="3.5" fill={P} />
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
          Ten directions for the Wandr mark — each one a different answer to the same question: what does it mean to wander?
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
            The Wandr wordmark currently uses the Waypoint Arc — two filled circles joined by a single curve. It's simple, directional, and works at any size. These ten concepts are explorations of where the identity could go next.
          </p>
        </div>
      </div>
    </div>
  );
}
