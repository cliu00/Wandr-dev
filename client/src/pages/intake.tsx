import { useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, X, Heart, Users, Compass, Utensils, Timer,
  CalendarDays, ChevronDown, MapPin, Sparkles, Baby, Zap,
  Coffee, UtensilsCrossed, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";

type GroupType = "solo" | "duo" | "group" | "family";

interface IntakeState {
  destination:   string;
  duration:      number | null;
  startDate:     Date | undefined;
  groupType:     GroupType;
  // Universal
  energy:        number;
  budget:        string;
  activityTypes: string[];
  food:          string[];
  anchorActivity: string;
  activityNotes: string;
  // Solo-specific
  soloVibe:      string | null;
  // Duo-specific
  duoStyle:      string | null;
  // Group-specific
  groupDynamic:  string | null;
  // Family-specific
  kidsAges:      string[];
  familyNeeds:   string;
}

// ─── Step sequences per persona ───────────────────────────────────────────────
// All 4 flows share the same 5-slot structure:
//   1. Duration + dates  (universal)
//   2. Persona identity  (solo vibe / duo style / group dynamic / kids ages)
//   3. Energy            (universal, persona-adapted copy)
//   4. Budget            (universal, persona-adapted copy)
//   5. Persona closer    (solo → activities | duo → food | group → activities | family → familyNeeds)
const STEP_SEQUENCES: Record<GroupType, string[]> = {
  solo:   ["durationDate", "soloVibe",     "energy", "budget", "activities"],
  duo:    ["durationDate", "duoStyle",     "energy", "budget", "food"],
  group:  ["durationDate", "groupDynamic", "energy", "budget", "activities"],
  family: ["durationDate", "kidsAges",     "energy", "budget", "familyNeeds"],
};

// Steps where "Skip" is not available
const REQUIRED_STEPS = new Set(["durationDate", "kidsAges"]);

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

const PERSONA_CONTEXT: Record<GroupType, string> = {
  solo:   "Solo escape",
  duo:    "Escape for two",
  group:  "Group escape",
  family: "Family escape",
};

const FINAL_CTA: Record<GroupType, string> = {
  solo:   "Plan My Adventure →",
  duo:    "Plan Our Adventure →",
  group:  "Invite My Companions →",
  family: "Plan Our Adventure →",
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function Intake() {
  const [, navigate] = useLocation();
  const searchParams   = new URLSearchParams(window.location.search);
  const prefillDest    = searchParams.get("destination") || "";
  const tripTypeParam  = (searchParams.get("tripType") || "solo") as GroupType;
  const validTypes: GroupType[] = ["solo", "duo", "group", "family"];
  const groupType = validTypes.includes(tripTypeParam) ? tripTypeParam : "solo";

  const [step,       setStep]       = useState(1);
  const [direction,  setDirection]  = useState(1);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [state, setState] = useState<IntakeState>({
    destination:   prefillDest,
    duration:      null,
    startDate:     undefined,
    groupType,
    energy:        50,
    budget:        "",
    activityTypes: [],
    food:          [],
    anchorActivity: "",
    activityNotes: "",
    soloVibe:      null,
    duoStyle:      null,
    groupDynamic:  null,
    kidsAges:      [],
    familyNeeds:   "",
  });

  const STEPS    = STEP_SEQUENCES[groupType];
  const totalSteps     = STEPS.length;
  const currentStepKey = STEPS[step - 1];
  const isLastStep     = step === totalSteps;
  const isSkippable    = !REQUIRED_STEPS.has(currentStepKey);
  const progress       = (step / totalSteps) * 100;

  function goNext() {
    setDirection(1);
    setSkipConfirm(false);
    setStep((s) => s + 1);
  }
  function goBack() {
    if (step === 1) { navigate("/"); return; }
    setSkipConfirm(false);
    setDirection(-1);
    setStep((s) => s - 1);
  }
  function actuallySkip() {
    setSkipConfirm(false);
    if (isLastStep) handleSubmit();
    else goNext();
  }
  function handleSubmit() {
    navigate("/generating");
  }

  function canContinue(): boolean {
    switch (currentStepKey) {
      case "durationDate":  return state.duration !== null;
      case "soloVibe":      return state.soloVibe !== null;
      case "duoStyle":      return state.duoStyle !== null;
      case "groupDynamic":  return state.groupDynamic !== null;
      case "kidsAges":      return state.kidsAges.length > 0;
      default:              return true;
    }
  }

  const endDate =
    state.startDate && state.duration
      ? addDays(state.startDate, state.duration - 1)
      : null;

  const contextLabel = [
    prefillDest && `${prefillDest} ·`,
    PERSONA_CONTEXT[groupType],
  ].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress + header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quiz progress"
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3 bg-background border-b border-border/60">
          <button
            onClick={goBack}
            aria-label={step === 1 ? "Exit quiz" : "Previous question"}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            {step === 1
              ? <X className="w-4 h-4" aria-hidden="true" />
              : <ArrowLeft className="w-4 h-4" aria-hidden="true" />}
          </button>

          {contextLabel && (
            <span className="text-xs text-muted-foreground tracking-wide truncate mx-3">
              {contextLabel}
            </span>
          )}

          <div className="text-right flex-shrink-0" data-testid="text-step-counter">
            <div className="text-sm text-muted-foreground font-medium">{step}/{totalSteps}</div>
            {isSkippable && (
              <div className="text-[10px] text-muted-foreground/40 leading-tight mt-0.5 tracking-wide">
                Details improve results
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col pt-20 pb-32">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${groupType}-${step}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {currentStepKey === "durationDate"  && <StepDurationDate state={state} setState={setState} endDate={endDate} groupType={groupType} />}
              {currentStepKey === "soloVibe"      && <StepSoloVibe     state={state} setState={setState} />}
              {currentStepKey === "duoStyle"      && <StepDuoStyle     state={state} setState={setState} />}
              {currentStepKey === "groupDynamic"  && <StepGroupDynamic state={state} setState={setState} />}
              {currentStepKey === "kidsAges"      && <StepKidsAges     state={state} setState={setState} />}
              {currentStepKey === "energy"        && <StepEnergy       state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "budget"        && <StepBudget       state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "activities"    && <StepActivities   state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "anchor"        && <StepAnchor       state={state} setState={setState} />}
              {currentStepKey === "food"          && <StepFood         state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "familyNeeds"   && <StepFamilyNeeds  state={state} setState={setState} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/60 px-4 pt-4 pb-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <div className="w-full flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              className="rounded-full px-5 gap-1.5 flex-shrink-0"
              data-testid="button-back-footer"
              aria-label={step === 1 ? "Back to home" : "Previous question"}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1 rounded-full text-base font-medium"
              disabled={!canContinue()}
              onClick={isLastStep ? handleSubmit : goNext}
              data-testid="button-continue"
            >
              {isLastStep ? FINAL_CTA[groupType] : "Continue"}
            </Button>
          </div>

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

// ─── Step components ───────────────────────────────────────────────────────────

function SelectCard({
  active,
  onClick,
  testId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
        active
          ? "border-primary bg-primary/8"
          : "border-border bg-card hover:border-primary/40"
      }`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

// ── Duration + Date ────────────────────────────────────────────────────────────
function StepDurationDate({
  state, setState, endDate, groupType,
}: {
  state: IntakeState;
  setState: any;
  endDate: Date | null;
  groupType: GroupType;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const today = new Date();

  const headings: Record<GroupType, string> = {
    solo:   "How long is your escape?",
    duo:    "How long are you two getting away?",
    group:  "How long is the group trip?",
    family: "How many days are you planning for?",
  };

  const options = [1, 2, 3, 4];

  return (
    <div>
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-primary/6 border border-primary/12 mb-7">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-primary/75 leading-snug">
          The more you share, the more personalised your itinerary will be. Every question after this one is optional.
        </p>
      </div>

      <h2 className="font-serif text-4xl font-light text-foreground mb-8 leading-tight">
        {headings[groupType]}
      </h2>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {options.map((n) => {
          const selected = state.duration === n;
          return (
            <button
              key={n}
              onClick={() => setState((s: IntakeState) => ({ ...s, duration: n }))}
              className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50 text-foreground"
              }`}
              data-testid={`button-duration-${n}`}
            >
              <span className={`font-serif text-5xl font-light leading-none ${selected ? "text-primary-foreground" : "text-foreground"}`}>
                {n}
              </span>
              <span className={`text-[11px] uppercase tracking-widest mt-2 font-medium ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {n === 1 ? "day" : "days"}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowDatePicker((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all ${
          showDatePicker || state.startDate
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30"
        }`}
        aria-expanded={showDatePicker}
        data-testid="button-toggle-dates"
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" aria-hidden="true" />
          {state.startDate
            ? endDate
              ? `${format(state.startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`
              : format(state.startDate, "MMMM d, yyyy")
            : "Add travel dates (optional)"}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? "rotate-180" : ""}`} aria-hidden="true" />
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
              .rdp-day_selected { background-color: hsl(155 35% 22%) !important; color: white !important; }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: hsl(155 35% 22% / 0.08) !important; }
              .rdp { --rdp-accent-color: hsl(155 35% 22%); }
              .rdp-caption_label { font-family: var(--font-serif); font-weight: 400; font-size: 1rem; letter-spacing: 0.04em; }
            `}</style>
            <DayPicker
              mode="single"
              selected={state.startDate}
              onSelect={(date) => setState((s: IntakeState) => ({ ...s, startDate: date || undefined }))}
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

// ── Solo travel style ──────────────────────────────────────────────────────────
function StepSoloVibe({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    {
      value:   "explorer",
      icon:    <Compass className="w-5 h-5" aria-hidden="true" />,
      label:   "The Explorer",
      sub:     "I seek what's off the map. Hidden spots, local neighbourhoods, the road less taken.",
    },
    {
      value:   "immersive",
      icon:    <Star className="w-5 h-5" aria-hidden="true" />,
      label:   "The Immersive",
      sub:     "I go deep. One neighbourhood, one cuisine, one culture — fully absorbed.",
    },
    {
      value:   "spontaneous",
      icon:    <Zap className="w-5 h-5" aria-hidden="true" />,
      label:   "The Spontaneous",
      sub:     "I follow the day. A rough outline, but always open to whatever I find.",
    },
  ];

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        What kind of solo traveller are you?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        This shapes how we sequence your days — not just what to see, but how to experience it.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <SelectCard
            key={opt.value}
            active={state.soloVibe === opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, soloVibe: opt.value }))}
            testId={`button-solo-vibe-${opt.value}`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${state.soloVibe === opt.value ? "text-primary" : "text-muted-foreground"}`}>
              {opt.icon}
            </span>
            <div>
              <div className={`font-semibold text-base mb-0.5 ${state.soloVibe === opt.value ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-sm text-muted-foreground leading-snug">{opt.sub}</div>
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

// ── Duo trip tone ──────────────────────────────────────────────────────────────
function StepDuoStyle({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    {
      value:   "romantic",
      icon:    <Heart className="w-5 h-5" aria-hidden="true" />,
      label:   "Romantic escape",
      sub:     "Candlelit dinners, scenic moments, a little luxury. This trip is about us.",
    },
    {
      value:   "adventure",
      icon:    <Compass className="w-5 h-5" aria-hidden="true" />,
      label:   "Shared adventure",
      sub:     "We're both keen to explore. Active, curious, full days together.",
    },
    {
      value:   "leisure",
      icon:    <Coffee className="w-5 h-5" aria-hidden="true" />,
      label:   "Laid-back leisure",
      sub:     "No agenda. Good food, easy walks, and plenty of time to just be.",
    },
  ];

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        What kind of trip is this for you two?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Helps us set the right tone — from the restaurant picks to how we pace the days.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <SelectCard
            key={opt.value}
            active={state.duoStyle === opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, duoStyle: opt.value }))}
            testId={`button-duo-style-${opt.value}`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${state.duoStyle === opt.value ? "text-primary" : "text-muted-foreground"}`}>
              {opt.icon}
            </span>
            <div>
              <div className={`font-semibold text-base mb-0.5 ${state.duoStyle === opt.value ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-sm text-muted-foreground leading-snug">{opt.sub}</div>
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

// ── Group dynamic ──────────────────────────────────────────────────────────────
function StepGroupDynamic({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    {
      value:   "together",
      icon:    <Users className="w-5 h-5" aria-hidden="true" />,
      label:   "Together the whole time",
      sub:     "We move as a pack. One plan, one experience, everyone in.",
    },
    {
      value:   "loose",
      icon:    <Compass className="w-5 h-5" aria-hidden="true" />,
      label:   "Loosely together",
      sub:     "Same city, different interests. We meet for meals and highlights.",
    },
    {
      value:   "mix",
      icon:    <Zap className="w-5 h-5" aria-hidden="true" />,
      label:   "A mix of both",
      sub:     "Group moments for the big things, personal time in between.",
    },
  ];

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        How does your group like to travel?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        We'll structure the itinerary around your group's natural rhythm.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <SelectCard
            key={opt.value}
            active={state.groupDynamic === opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, groupDynamic: opt.value }))}
            testId={`button-group-dynamic-${opt.value}`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${state.groupDynamic === opt.value ? "text-primary" : "text-muted-foreground"}`}>
              {opt.icon}
            </span>
            <div>
              <div className={`font-semibold text-base mb-0.5 ${state.groupDynamic === opt.value ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-sm text-muted-foreground leading-snug">{opt.sub}</div>
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

// ── Kids ages (Family) ─────────────────────────────────────────────────────────
function StepKidsAges({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    {
      value: "toddlers",
      icon:  <Baby className="w-5 h-5" aria-hidden="true" />,
      label: "Babies & toddlers",
      sub:   "Under 4 — stroller-friendly, short attention spans, early bedtimes.",
    },
    {
      value: "young",
      icon:  <Star className="w-5 h-5" aria-hidden="true" />,
      label: "Young kids",
      sub:   "4–10 — curious, energetic, great for interactive and outdoor activities.",
    },
    {
      value: "tweens",
      icon:  <Zap className="w-5 h-5" aria-hidden="true" />,
      label: "Tweens & teens",
      sub:   "11+ — ready for more, appreciate cool experiences and some independence.",
    },
  ];

  function toggle(value: string) {
    setState((s: IntakeState) => ({
      ...s,
      kidsAges: s.kidsAges.includes(value)
        ? s.kidsAges.filter((a) => a !== value)
        : [...s.kidsAges, value],
    }));
  }

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        Who are you travelling with?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        We'll keep every activity appropriate for your youngest travellers. Select all that apply.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const active = state.kidsAges.includes(opt.value);
          return (
            <SelectCard
              key={opt.value}
              active={active}
              onClick={() => toggle(opt.value)}
              testId={`button-kids-age-${opt.value}`}
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
            </SelectCard>
          );
        })}
      </div>
    </div>
  );
}

