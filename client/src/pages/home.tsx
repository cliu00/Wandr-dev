import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Users, Sparkles, Search, Compass, Utensils, Mountain, ArrowRight, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { CURATED_ESCAPES } from "@/lib/mock-data";

const CATEGORIES = ["Culture", "Adventure", "Relaxation", "Dining", "History"];

export default function Home() {
  const [, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function handleCurate() {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (isGroup) params.set("group", "true");
    navigate(`/intake?${params.toString()}`);
  }

  function handleEscapeClick(escape: typeof CURATED_ESCAPES[0]) {
    navigate(`/intake?destination=${encodeURIComponent(escape.destination)}&escape=${escape.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <h1
            className="font-serif text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-2"
            data-testid="text-hero-headline"
          >
            Quick Getaways,
            <br />
            <span className="italic">Masterfully Planned.</span>
          </h1>

          <div className="w-32 h-0.5 bg-accent my-5 mx-auto" />

          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Specializing in curated 2–4 day escapes for individuals and groups.
          </p>

          {/* Search Bar */}
          <div
            className="w-full max-w-2xl bg-white rounded-full shadow-2xl flex items-center overflow-hidden p-1.5 gap-2"
            data-testid="search-bar"
          >
            <div className="flex items-center gap-2 flex-1 px-4">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Destination (e.g. Paris, Tokyo)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCurate()}
                className="flex-1 text-foreground placeholder:text-muted-foreground text-sm outline-none bg-transparent py-1"
                data-testid="input-destination"
              />
            </div>

            <button
              onClick={() => setIsGroup(!isGroup)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                isGroup
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border"
              }`}
              data-testid="button-group-toggle"
            >
              <Users className="w-3.5 h-3.5" />
              Group
            </button>

            <Button
              onClick={handleCurate}
              className="rounded-full px-6 gap-2 flex-shrink-0"
              data-testid="button-curate-escape"
            >
              <Sparkles className="w-4 h-4" />
              Curate Escape
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-1.5 rounded-full text-xs tracking-widest uppercase font-medium border transition-colors ${
                  activeCategory === cat
                    ? "bg-white text-foreground border-white"
                    : "bg-transparent text-white/80 border-white/30 hover:border-white/60"
                }`}
                data-testid={`button-category-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-10 bg-white/20" />
          <span className="text-xs tracking-widest uppercase">Explore</span>
        </div>
      </section>

      {/* Curated Escapes Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-2">
              Curated escapes
            </h2>
            <p className="text-muted-foreground text-lg">
              Hand-picked itineraries ready to go. Just tap and customize.
            </p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {CURATED_ESCAPES.map((escape) => (
              <div
                key={escape.id}
                onClick={() => handleEscapeClick(escape)}
                className="flex-shrink-0 w-64 cursor-pointer group snap-start"
                data-testid={`card-escape-${escape.id}`}
              >
                <div className="relative rounded-2xl overflow-hidden h-80">
                  <img
                    src={escape.imageUrl}
                    alt={escape.destination}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Price badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/95 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                      from ${escape.pricePerDay}/day
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-white text-2xl font-bold leading-tight">
                      {escape.destination}
                    </h3>
                    <p className="text-white/75 text-sm mt-0.5 leading-snug">
                      {escape.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {escape.startDate} – {escape.endDate}
                  </span>
                  <span>·</span>
                  <span>{escape.durationDays} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-xl mx-auto">
            From blank canvas to bespoke itinerary in under a minute.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Compass className="w-6 h-6" />,
                step: "01",
                title: "Tell us your style",
                desc: "Answer 8 quick questions about your energy, budget, food preferences, and who's coming.",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                step: "02",
                title: "We curate your escape",
                desc: "Our AI crafts a day-by-day itinerary with morning, afternoon, and evening blocks — all personalized.",
              },
              {
                icon: <Star className="w-6 h-6" />,
                step: "03",
                title: "Adjust until perfect",
                desc: "Swap any activity with one tap. Every recommendation explains exactly why it was chosen for you.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-accent font-semibold tracking-widest mb-1">{item.step}</div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="mt-14 gap-2 rounded-full px-8"
            onClick={handleCurate}
            data-testid="button-start-planning"
          >
            Start Planning
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold tracking-widest text-foreground">48HRS</span>
          <p className="text-muted-foreground text-sm text-center">
            Bespoke escapes, masterfully planned.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
