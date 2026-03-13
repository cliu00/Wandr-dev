import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Users, User, Handshake, Sparkles, Compass, ArrowRight, Share2, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { CURATED_ESCAPES } from "@/lib/mock-data";

type TripType = "solo" | "duo" | "group" | "family";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const VANCOUVER: { lat: number; lng: number } = { lat: 49.2827, lng: -123.1207 };

export default function Home() {
  const [, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("solo");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  function distanceLabel(escapeLat: number, escapeLng: number): string {
    const ref = userLocation ?? VANCOUVER;
    const km = haversineKm(ref.lat, ref.lng, escapeLat, escapeLng);
    if (km < 20) return "Local";
    if (km >= 1000) return `${(km / 1000).toFixed(1).replace(/\.0$/, "")}k km away`;
    return `${km.toLocaleString()} km away`;
  }

  function handleCurate() {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    params.set("tripType", tripType);
    navigate(`/intake?${params.toString()}`);
  }

  function handleEscapeClick(escape: typeof CURATED_ESCAPES[0]) {
    navigate(
      `/intake?destination=${encodeURIComponent(escape.destination)}&escape=${escape.id}&tripType=${tripType}`
    );
  }

  const TRIP_TYPES: { value: TripType; label: string; icon: React.ReactNode }[] = [
    { value: "solo", label: "Solo", icon: <User className="w-3.5 h-3.5" /> },
    { value: "duo", label: "Duo", icon: <Handshake className="w-3.5 h-3.5" /> },
    { value: "group", label: "Group", icon: <Users className="w-3.5 h-3.5" /> },
    { value: "family", label: "Family", icon: <Baby className="w-3.5 h-3.5" /> },
  ];

  const HOW_IT_WORKS = [
    {
      icon: <Compass className="w-6 h-6" />,
      step: "01",
      title: "Tell us your style",
      desc: "Answer a few quick questions — who's coming, your energy level, and how you like to spend.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      step: "02",
      title: "Your itinerary, instantly",
      desc: "Wandr builds a day-by-day plan tailored to you — then tweak any detail until it's exactly right.",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      step: "03",
      title: "Save or share",
      desc: "Keep it for yourself or share it with your companions — your escape, ready to go.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav variant="transparent" />

      <main id="main-content">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        aria-label="Plan your escape"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=90)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <h1
            className="font-serif text-6xl md:text-8xl font-light text-white leading-[1.05] mb-2 tracking-wide"
            data-testid="text-hero-headline"
          >
            Quick Getaways,
            <br />
            Masterfully Planned.
          </h1>

          <div className="w-24 h-px bg-accent my-7 mx-auto" />

          <p className="text-white/75 text-base md:text-lg mb-10 max-w-md leading-relaxed tracking-wide">
            Personalised Canadian escapes for solo travellers, couples, groups, and families.
          </p>

          {/* Trip type selector */}
          <div
            role="group"
            aria-label="Trip type"
            className="flex items-center gap-1 mb-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1"
          >
            {TRIP_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTripType(t.value)}
                aria-pressed={tripType === t.value}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  tripType === t.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-white/75 hover:text-white"
                }`}
                data-testid={`button-trip-type-${t.value}`}
              >
                <span aria-hidden="true">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Trip type context */}
          <p className="text-white/55 text-sm mb-4 tracking-wide min-h-[1.25rem] transition-all duration-300">
            {tripType === "solo" && "Your solo adventure, thoughtfully curated."}
            {tripType === "duo" && "Planning for two — every detail, personalised."}
            {tripType === "group" && "A group escape everyone will love."}
            {tripType === "family" && "Family-friendly from start to finish."}
          </p>

          {/* Search bar */}
          <div
            className="w-full max-w-xl bg-white rounded-full shadow-2xl flex items-center overflow-hidden p-1.5 gap-2"
            data-testid="search-bar"
          >
            <div className="flex items-center gap-2 flex-1 px-4">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Where are you dreaming of?"
                aria-label="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCurate()}
                className="flex-1 text-gray-900 placeholder:text-gray-400 text-sm outline-none bg-transparent py-1"
                data-testid="input-destination"
              />
            </div>
            <Button
              onClick={handleCurate}
              className="rounded-full px-6 gap-2 flex-shrink-0"
              data-testid="button-curate-escape"
            >
              <Sparkles className="w-4 h-4" />
              Plan My Adventure
            </Button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-10 bg-white/20" />
          <span className="text-xs tracking-widest uppercase">Explore</span>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-serif text-5xl font-light text-foreground mb-3 tracking-wide">
            How it works
          </h2>
          <p className="text-muted-foreground text-base mb-16 max-w-xl mx-auto">
            From blank canvas to bespoke itinerary in under a minute.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-accent font-semibold tracking-widest mb-1">{item.step}</div>
                  <h3 className="font-serif text-xl font-light mb-2 tracking-wide leading-snug">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Escapes Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-5xl font-light text-foreground mb-2 tracking-wide">
              Popular destinations
            </h2>
            <p className="text-muted-foreground text-base">
              Inspiration to get you started.{" "}
              {userLocation ? "Sorted by distance from you." : "Tap any destination to plan your trip."}
            </p>
          </div>

          <div
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {CURATED_ESCAPES.map((escape) => (
              <div
                key={escape.id}
                onClick={() => handleEscapeClick(escape)}
                className="flex-shrink-0 w-68 cursor-pointer group snap-start"
                style={{ width: "272px" }}
                data-testid={`card-escape-${escape.id}`}
              >
                <div className="relative rounded-2xl overflow-hidden h-84" style={{ height: "336px" }}>
                  <img
                    src={escape.imageUrl}
                    alt={escape.destination}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Distance badge — replaces price */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {distanceLabel(escape.lat, escape.lng)}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-serif text-white text-2xl font-normal leading-tight">
                      {escape.destination}
                    </h3>
                    <p className="text-white/70 text-sm mt-1 leading-snug">
                      {escape.tagline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="5" cy="19" r="2.5" fill="hsl(var(--primary))" />
              <circle cx="19" cy="5" r="2.5" fill="hsl(var(--primary))" />
              <path
                d="M5 16.5C5 11 19 13 19 7.5"
                stroke="hsl(var(--primary))"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-serif text-lg font-light tracking-widest text-foreground">Wandr</span>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            Bespoke escapes, masterfully planned.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/brand">
              <span className="cursor-pointer hover:text-foreground transition-colors">Brand</span>
            </Link>
            <Link href="/faq">
              <span className="cursor-pointer hover:text-foreground transition-colors">FAQ</span>
            </Link>
            <Link href="/privacy">
              <span className="cursor-pointer hover:text-foreground transition-colors">Privacy</span>
            </Link>
            <Link href="/terms">
              <span className="cursor-pointer hover:text-foreground transition-colors">Terms</span>
            </Link>
            <Link href="/contact">
              <span className="cursor-pointer hover:text-foreground transition-colors">Contact</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-md border-t border-border">
        <Button
          size="lg"
          className="w-full gap-2 rounded-full"
          onClick={handleCurate}
          data-testid="button-start-planning-mobile"
        >
          Start Planning
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
