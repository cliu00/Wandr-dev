import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { FlowHeader } from "@/components/flow-header";
import {
  ArrowLeft, MapPin, ChevronRight, UserCheck,
  Users, Zap, DollarSign, Compass, UtensilsCrossed, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Star, Utensils } from "lucide-react";

type JoinStep = "identity" | "groupDynamic" | "energy" | "budget" | "activities" | "food" | "done";

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

const STEPS: JoinStep[] = ["identity", "groupDynamic", "energy", "budget", "activities", "food"];
const PROGRESS_STEPS: JoinStep[] = ["groupDynamic", "energy", "budget", "activities", "food"];

interface TripContext {
  destination: string;
  durationDays: number;
  groupType: string;
}

export default function SurveyJoin() {
  const [, navigate] = useLocation();
  const search = useSearch();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const tripId = params.get("tripId") || "";
  const invitedBy = params.get("from") || "";

  const [tripContext, setTripContext] = useState<TripContext | null>(null);
  const [contextError, setContextError] = useState(false);

  useEffect(() => {
    if (!tripId) { setContextError(true); return; }
    fetch(`/api/trips/${tripId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setTripContext({
          destination: data.trip?.destination ?? "",
          durationDays: data.trip?.durationDays ?? 2,
          groupType: data.trip?.groupType ?? "group",
        });
      })
      .catch(() => setContextError(true));
  }, [tripId]);

  const destination = tripContext?.destination || "";
  const durationDays = tripContext?.durationDays ?? 2;

  const [step, setStep] = useState<JoinStep>("identity");
  const [selfName, setSelfName] = useState("");
  const [groupDynamic, setGroupDynamic] = useState<string | null>(null);
  const [energy, setEnergy] = useState(50);
  const [budget, setBudget] = useState<string | null>(null);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [activityNotes, setActivityNotes] = useState("");
  const [food, setFood] = useState<string[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progressIndex = PROGRESS_STEPS.indexOf(step as any);
  const progress = progressIndex < 0 ? 0 : ((progressIndex + 1) / PROGRESS_STEPS.length) * 100;

  const isLastStep = step === "food";

  async function submitPreferences() {
    setSubmitting(true);
    try {
      await fetch(`/api/survey/${tripId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selfName,
          organizerName: invitedBy || undefined,
          groupDynamic,
          energy,
          budget,
          activityTypes,
          food,
          activityNotes,
          dietaryNotes,
        }),
      });
      // Store preferences so the generating page can show Phase 1.5 chips
      sessionStorage.setItem("wandr_pending_preferences", JSON.stringify({
        destination,
        durationDays,
        groupType: tripContext?.groupType ?? "group",
        activityTypes,
        food,
        budget,
      }));
      sessionStorage.setItem("wandr_group_pending_trip_id", tripId);
      navigate(`/generating?mode=join`);
    } catch {
      // Fall back to done screen if navigation fails
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (isLastStep) { submitPreferences(); return; }
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx === 0) { navigate(`/itinerary/${tripId}`); return; }
    setStep(STEPS[idx - 1]);
  }

  function canContinue() {
    if (step === "identity") return selfName.trim().length > 0;
    if (step === "groupDynamic") return groupDynamic !== null;
    if (step === "budget") return budget !== null;
    if (step === "activities") return activityTypes.length > 0;
    if (step === "food") return food.length > 0;
    return true;
  }

  const isSkippable = step === "groupDynamic" || step === "energy" || step === "budget" || step === "activities" || step === "food";

  // ── Error state ─────────────────────────────────────────────────────────
  if (contextError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-2xl font-light text-foreground mb-2">Trip not found</h1>
        <p className="text-muted-foreground text-sm mb-6">This link may be invalid or the trip no longer exists.</p>
        <Button onClick={() => navigate("/")} className="rounded-full">Go to Wandr</Button>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (!tripContext) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Done state ───────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-2">
          <UserCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-light text-foreground">You're in, {selfName}!</h1>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          Your preferences have been added. The itinerary is being updated — check back shortly.
        </p>
        <Button
          onClick={() => navigate(`/itinerary/${tripId}`)}
          className="rounded-full mt-2 gap-2"
          data-testid="button-view-itinerary"
        >
          View updated itinerary
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ── Main quiz ─────────────────────────────────────────────────────────────
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
            destination ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{destination}</span>
              </div>
            ) : undefined
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

              {/* ── Identity ── */}
              {step === "identity" && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    {invitedBy ? `${invitedBy} invited you` : "You've been invited"}
                  </p>
                  <h2 className="font-serif text-5xl font-light text-foreground leading-none mb-2">
                    {destination || "Join the trip"}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
                    Answer a few quick questions and Wandr will blend your preferences into the itinerary. Takes under 2 minutes.
                  </p>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      What's your name?
                    </label>
                    <Input
                      value={selfName}
                      onChange={(e) => setSelfName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="rounded-xl h-12"
                      data-testid="input-name"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && canContinue() && goNext()}
                    />
                  </div>
                </div>
              )}

              {/* ── Group Dynamic ── */}
              {step === "groupDynamic" && (
                <div>
                  <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
                    How does your group like to travel?
                  </h2>
                  <p className="text-muted-foreground mb-8 text-sm">
                    Wandr will structure the itinerary around your group's natural rhythm.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        value: "together",
                        icon: <Users className="w-5 h-5" />,
                        label: "Together the whole time",
                        sub: "We move as a pack. One plan, one experience, everyone in.",
                      },
                      {
                        value: "loose",
                        icon: <Compass className="w-5 h-5" />,
                        label: "Loosely together",
                        sub: "Same city, different interests. We meet for meals and highlights.",
                      },
                      {
                        value: "mix",
                        icon: <Zap className="w-5 h-5" />,
                        label: "A mix of both",
                        sub: "Group moments for the big things, personal time in between.",
                      },
                    ].map((opt) => {
                      const active = groupDynamic === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setGroupDynamic(opt.value)}
                          className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                            active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                          }`}
                          data-testid={`button-group-dynamic-${opt.value}`}
                        >
                          <span className={`flex-shrink-0 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                            {opt.icon}
                          </span>
                          <div>
                            <div className={`font-semibold text-base mb-0.5 ${active ? "text-primary" : "text-foreground"}`}>
                              {opt.label}
                            </div>
                            <div className="text-sm text-muted-foreground leading-snug">{opt.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Energy ── */}
              {step === "energy" && (
                <div>
                  <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
                    {selfName ? `What's your energy, ${selfName}?` : "What's your energy for this trip?"}
                  </h2>
                  <p className="text-muted-foreground mb-12 text-sm">Share yours — Wandr blends everyone's input.</p>
                  <div className="px-2">
                    <Slider
                      value={[energy]}
                      onValueChange={([v]) => setEnergy(v)}
                      min={0}
                      max={100}
                      step={1}
                      className="mb-6"
                      data-testid="slider-energy"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Relaxed pace</span>
                      <span>Some of both</span>
                      <span>Action-packed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Budget ── */}
              {step === "budget" && (
                <div>
                  <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">What's your spend style?</h2>
                  <p className="text-muted-foreground mb-8 text-sm">
                    Wandr finds the sweet spot once everyone weighs in.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "under-100", label: "Budget-friendly", range: "~$50–100/person/day" },
                      { value: "100-200",   label: "Comfortable",     range: "~$100–200/person/day" },
                      { value: "200-350",   label: "Treat yourself",  range: "~$200–350/person/day" },
                      { value: "350-plus",  label: "Luxury",           range: "$350+/person/day" },
                    ].map((opt) => {
                      const active = budget === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setBudget(opt.value)}
                          className={`p-5 rounded-2xl border-2 text-left transition-all ${
                            active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                          }`}
                          data-testid={`button-budget-${opt.value}`}
                        >
                          <div className={`font-semibold text-lg leading-tight ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</div>
                          <div className={`text-xs mt-1 ${active ? "text-primary/60" : "text-muted-foreground"}`}>{opt.range}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Activities ── */}
              {step === "activities" && (
                <div>
                  <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">What do you enjoy most?</h2>
                  <p className="text-muted-foreground mb-8 text-sm">Pick what excites you — Wandr blends everyone's picks.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "hidden-gems",       label: "Hidden Gems",        sub: "Off-the-beaten-path spots locals love" },
                      { value: "iconic-landmarks",  label: "Iconic Landmarks",   sub: "The must-sees, done right" },
                      { value: "food-drink",        label: "Food & Drink",       sub: "Food tours • markets • local specialties" },
                      { value: "history-museums",   label: "History & Museums",  sub: "Museums • historic sites • architecture" },
                      { value: "nature-parks",      label: "Nature & Parks",     sub: "Parks • viewpoints • scenic walks" },
                      { value: "markets-shopping",  label: "Markets & Shopping", sub: "Local markets • boutiques • vintage finds" },
                      { value: "nightlife",         label: "Nightlife",          sub: "Bars • live music • late-night spots" },
                      { value: "art-culture",       label: "Art & Culture",      sub: "Galleries • street art • performances" },
                    ].map((opt) => {
                      const active = activityTypes.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            setActivityTypes((a) =>
                              active ? a.filter((x) => x !== opt.value) : [...a, opt.value]
                            )
                          }
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                          }`}
                          data-testid={`button-activity-${opt.value}`}
                        >
                          <div className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5">
                    <label className="block text-xs text-muted-foreground mb-2 tracking-wide">
                      Anything specific you'd like to plan around?
                    </label>
                    <textarea
                      placeholder="e.g. A group boat tour, escape room, something active together…"
                      value={activityNotes}
                      onChange={(e) => setActivityNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                      data-testid="input-activity-notes"
                    />
                  </div>
                </div>
              )}

              {/* ── Food ── */}
              {step === "food" && (
                <div>
                  <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">How do you like to eat?</h2>
                  <p className="text-muted-foreground mb-8 text-sm">
                    Share yours — Wandr blends it with your wandrers' picks.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        value: "street-food",
                        icon: <MapPin className="w-5 h-5" />,
                        label: "Street food & markets",
                        sub: "Stalls, vendors, food halls — the hunt is half the fun.",
                      },
                      {
                        value: "neighbourhood",
                        icon: <Utensils className="w-5 h-5" />,
                        label: "Neighbourhood gems",
                        sub: "Mom-and-pop spots, family-run kitchens — beloved by locals.",
                      },
                      {
                        value: "sit-down",
                        icon: <Star className="w-5 h-5" />,
                        label: "Proper sit-downs",
                        sub: "Full menus, good wine, no rush — conversation over courses.",
                      },
                      {
                        value: "special-evening",
                        icon: <Sparkles className="w-5 h-5" />,
                        label: "One standout meal",
                        sub: "A memorable table as a trip highlight.",
                      },
                    ].map((opt) => {
                      const active = food.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setFood((f) => active ? f.filter((x) => x !== opt.value) : [...f, opt.value])}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                            active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                          }`}
                          data-testid={`button-food-${opt.value}`}
                        >
                          <span className={`flex-shrink-0 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                            {opt.icon}
                          </span>
                          <div>
                            <div className={`font-semibold text-sm mb-0.5 ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</div>
                            <div className="text-xs text-muted-foreground leading-snug">{opt.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5">
                    <label className="block text-xs text-muted-foreground mb-2 tracking-wide">
                      Any dietary needs or restrictions?
                    </label>
                    <textarea
                      placeholder="e.g. Vegetarian, nut allergy, gluten-free, halal…"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                      data-testid="input-dietary-notes"
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky footer */}
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
          {isSkippable && !canContinue() ? (
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 rounded-full text-muted-foreground"
              onClick={goNext}
              data-testid="button-skip"
            >
              Skip
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1 rounded-full"
              disabled={!canContinue() || submitting}
              onClick={goNext}
              data-testid="button-continue"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving…</>
              ) : isLastStep ? (
                "Submit preferences"
              ) : (
                <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
