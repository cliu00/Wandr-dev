import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { FlowHeader } from "@/components/flow-header";
import {
  ArrowLeft, Check, MapPin, ChevronRight, UserCheck,
  Calendar, Users, Sparkles, Zap, DollarSign, Compass, UtensilsCrossed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Star, Utensils, Timer } from "lucide-react";

type JoinStep = "welcome" | "identity" | "energy" | "budget" | "activities" | "food";

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

const MOCK_ORGANISER = "Jordan";

// Forest green fallback for when the hero image fails to load
const HERO_FALLBACK = "hsl(155, 35%, 18%)";

export default function SurveyJoin() {
  const [, navigate] = useLocation();
  const search = useSearch();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const prefilledName = params.get("name") || "";
  const hasPersonalLink = prefilledName.length > 0;

  const STEPS: JoinStep[] = hasPersonalLink
    ? ["welcome", "energy", "budget", "activities", "food"]
    : ["identity", "energy", "budget", "activities", "food"];

  const [step, setStep] = useState<JoinStep>(STEPS[0]);
  const [selfName, setSelfName] = useState("");
  const [email, setEmail] = useState("");
  const [energy, setEnergy] = useState(50);
  const [budget, setBudget] = useState<string | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [food, setFood] = useState<string | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const name = hasPersonalLink ? prefilledName : selfName;

  const PROGRESS_STEPS: JoinStep[] = ["energy", "budget", "activities", "food"];
  const progressIndex = PROGRESS_STEPS.indexOf(step as any);
  const progress = progressIndex < 0 ? 0 : ((progressIndex + 1) / PROGRESS_STEPS.length) * 100;

  const isLastStep = step === "food";

  function goNext() {
    if (isLastStep) {
      navigate("/generating");
      return;
    }
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function skipStep() {
    if (isLastStep) {
      navigate("/generating");
      return;
    }
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx === 0) {
      navigate("/");
      return;
    }
    setStep(STEPS[idx - 1]);
  }

  function canContinue() {
    if (step === "identity") return selfName.trim().length > 0;
    if (step === "budget") return budget !== null;
    if (step === "activities") return activities.length > 0;
    if (step === "food") return food !== null;
    return true;
  }

  // Skippable steps — energy is always skippable; others skip if nothing selected
  const isSkippable = step === "energy" || step === "budget" || step === "activities" || step === "food";

  // ── Welcome screen ─────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Hero background with solid fallback */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: HERO_FALLBACK }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1559511260-4f2f4a89b638?w=1920&q=80)`,
            opacity: heroLoaded ? 1 : 0,
          }}
        />
        {/* Preload trigger */}
        <img
          src="https://images.unsplash.com/photo-1559511260-4f2f4a89b638?w=1920&q=80"
          className="hidden"
          onLoad={() => setHeroLoaded(true)}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />

        {/* Header */}
        <div className="relative z-10 flex-shrink-0">
          <FlowHeader onBack={() => navigate("/")} variant="transparent" />
        </div>

        {/* Content — pinned to bottom */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-8 max-w-xl mx-auto w-full">

          {/* Invite badge */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium border border-white/20">
              <UserCheck className="w-3.5 h-3.5" />
              Personal invite from {MOCK_ORGANISER}
            </div>
          </div>

          {/* Greeting */}
          <h1 className="font-serif text-4xl font-light text-white mb-2 leading-tight">
            Hey {prefilledName},
          </h1>
          <p className="text-white/80 text-lg mb-6 leading-relaxed">
            {MOCK_ORGANISER} is planning a group trip to Vancouver and wants to make sure it works for everyone.
          </p>

          {/* Trip details */}
          <div className="bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-5 border border-white/20">
            <div className="grid grid-cols-3 divide-x divide-white/15">
              <div className="flex flex-col gap-1 pr-4">
                <div className="flex items-center gap-1.5 text-white/55 text-xs mb-0.5">
                  <MapPin className="w-3 h-3" /> Destination
                </div>
                <div className="text-white text-sm font-semibold">Vancouver</div>
              </div>
              <div className="flex flex-col gap-1 px-4">
                <div className="flex items-center gap-1.5 text-white/55 text-xs mb-0.5">
                  <Calendar className="w-3 h-3" /> Dates
                </div>
                <div className="text-white text-sm font-semibold">Apr 18–20</div>
              </div>
              <div className="flex flex-col gap-1 pl-4">
                <div className="flex items-center gap-1.5 text-white/55 text-xs mb-0.5">
                  <Users className="w-3 h-3" /> Group
                </div>
                <div className="text-white text-sm font-semibold">3 people · 2 nights</div>
              </div>
            </div>
          </div>

          {/* How it works — aligned to the actual 4 quiz steps */}
          <div className="mb-7">
            <p className="text-white/45 text-xs uppercase tracking-widest font-semibold mb-3">
              What you'll be asked
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Your energy level", sub: "Chill or full throttle?" },
                { icon: <DollarSign className="w-3.5 h-3.5" />, label: "Daily budget", sub: "Your comfort range" },
                { icon: <Compass className="w-3.5 h-3.5" />, label: "Activities", sub: "What excites you most" },
                { icon: <UtensilsCrossed className="w-3.5 h-3.5" />, label: "Dining style", sub: "Fine dining or local gems?" },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-start gap-2.5 bg-white/8 rounded-xl p-3 border border-white/10">
                  <span className="text-white/60 flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <div className="text-white text-xs font-semibold leading-tight">{label}</div>
                    <div className="text-white/50 text-xs leading-tight mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/45 text-xs mt-3 leading-relaxed">
              Wandr blends everyone's answers and builds one itinerary that works for the whole group.
              You can skip any question you're not sure about.
            </p>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full rounded-full bg-white text-foreground hover:bg-white/90 gap-2 font-semibold"
            onClick={goNext}
            data-testid="button-accept-invite"
          >
            Add my preferences
            <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-center text-white/35 text-xs mt-3">
            Takes under 2 minutes · Skip any question you'd like
          </p>
        </div>
      </div>
    );
  }

  // ── Main quiz ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar + header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <FlowHeader
          onBack={goBack}
          rightContent={
            hasPersonalLink ? (
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <UserCheck className="w-3.5 h-3.5" />
                {prefilledName}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{MOCK_ORGANISER}'s trip</span>
              </div>
            )
          }
        />
      </div>

      <div className="flex-1 flex flex-col pb-32 pt-20">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >

              {/* ── Identity (generic link only) ── */}
              {step === "identity" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">You've been invited!</h2>
                  <p className="text-muted-foreground mb-8">
                    Tell us your name so the organiser knows you've responded.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Your name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={selfName}
                        onChange={(e) => setSelfName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="rounded-xl h-12"
                        data-testid="input-name"
                        onKeyDown={(e) => e.key === "Enter" && canContinue() && goNext()}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                        Email (optional)
                      </label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="we'll notify you when the plan is ready"
                        type="email"
                        className="rounded-xl h-12"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Energy ── */}
              {step === "energy" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">
                    {name ? `What's your energy for this trip, ${name}?` : "What's your energy for this trip?"}
                  </h2>
                  <p className="text-muted-foreground mb-12">From full chill to full throttle.</p>
                  <div className="px-2">
                    <Slider
                      value={[energy]}
                      onValueChange={([v]) => setEnergy(v)}
                      min={0}
                      max={100}
                      step={1}
                      className="mb-6"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>I need to decompress</span>
                      <span>Balanced</span>
                      <span>Pack it all in</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Budget ── */}
              {step === "budget" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">What's your daily budget?</h2>
                  <p className="text-muted-foreground mb-8">
                    Share yours — Wandr will find the right balance once everyone weighs in.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "under-100", label: "Under $100", sub: "Budget-friendly" },
                      { value: "100-200", label: "$100–200", sub: "Comfortable" },
                      { value: "200-350", label: "$200–350", sub: "Treat yourself" },
                      { value: "350-plus", label: "$350+", sub: "Luxury" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBudget(opt.value)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                          budget === opt.value
                            ? "border-primary bg-primary/8"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                        data-testid={`button-budget-${opt.value}`}
                      >
                        <div className="font-semibold text-lg">{opt.label}</div>
                        <div className="text-sm text-muted-foreground">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Activities ── */}
              {step === "activities" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">What excites you most?</h2>
                  <p className="text-muted-foreground mb-8">Pick all that apply.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Hidden gems",
                      "Iconic landmarks",
                      "Street art & murals",
                      "Markets & shopping",
                      "Nature & parks",
                      "Nightlife",
                      "Wellness & spas",
                      "Architecture",
                    ].map((opt) => {
                      const active = activities.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            setActivities((a) =>
                              active ? a.filter((x) => x !== opt) : [...a, opt]
                            )
                          }
                          className={`p-4 rounded-2xl border-2 text-sm font-medium text-center transition-all ${
                            active
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                          data-testid={`button-activity-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Food ── */}
              {step === "food" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">What's your dining style?</h2>
                  <p className="text-muted-foreground mb-8">
                    Helps us calibrate the group's restaurant picks.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        value: "fine-dining",
                        icon: <Utensils className="w-5 h-5" />,
                        label: "Fine dining & reservations",
                        sub: "The best tables in the city — booked in advance",
                      },
                      {
                        value: "great-meals",
                        icon: <Star className="w-5 h-5" />,
                        label: "Great restaurants, no fuss",
                        sub: "Quality food without the tasting-menu commitment",
                      },
                      {
                        value: "local-casual",
                        icon: <MapPin className="w-5 h-5" />,
                        label: "Local gems & casual spots",
                        sub: "Neighbourhood favourites, cafés, and hidden finds",
                      },
                      {
                        value: "just-fed",
                        icon: <Timer className="w-5 h-5" />,
                        label: "Quick bites, keep moving",
                        sub: "Fuel up fast — dining isn't the focus",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFood(opt.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          food === opt.value
                            ? "border-primary bg-primary/8"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                        data-testid={`button-food-${opt.value}`}
                      >
                        <span className={food === opt.value ? "text-primary" : "text-muted-foreground"}>
                          {opt.icon}
                        </span>
                        <div>
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-sm text-muted-foreground">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky footer — Back / Skip / Continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/60 px-4 pt-4 pb-5">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={goBack}
            className="rounded-full px-5 gap-1.5 flex-shrink-0"
            data-testid="button-back-footer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-full"
            disabled={!canContinue()}
            onClick={goNext}
            data-testid="button-continue"
          >
            {isLastStep ? "Submit & generate itinerary →" : "Continue"}
          </Button>
        </div>
        {/* Skip link — shown on all preference steps */}
        {isSkippable && (
          <div className="max-w-2xl mx-auto mt-2.5 text-center">
            <button
              onClick={skipStep}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-skip"
            >
              {isLastStep ? "Skip & generate without this →" : "Skip this question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
