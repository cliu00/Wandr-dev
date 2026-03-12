import { useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X, Users, Heart, PartyPopper, Utensils, Timer, CalendarDays, ChevronDown, MapPin, Wine, Coffee, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";

interface IntakeState {
  destination: string;
  duration: number | null;
  startDate: Date | undefined;
  groupType: "solo" | "partner" | "small" | "big" | null;
  energy: number;
  budget: string[];
  activityTypes: string[];
  food: string[];
  activityNotes: string;
  dietaryNotes: string;
  anchorActivity: string;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

export default function Intake() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const prefillDestination = searchParams.get("destination") || "";
  const tripTypeParam = searchParams.get("tripType") || "solo";

  const tripTypeMap: Record<string, IntakeState["groupType"]> = {
    solo: "solo",
    duo: "partner",
    group: "small",
    family: "big",
  };
  const initialGroupType = tripTypeMap[tripTypeParam] ?? "solo";

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<IntakeState>({
    destination: prefillDestination,
    duration: null,
    startDate: undefined,
    groupType: initialGroupType,
    energy: 50,
    budget: [],
    activityTypes: [],
    food: [],
    activityNotes: "",
    dietaryNotes: "",
    anchorActivity: "",
  });

  const STEPS = ["durationDate", "energy", "budget", "activities", "anchor", "food"];

  const totalSteps = STEPS.length;
  const currentStepKey = STEPS[step - 1];
  const [skipConfirm, setSkipConfirm] = useState(false);

  function goNext() {
    setDirection(1);
    setSkipConfirm(false);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 1) {
      navigate("/");
      return;
    }
    setSkipConfirm(false);
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function actuallySkip() {
    setSkipConfirm(false);
    if (isLastStep) {
      handleSubmit();
    } else {
      goNext();
    }
  }

  function handleSubmit() {
    const isGroup = state.groupType !== "solo" && state.groupType !== null;
    if (isGroup) {
      navigate("/survey/invite");
    } else {
      navigate("/generating");
    }
  }

  const isLastStep = step === totalSteps;

  function canContinue(): boolean {
    switch (currentStepKey) {
      case "durationDate": return state.duration !== null;
      case "groupSize": return state.groupType !== null;
      case "energy":
      case "budget":
      case "activities":
      case "anchor":
      case "food":
        return true;
      default: return false;
    }
  }

  const isSkippable = currentStepKey !== "durationDate";

  const endDate =
    state.startDate && state.duration
      ? addDays(state.startDate, state.duration - 1)
      : null;

  const progress = (step / totalSteps) * 100;
  const isGroupTrip = state.groupType !== null && state.groupType !== "solo";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3 bg-background border-b border-border/60">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title={step === 1 ? "Exit quiz" : "Previous question"}
            data-testid="button-back"
          >
            {step === 1 ? <X className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          {prefillDestination && (
            <span className="text-xs text-muted-foreground tracking-wide">
              Planning your {prefillDestination} escape
            </span>
          )}
          <div className="text-right" data-testid="text-step-counter">
            <div className="text-sm text-muted-foreground font-medium">{step}/{totalSteps}</div>
            {isSkippable && (
              <div className="text-[10px] text-muted-foreground/40 leading-tight mt-0.5 tracking-wide">
                Details improve results
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col pt-20 pb-32">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {currentStepKey === "durationDate" && (
                <StepDurationDate state={state} setState={setState} endDate={endDate} />
              )}
              {currentStepKey === "groupSize" && (
                <StepGroupSize state={state} setState={setState} />
              )}
              {currentStepKey === "energy" && (
                <StepEnergy state={state} setState={setState} />
              )}
              {currentStepKey === "budget" && (
                <StepBudget state={state} setState={setState} />
              )}
              {currentStepKey === "activities" && (
                <StepActivities state={state} setState={setState} />
              )}
              {currentStepKey === "anchor" && (
                <StepAnchor state={state} setState={setState} />
              )}
              {currentStepKey === "food" && (
                <StepFood state={state} setState={setState} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/60 px-4 pt-4 pb-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <Button
            size="lg"
            className="w-full rounded-full text-base font-medium"
            disabled={!canContinue()}
            onClick={isLastStep ? handleSubmit : goNext}
            data-testid="button-continue"
          >
            {isLastStep
              ? isGroupTrip
                ? "Invite My Crew →"
                : "Curate My Escape →"
              : "Continue"}
          </Button>

          {isSkippable && (
            <div className="min-h-[3rem] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {skipConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <p className="text-xs text-muted-foreground">
                      More detail = a more personalised itinerary.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => setSkipConfirm(false)}
                        className="font-medium text-foreground hover:opacity-70 transition-opacity"
                        data-testid="button-answer"
                      >
                        I'll answer
                      </button>
                      <span className="text-border select-none">|</span>
                      <button
                        onClick={actuallySkip}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="button-skip-confirm"
                      >
                        Skip anyway
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="skip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSkipConfirm(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    data-testid="button-skip"
                  >
                    Skip this question
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepDurationDate({
  state,
  setState,
  endDate,
}: {
  state: IntakeState;
  setState: any;
  endDate: Date | null;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = new Date();

  const options = [
    { value: 1, label: "1 day", sub: "A focused day out" },
    { value: 2, label: "2 days", sub: "A sharp weekend away" },
    { value: 3, label: "3 days", sub: "The sweet spot" },
    { value: 4, label: "4 days", sub: "Room to breathe" },
  ];

  return (
    <div>
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-primary/6 border border-primary/12 mb-7">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-primary/75 leading-snug">
          The more you share, the more personalised your itinerary will be. Every question after this one is optional.
        </p>
      </div>

      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        How long is your escape?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        We'll pace your itinerary accordingly.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, duration: opt.value }))}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              state.duration === opt.value
                ? "border-primary bg-primary/8"
                : "border-border bg-card hover:border-primary/40"
            }`}
            data-testid={`button-duration-${opt.value}`}
          >
            <div
              className={`font-semibold text-lg ${
                state.duration === opt.value ? "text-primary" : "text-foreground"
              }`}
            >
              {opt.label}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{opt.sub}</div>
          </button>
        ))}
      </div>

      {/* Optional date expander */}
      <button
        onClick={() => setShowDatePicker((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all ${
          showDatePicker || state.startDate
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30"
        }`}
        data-testid="button-toggle-dates"
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {state.startDate
            ? endDate
              ? `${format(state.startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`
              : format(state.startDate, "MMMM d, yyyy")
            : "Add travel dates (optional)"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showDatePicker ? "rotate-180" : ""}`}
        />
      </button>

      {showDatePicker && (
        <div className="mt-1 border border-border rounded-2xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Dates help us suggest seasonal events, weather-appropriate activities, and local happenings.
            </p>
          </div>
          <div className="flex justify-center p-2">
            <style>{`
              .rdp-day_selected {
                background-color: hsl(155 35% 22%) !important;
                color: white !important;
              }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                background-color: hsl(155 35% 22% / 0.08) !important;
              }
              .rdp { --rdp-accent-color: hsl(155 35% 22%); }
              .rdp-caption_label {
                font-family: var(--font-serif);
                font-weight: 400;
                font-size: 1rem;
                letter-spacing: 0.04em;
              }
            `}</style>
            <DayPicker
              mode="single"
              selected={state.startDate}
              onSelect={(date) =>
                setState((s: IntakeState) => ({ ...s, startDate: date || undefined }))
              }
              fromDate={today}
              numberOfMonths={1}
            />
          </div>
          {state.startDate && (
            <div className="px-4 pb-3 flex items-center justify-between">
              <p className="text-sm text-primary font-medium">
                {endDate
                  ? `${format(state.startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`
                  : `Departing ${format(state.startDate, "MMMM d, yyyy")}`}
              </p>
              <button
                onClick={() => setState((s: IntakeState) => ({ ...s, startDate: undefined }))}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepGroupSize({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    { value: "partner", icon: <Heart className="w-5 h-5" />, label: "Two of us", sub: "Me + partner" },
    { value: "small", icon: <Users className="w-5 h-5" />, label: "Small group (3–4)", sub: "Friends or family" },
    { value: "big", icon: <PartyPopper className="w-5 h-5" />, label: "Big group (5+)", sub: "The whole crew" },
  ];

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        How big is your group?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        We'll tailor recommendations to your group size.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              setState((s: IntakeState) => ({ ...s, groupType: opt.value as any }))
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              state.groupType === opt.value
                ? "border-primary bg-primary/8"
                : "border-border bg-card hover:border-primary/40"
            }`}
            data-testid={`button-group-${opt.value}`}
          >
            <span className={state.groupType === opt.value ? "text-primary" : "text-muted-foreground"}>
              {opt.icon}
            </span>
            <div>
              <div className="font-semibold text-foreground">{opt.label}</div>
              <div className="text-sm text-muted-foreground">{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepEnergy({ state, setState }: { state: IntakeState; setState: any }) {
  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        What's your energy this trip?
      </h2>
      <p className="text-muted-foreground mb-12 text-sm">From full chill to full throttle.</p>
      <div className="px-2">
        <Slider
          value={[state.energy]}
          onValueChange={([v]) => setState((s: IntakeState) => ({ ...s, energy: v }))}
          min={0}
          max={100}
          step={1}
          className="mb-6"
          data-testid="slider-energy"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Decompress</span>
          <span>Balanced</span>
          <span>Pack it in</span>
        </div>
      </div>
    </div>
  );
}

function StepBudget({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    { value: "under-100", label: "Under $100", sub: "Budget-friendly" },
    { value: "100-200", label: "$100–200", sub: "Comfortable" },
    { value: "200-350", label: "$200–350", sub: "Treat yourself" },
    { value: "350-plus", label: "$350+", sub: "Luxury" },
  ];

  function toggle(value: string) {
    setState((s: IntakeState) => ({
      ...s,
      budget: s.budget.includes(value)
        ? s.budget.filter((b) => b !== value)
        : [...s.budget, value],
    }));
  }

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        Daily budget per person?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Select all that apply — we'll find the sweet spot.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = state.budget.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                active
                  ? "border-primary bg-primary/8"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              data-testid={`button-budget-${opt.value}`}
            >
              <div className={`font-semibold text-lg ${active ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{opt.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepActivities({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    { label: "Hidden Gems", sub: "Off-the-beaten-path spots locals love" },
    { label: "Iconic Landmarks", sub: "The must-sees, done right" },
    { label: "Food & Drink", sub: "Food tours • markets • local specialties" },
    { label: "History & Museums", sub: "Museums • historic sites • architecture" },
    { label: "Nature & Parks", sub: "Parks • viewpoints • scenic walks" },
    { label: "Markets & Shopping", sub: "Local markets • boutiques • vintage finds" },
    { label: "Nightlife", sub: "Bars • live music • late-night spots" },
    { label: "Art & Culture", sub: "Galleries • street art • performances" },
  ];

  function toggle(label: string) {
    setState((s: IntakeState) => ({
      ...s,
      activityTypes: s.activityTypes.includes(label)
        ? s.activityTypes.filter((a) => a !== label)
        : [...s.activityTypes, label],
    }));
  }

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        What kinds of experiences are you looking for?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">Pick all that excite you.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = state.activityTypes.includes(opt.label);
          return (
            <button
              key={opt.label}
              onClick={() => toggle(opt.label)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                active
                  ? "border-primary bg-primary/8"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              data-testid={`button-activity-${opt.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
            >
              <div className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label className="block text-xs text-muted-foreground mb-2 tracking-wide">
          Anything else on your must-do list?
        </label>
        <textarea
          placeholder="e.g. Whale watching, a cooking class, somewhere with live jazz…"
          value={state.activityNotes}
          onChange={(e) => setState((s: IntakeState) => ({ ...s, activityNotes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          data-testid="input-activity-notes"
        />
      </div>
    </div>
  );
}

function StepAnchor({ state, setState }: { state: IntakeState; setState: any }) {
  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        Anything specific to plan around?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        A reservation, event, or must-do — we'll build your day around it.
      </p>
      <textarea
        placeholder={"e.g. Dinner at Alo on Saturday evening\nCanucks game Friday night\nMorning hike at Grouse Mountain"}
        value={state.anchorActivity}
        onChange={(e) => setState((s: IntakeState) => ({ ...s, anchorActivity: e.target.value }))}
        rows={4}
        className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
        data-testid="input-anchor-activity"
      />
      <p className="text-xs text-muted-foreground/65 mt-2">
        Optional — leave blank and we'll plan everything from scratch.
      </p>
    </div>
  );
}

function StepFood({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    {
      value: "neighbourhood-gems",
      icon: <MapPin className="w-4 h-4" />,
      label: "Neighbourhood gems",
      sub: "Local spots, cafés, and hidden finds",
    },
    {
      value: "chef-driven",
      icon: <Utensils className="w-4 h-4" />,
      label: "Chef-driven restaurants",
      sub: "Creative menus, local ingredients, memorable meals",
    },
    {
      value: "cocktail-wine-bars",
      icon: <Wine className="w-4 h-4" />,
      label: "Cocktail & wine bars",
      sub: "Craft cocktails, natural wine, great atmosphere",
    },
    {
      value: "street-food-markets",
      icon: <ShoppingBag className="w-4 h-4" />,
      label: "Street food & markets",
      sub: "Food halls, vendors, eat-as-you-explore",
    },
    {
      value: "brunch-coffee",
      icon: <Coffee className="w-4 h-4" />,
      label: "Brunch & coffee culture",
      sub: "Leisurely mornings, specialty coffee, great plates",
    },
    {
      value: "quick-casual",
      icon: <Timer className="w-4 h-4" />,
      label: "Quick & casual",
      sub: "Grab and go — food isn't the main event",
    },
  ];

  function toggle(value: string) {
    setState((s: IntakeState) => ({
      ...s,
      food: s.food.includes(value)
        ? s.food.filter((f) => f !== value)
        : [...s.food, value],
    }));
  }

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        What are your dining preferences?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">Select all that interest you — we'll build your meals around them.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = state.food.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                active
                  ? "border-primary bg-primary/8"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              data-testid={`button-food-${opt.value}`}
            >
              <span className={`block mb-2 ${active ? "text-primary" : "text-muted-foreground"}`}>
                {opt.icon}
              </span>
              <div className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label className="text-sm text-muted-foreground mb-2 block">
          Any dietary preferences we should keep in mind?{" "}
          <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Vegetarian, Gluten-free, Halal…"
          value={state.dietaryNotes}
          onChange={(e) => setState((s: IntakeState) => ({ ...s, dietaryNotes: e.target.value }))}
          className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          data-testid="input-dietary"
        />
        {state.dietaryNotes.trim().length > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Very specific requirements may limit suggestions slightly.
          </p>
        )}
      </div>
    </div>
  );
}