// ── Energy ─────────────────────────────────────────────────────────────────────
function StepEnergy({ state, setState, groupType }: { state: IntakeState; setState: any; groupType: GroupType }) {
  const headings: Record<GroupType, string> = {
    solo:   "What's your energy this trip?",
    duo:    "What's your energy as a pair?",
    group:  "What's the group's overall vibe?",
    family: "How much do you want to pack in?",
  };
  const subtexts: Record<GroupType, string> = {
    solo:   "From full chill to full throttle.",
    duo:    "We'll match the pace to both of you.",
    group:  "We'll build in flexibility so no one gets left behind.",
    family: "We'll leave room for downtime — families need it.",
  };
  const labels: Record<GroupType, [string, string, string]> = {
    solo:   ["Decompress",    "Balanced",       "Pack it in"],
    duo:    ["Take it slow",  "Mix it up",      "Full days"],
    group:  ["Relaxed pace", "Some of both",   "Action-packed"],
    family: ["Very relaxed", "Moderate",       "Active"],
  };

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        {headings[groupType]}
      </h2>
      <p className="text-muted-foreground mb-12 text-sm">{subtexts[groupType]}</p>
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
          {labels[groupType].map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Budget ─────────────────────────────────────────────────────────────────────
function StepBudget({ state, setState, groupType }: { state: IntakeState; setState: any; groupType: GroupType }) {
  const headings: Record<GroupType, string> = {
    solo:   "What's your spend style?",
    duo:    "What's your spend style?",
    group:  "What's the group's spend style?",
    family: "What's your spend style?",
  };
  const subtexts: Record<GroupType, string> = {
    solo:   "We'll match every recommendation to how you like to travel.",
    duo:    "We'll shape the whole trip around it.",
    group:  "We'll balance quality and value for everyone.",
    family: "We'll include family pricing where relevant.",
  };

  const options = [
    { value: "under-100", label: "Budget-friendly" },
    { value: "100-200",   label: "Comfortable"     },
    { value: "200-350",   label: "Treat yourself"  },
    { value: "350-plus",  label: "Luxury"           },
  ];

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        {headings[groupType]}
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">{subtexts[groupType]}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = state.budget === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setState((s: IntakeState) => ({ ...s, budget: opt.value }))}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
              }`}
              data-testid={`button-budget-${opt.value}`}
            >
              <div className={`font-semibold text-lg ${active ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Activities ─────────────────────────────────────────────────────────────────
function StepActivities({ state, setState, groupType }: { state: IntakeState; setState: any; groupType: GroupType }) {
  const headings: Record<GroupType, string> = {
    solo:   "What kinds of experiences are you looking for?",
    duo:    "What do you two enjoy most?",
    group:  "What does the group enjoy?",
    family: "What does your family enjoy most?",
  };
  const subtexts: Record<GroupType, string> = {
    solo:   "Pick all that excite you.",
    duo:    "Pick everything that appeals to both of you — or just one of you.",
    group:  "Pick all that apply. We'll find the highest-overlap picks.",
    family: "Pick anything the whole family would enjoy.",
  };

  const allOptions = [
    { label: "Hidden Gems",       sub: "Off-the-beaten-path spots locals love" },
    { label: "Iconic Landmarks",  sub: "The must-sees, done right" },
    { label: "Food & Drink",      sub: "Food tours • markets • local specialties" },
    { label: "History & Museums", sub: "Museums • historic sites • architecture" },
    { label: "Nature & Parks",    sub: "Parks • viewpoints • scenic walks" },
    { label: "Markets & Shopping",sub: "Local markets • boutiques • vintage finds" },
    { label: "Nightlife",         sub: "Bars • live music • late-night spots" },
    { label: "Art & Culture",     sub: "Galleries • street art • performances" },
  ];

  // Family hides Nightlife
  const options = groupType === "family"
    ? allOptions.filter((o) => o.label !== "Nightlife")
    : allOptions;

  const placeholders: Record<GroupType, string> = {
    solo:   "e.g. Whale watching, live jazz bar, dinner at Alo Saturday, morning hike at Grouse Mountain…",
    duo:    "e.g. A wine tasting, rooftop bar, couples cooking class, dinner reservation Friday…",
    group:  "e.g. A group boat tour, escape room, something active together, concert on Saturday…",
    family: "e.g. Science centre, mini-golf, something hands-on for the kids…",
  };

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
        {headings[groupType]}
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">{subtexts[groupType]}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = state.activityTypes.includes(opt.label);
          return (
            <button
              key={opt.label}
              onClick={() => toggle(opt.label)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
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
          {groupType === "solo" || groupType === "duo"
            ? "Anything specific to plan around — activities, reservations, or must-dos?"
            : "Anything else on your group's must-do list?"}
        </label>
        <textarea
          placeholder={placeholders[groupType]}
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

// ── Anchor (Solo only) ────────────────────────────────────────────────────────
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
    </div>
  );
}

// ── Food ──────────────────────────────────────────────────────────────────────
function StepFood({ state, setState, groupType }: { state: IntakeState; setState: any; groupType: GroupType }) {
  const headings: Record<GroupType, string> = {
    solo:   "How do you like to eat and drink?",
    duo:    "What's your dining style as a pair?",
    group:  "How do you like to eat and drink?",
    family: "How do you like to eat and drink?",
  };

  const options = [
    {
      value: "street-food",
      icon:  <MapPin className="w-5 h-5" aria-hidden="true" />,
      label: "Street food & markets",
      sub:   "Stalls, vendors, food halls — the hunt is half the fun.",
    },
    {
      value: "neighbourhood",
      icon:  <Coffee className="w-5 h-5" aria-hidden="true" />,
      label: "Neighbourhood gems",
      sub:   "Mom-and-pop spots, family-run kitchens — beloved by locals.",
    },
    {
      value: "sit-down",
      icon:  <UtensilsCrossed className="w-5 h-5" aria-hidden="true" />,
      label: "Proper sit-downs",
      sub:   "Full menus, good wine, no rush — conversation over courses.",
    },
    {
      value: "special-evening",
      icon:  <Sparkles className="w-5 h-5" aria-hidden="true" />,
      label: "One standout meal",
      sub:   "A memorable table as a trip highlight — not every meal needs to be an event.",
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
        {headings[groupType]}
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">Select all that feel right.</p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const active = state.food.includes(opt.value);
          return (
            <SelectCard
              key={opt.value}
              active={active}
              onClick={() => toggle(opt.value)}
              testId={`button-food-${opt.value}`}
            >
              <span className={`flex-shrink-0 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                {opt.icon}
              </span>
              <div>
                <div className={`font-semibold text-sm mb-0.5 ${active ? "text-primary" : "text-foreground"}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-muted-foreground leading-snug">{opt.sub}</div>
              </div>
            </SelectCard>
          );
        })}
      </div>

      <div className="mt-5">
        <label className="block text-xs text-muted-foreground mb-2 tracking-wide">
          Any dietary needs or restrictions?
        </label>
        <textarea
          placeholder="e.g. Vegetarian, nut allergy, gluten-free, halal…"
          value={state.activityNotes}
          onChange={(e) => setState((s: IntakeState) => ({ ...s, activityNotes: e.target.value }))}
          rows={2}
          className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          data-testid="input-dietary-notes"
        />
        <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
          We'll make every effort to suggest places that support mainstream needs — gluten-free, vegetarian, vegan, keto, and more. For complex restrictions or severe allergies, we recommend calling venues ahead of your visit. We can't guarantee a perfect match for every requirement.
        </p>
      </div>
    </div>
  );
}

// ── Family needs ───────────────────────────────────────────────────────────────
function StepFamilyNeeds({ state, setState }: { state: IntakeState; setState: any }) {
  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        Anything we should plan around?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Dietary restrictions, accessibility needs, nap schedules, early dinners — anything that shapes the day.
      </p>
      <textarea
        placeholder={
          "e.g. Nut allergy\nStroller-friendly routes only\nEarly dinners before 6pm\nMy 5-year-old loves trains\nWheelchair accessible venues needed"
        }
        value={state.familyNeeds}
        onChange={(e) => setState((s: IntakeState) => ({ ...s, familyNeeds: e.target.value }))}
        rows={5}
        className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
        data-testid="input-family-needs"
      />
      <p className="text-xs text-muted-foreground mt-3">
        Leave blank if there's nothing specific — we'll build a family-friendly plan by default.
      </p>
    </div>
  );
}
