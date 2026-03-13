import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, MapPin, ChevronRight, UserCheck, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Star, Utensils, Timer } from "lucide-react";

type JoinStep = "welcome" | "identity" | "energy" | "budget" | "activities" | "food" | "done";

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

// Mock organiser name — in production this would come from the token lookup
const MOCK_ORGANISER = "Jordan";

export default function SurveyJoin() {
  const [, navigate] = useLocation();
  const search = useSearch();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const prefilledName = params.get("name") || "";
  const hasPersonalLink = prefilledName.length > 0;

  // Personal link flow: welcome → preference steps (no identity)
  // Generic link flow: identity → preference steps
  const STEPS: JoinStep[] = hasPersonalLink
    ? ["welcome", "energy", "budget", "activities", "food", "done"]
    : ["identity", "energy", "budget", "activities", "food", "done"];

  const [step, setStep] = useState<JoinStep>(STEPS[0]);
  const [selfName, setSelfName] = useState("");
  const [email, setEmail] = useState("");
  const [energy, setEnergy] = useState(50);
  const [budget, setBudget] = useState<string | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [food, setFood] = useState<string | null>(null);

  const name = hasPersonalLink ? prefilledName : selfName;

  // Progress counts only the preference steps, not welcome or done
  const PROGRESS_STEPS: JoinStep[] = ["energy", "budget", "activities", "food"];
  const progressIndex = PROGRESS_STEPS.indexOf(step as any);
  const progress = progressIndex < 0 ? 0 : ((progressIndex + 1) / PROGRESS_STEPS.length) * 100;

  function goNext() {
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

  // ── Welcome screen (personal link only) ───────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Hero background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1559511260-4f2f4a89b638?w=1920&q=90)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />

        {/* Back */}
        <div className="relative z-10 px-5 pt-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            data-testid="button-back-welcome"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-8 max-w-xl mx-auto w-full">

          {/* Invite badge */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              Personal invite from {MOCK_ORGANISER}
            </div>
          </div>

          {/* Greeting */}
          <h1 className="font-serif text-4xl font-light text-white mb-2 leading-tight">
            Hey {prefilledName},
          </h1>
          <p className="text-white/80 text-lg mb-6 leading-relaxed">
            {MOCK_ORGANISER} is planning a trip to Vancouver and wants to make sure it works for you too.
          </p>

          {/* Trip details card */}
          <div className="bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-5 border border-white/20">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <MapPin className="w-3 h-3" />
                  Destination
                </div>
                <div className="text-white text-sm font-semibold">Vancouver</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Calendar className="w-3 h-3" />
                  Dates
                </div>
                <div className="text-white text-sm font-semibold">Apr 18–20</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Users className="w-3 h-3" />
                  Group
                </div>
                <div className="text-white text-sm font-semibold">3 people</div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-7">
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-3">How group planning works</p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: <Check className="w-3.5 h-3.5" />, text: "Answer 4 quick questions about your travel style — takes under 2 minutes." },
                { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Wandr blends everyone's input and builds one itinerary that works for the whole group." },
                { icon: <MapPin className="w-3.5 h-3.5" />, text: "You'll get notified when the final plan is ready — no group chat debates needed." },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white/80 flex-shrink-0 mt-0.5">
                    {icon}
                  </span>
                  <p className="text-white/75 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full rounded-full bg-white text-foreground hover:bg-white/90 gap-2 text-base font-semibold"
            onClick={goNext}
            data-testid="button-accept-invite"
          >
            Accept & add my preferences
            <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-center text-white/45 text-xs mt-3">
            Your answers are only used to shape this trip — not stored or shared.
          </p>
        </div>
      </div>
    );
  }

  // ── Done screen ────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1559511260-4f2f4a89b638?w=1920&q=90)`,
            zIndex: -1,
          }}
        />
        <div className="absolute inset-0 bg-black/65" style={{ zIndex: -1 }} />

        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-3">
            Thanks, {name}!
          </h1>
          <p className="text-white/75 text-lg mb-8 leading-relaxed">
            Your preferences have been added to the Vancouver group plan.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left mb-6">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>Vancouver · Apr 18–20</span>
            </div>
            <p className="text-white text-sm">
              {MOCK_ORGANISER} will generate the final itinerary once everyone responds. We'll
              notify you when it's ready.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="rounded-full gap-2 bg-white text-foreground hover:bg-white/90"
              onClick={() => navigate("/survey/status")}
              data-testid="button-view-status"
            >
              <Users className="w-4 h-4" />
              View group status
            </Button>
            <Button
              variant="ghost"
              className="rounded-full border-white/30 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/")}
              data-testid="button-back-home"
            >
              Back to Wandr
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main survey ────────────────────────────────────────────────────────
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
        <div className="flex items-center justify-between px-5 py-3 bg-background border-b border-border/60">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Vancouver · {MOCK_ORGANISER}'s Group Trip</span>
          </div>
          {/* Identity badge — name locked in via personal link */}
          {hasPersonalLink ? (
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              {prefilledName}
            </div>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col pb-28 pt-20`}>
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
              {/* ── Identity step (generic link only) ── */}
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
                  <h2 className="font-serif text-3xl font-bold mb-2">Your daily budget per person?</h2>
                  <p className="text-muted-foreground mb-8">
                    We'll find the sweet spot for the whole group.
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

      {/* Sticky CTA */}
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
            {step === "food" ? "Submit my preferences →" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
