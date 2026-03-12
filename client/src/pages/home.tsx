import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Users, User, Sparkles, Compass, ArrowRight, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { CURATED_ESCAPES } from "@/lib/mock-data";

export default function Home() {
  const [, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [isGroup, setIsGroup] = useState(false);

  function handleCurate() {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    params.set("group", String(isGroup));
    navigate(`/intake?${params.toString()}`);
  }

  function handleEscapeClick(escape: typeof CURATED_ESCAPES[0]) {
    navigate(
      `/intake?destination=${encodeURIComponent(escape.destination)}&escape=${escape.id}&group=${isGroup}`
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=90)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/75" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <h1
            className="font-serif text-6xl md:text-8xl font-light text-white leading-[1.05] mb-2 tracking-wide"
            data-testid="text-hero-headline"
          >
            Quick Getaways,
            <br />
            <em className="font-normal">Masterfully Planned.</em>
          </h1>

          <div className="w-24 h-px bg-accent my-6 mx-auto" />

          <p className="text-white/75 text-base md:text-lg mb-8 max-w-md leading-relaxed tracking-wide">
            Curated 2–4 day Canadian escapes for individuals and groups.
          </p>

          {/* Solo / Group mode selector — sits above the search bar */}
          <div className="flex items-center gap-1 mb-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1">
            <button
              onClick={() => setIsGroup(false)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isGroup
                  ? "bg-white text-foreground shadow-sm"
                  : "text-white/75 hover:text-white"
              }`}
              data-testid="button-solo-toggle"
            >
              <User className="w-3.5 h-3.5" />
              Solo
            </button>
            <button
              onClick={() => setIsGroup(true)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isGroup
                  ? "bg-white text-foreground shadow-sm"
                  : "text-white/75 hover:text-white"
              }`}
              data-testid="button-group-toggle"
            >
              <Users className="w-3.5 h-3.5" />
              Group
            </button>
          </div>

          {/* Search bar — Curate is the clear primary CTA */}
          <div
            className="w-full max-w-xl bg-white rounded-full shadow-2xl flex items-center overflow-hidden p-1.5 gap-2"
            data-testid="search-bar"
          >
            <div className="flex items-center gap-2 flex-1 px-4">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Where in Canada? (Vancouver, Toronto…)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCurate()}
                className="flex-1 text-foreground placeholder:text-muted-foreground text-sm outline-none bg-transparent py-1"
                data-testid="input-destination"
              />
            </div>
            <Button
              onClick={handleCurate}
              className="rounded-full px-6 gap-2 flex-shrink-0"
              data-testid="button-curate-escape"
            >
              <Sparkles className="w-4 h-4" />
              Curate
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
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-serif text-5xl font-light text-foreground mb-3 tracking-wide">
            How it works
          </h2>
          <p className="text-muted-foreground text-base mb-16 max-w-xl mx-auto">
            From blank canvas to bespoke itinerary in under a minute.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Compass className="w-6 h-6" />,
                step: "01",
                title: "Tell us your style",
                desc: "Answer a few quick questions about your energy, budget, food preferences, and who's coming.",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                step: "02",
                title: "We curate your escape",
                desc: "Our AI crafts a day-by-day itinerary with morning, afternoon, and evening blocks — all personalised.",
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
                  <h3 className="font-serif text-2xl font-light mb-2 tracking-wide">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Curated Escapes Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="font-serif text-5xl font-light text-foreground mb-2 tracking-wide">
              Curated escapes
            </h2>
            <p className="text-muted-foreground text-base">
              Hand-picked Canadian itineraries. Just tap to start planning.
            </p>
          </div>

          <div
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
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

                  <div className="absolute top-3 right-3">
                    <span className="bg-white/95 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                      from ${escape.pricePerDay}/day
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-white text-2xl font-normal leading-tight">
                      {escape.destination}
                    </h3>
                    <p className="text-white/70 text-sm mt-0.5 leading-snug">
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

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-light tracking-widest text-foreground">Wandr</span>
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
