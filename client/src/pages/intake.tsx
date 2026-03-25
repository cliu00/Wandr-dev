import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { FlowHeader } from "@/components/flow-header";
import {
  ArrowLeft, X, Heart, Users, Compass, Utensils, Timer,
  CalendarDays, MapPin, Sparkles, Baby, Zap,
  Coffee, UtensilsCrossed, Star, User, Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import { format, addDays, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

type GroupType = "solo" | "duo" | "group" | "family";

interface IntakeState {
  destination:   string;
  duration:      number | null;
  startDate:     Date | undefined;
  endDate:       Date | undefined;
  groupType:     GroupType;
  // Universal
  energy:        number | null;
  budget:        string;
  activityTypes: string[];
  food:          string[];
  anchorActivity: string;
  activityNotes: string;
  dietaryNotes:  string;
  // Solo-specific
  soloVibe:      string | null;
  // Duo-specific
  duoStyle:      string | null;
  // Group-specific
  organizerName: string;
  groupDynamic:  string | null;
  // Family-specific
  kidsAges:      string[];
  familyNeeds:   string[];
  // Universal
  firstTime:     boolean | null;
}

// ─── Step sequences per persona ───────────────────────────────────────────────
// MVP: Solo and Group flows only.
// TODO (MVP v2): Re-enable duo and family when their steps are ready.
//   1. Duration + dates  (universal)
//   2. Persona identity  (solo vibe / group dynamic)
//   3. Energy            (universal, persona-adapted copy)
//   4. Budget            (universal, persona-adapted copy)
//   5. Activities        (universal, persona-adapted copy)
//   6. Food & dining     (universal, persona-adapted copy)
const STEP_SEQUENCES: Record<GroupType, string[]> = {
  solo:   ["durationDate", "firstTime", "energy", "budget", "activities", "food"],
  // TODO (MVP v2): Duo flow
  duo:    ["durationDate", "firstTime", "duoStyle",     "energy", "budget", "activities", "food"],
  group:  ["durationDate", "firstTime", "groupDynamic", "energy", "budget", "activities", "food"],
  // TODO (MVP v2): Family flow (includes kidsAges + familyNeeds steps)
  family: ["durationDate", "firstTime", "kidsAges",     "energy", "budget", "activities", "food", "familyNeeds"],
};

// Steps where "Skip" is not available
const REQUIRED_STEPS = new Set(["partyType", "durationDate", "kidsAges"]);

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

const PERSONA_CONTEXT: Record<GroupType, string> = {
  solo:   "Solo adventure",
  duo:    "Adventure for two",
  group:  "Group adventure",
  family: "Family adventure",
};

const FINAL_CTA: Record<GroupType, string> = {
  solo:   "Plan My Adventure →",
  duo:    "Plan Our Adventure →",
  group:  "Generate My Itinerary →",
  family: "Plan Our Adventure →",
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function Intake() {
  const [, navigate] = useLocation();
  const searchParams   = new URLSearchParams(window.location.search);
  const prefillDest    = searchParams.get("destination") || "";
  const tripTypeParam  = (searchParams.get("tripType") || "solo") as GroupType;
  const hasNoType      = searchParams.get("noType") === "true";
  const validTypes: GroupType[] = ["solo", "duo", "group", "family"];
  const initialGroupType = validTypes.includes(tripTypeParam) ? tripTypeParam : "solo";

  const [step,              setStep]              = useState(1);
  const [direction,         setDirection]         = useState(1);
  const [skipConfirm,       setSkipConfirm]       = useState(false);
  const [groupType,         setGroupType]         = useState<GroupType>(initialGroupType);
  const [partyTypeSelected, setPartyTypeSelected] = useState(!hasNoType);

  const [state, setState] = useState<IntakeState>({
    destination:   prefillDest,
    duration:      null,
    startDate:     undefined,
    endDate:       undefined,
    groupType:     initialGroupType,
    energy:        null,
    budget:        "",
    activityTypes: [],
    food:          [],
    anchorActivity: "",
    activityNotes: "",
    dietaryNotes:  "",
    soloVibe:      null,
    duoStyle:      null,
    organizerName: "",
    groupDynamic:  null,
    kidsAges:      [],
    familyNeeds:   [],
    firstTime:     null,
  });

  const STEPS      = hasNoType
    ? ["partyType", ...STEP_SEQUENCES[groupType]]
    : STEP_SEQUENCES[groupType];
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
    if (!state.destination.trim()) {
      navigate("/?missingDestination=1");
      return;
    }
    const startDate = state.startDate ? format(state.startDate, "yyyy-MM-dd") : undefined;
    const durationDays = state.duration ?? 2;

    // All group types (solo + group) go through the same generation path.
    // The generated itinerary URL is what gets shared with companions.
    const preferences = {
      destination:   state.destination,
      startDate,
      endDate:       state.endDate ? format(state.endDate, "yyyy-MM-dd") : undefined,
      durationDays,
      groupType,
      energy:        state.energy,
      budget:        state.budget || undefined,
      activityTypes: state.activityTypes,
      food:          state.food,
      anchorActivity: state.anchorActivity || undefined,
      activityNotes:  state.activityNotes || undefined,
      dietaryNotes:   state.dietaryNotes || undefined,
      soloVibe:      state.soloVibe,
      duoStyle:      state.duoStyle,
      groupDynamic:  state.groupDynamic,
      kidsAges:      state.kidsAges,
      familyNeeds:   state.familyNeeds,
      firstTime:     state.firstTime ?? undefined,
    };
    sessionStorage.setItem("wandr_pending_preferences", JSON.stringify(preferences));
    navigate(`/generating?groupType=${groupType}`);
  }

  function canContinue(): boolean {
    switch (currentStepKey) {
      case "partyType":     return partyTypeSelected;
      case "durationDate":  return true;
      case "soloVibe":      return state.soloVibe !== null;
      case "duoStyle":      return state.duoStyle !== null;
      case "groupDynamic":  return state.groupDynamic !== null;
      case "kidsAges":      return state.kidsAges.length > 0;
      default:              return true;
    }
  }

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
        <FlowHeader
          onBack={step > 1 ? goBack : undefined}
          onExit={step === 1 ? goBack : undefined}
          rightContent={
            <div className="text-right" data-testid="text-step-counter">
              <div className="text-sm font-medium">{step}/{totalSteps}</div>
              {isSkippable && (
                <div className="text-[10px] leading-tight mt-0.5 tracking-wide opacity-40">
                  Details improve results
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col pt-20 pb-32">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepKey}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {currentStepKey === "partyType"     && <StepPartyType    groupType={groupType} onSelect={(t) => { setGroupType(t); setPartyTypeSelected(true); }} />}
              {currentStepKey === "durationDate"  && <StepDurationDate state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "firstTime"     && <StepFirstTime    state={state} setState={setState} />}
              {currentStepKey === "soloVibe"      && <StepSoloVibe     state={state} setState={setState} />}
              {/* TODO (MVP v2): Duo flow — uncomment when re-enabling duo group type */}
              {/* {currentStepKey === "duoStyle"      && <StepDuoStyle     state={state} setState={setState} />} */}
              {currentStepKey === "groupDynamic"  && <StepGroupDynamic state={state} setState={setState} />}
              {/* TODO (MVP v2): Family flow — uncomment when re-enabling family group type */}
              {/* {currentStepKey === "kidsAges"      && <StepKidsAges     state={state} setState={setState} />} */}
              {currentStepKey === "energy"        && <StepEnergy       state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "budget"        && <StepBudget       state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "activities"    && <StepActivities   state={state} setState={setState} groupType={groupType} />}
              {currentStepKey === "anchor"        && <StepAnchor       state={state} setState={setState} />}
              {currentStepKey === "food"          && <StepFood         state={state} setState={setState} groupType={groupType} />}
              {/* TODO (MVP v2): Family flow — uncomment when re-enabling family group type */}
              {/* {currentStepKey === "familyNeeds"   && <StepFamilyNeeds  state={state} setState={setState} />} */}
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

// ── Party type selector (shown when arriving from Popular Destinations) ─────────
function StepPartyType({
  groupType,
  onSelect,
}: {
  groupType: GroupType;
  onSelect: (type: GroupType) => void;
}) {
  const options: { value: GroupType; icon: React.ReactNode; label: string; sub: string }[] = [
    {
      value: "solo",
      icon: <User className="w-5 h-5" aria-hidden="true" />,
      label: "Solo",
      sub: "Built around your pace, no compromises.",
    },
    // TODO (MVP v2): Duo flow — re-enable when duoStyle step is ready
    // {
    //   value: "duo",
    //   icon: <Handshake className="w-5 h-5" aria-hidden="true" />,
    //   label: "Duo",
    //   sub: "Balanced for two people who want different things.",
    // },
    {
      value: "group",
      icon: <Users className="w-5 h-5" aria-hidden="true" />,
      label: "Group",
      sub: "One plan everyone actually agrees on.",
    },
    // TODO (MVP v2): Family flow — re-enable when kidsAges + familyNeeds steps are ready
    // {
    //   value: "family",
    //   icon: <Baby className="w-5 h-5" aria-hidden="true" />,
    //   label: "Family",
    //   sub: "Activities for everyone — including the adults.",
    // },
  ];

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        Who's joining you?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Your travel party shapes everything — the pace, the picks, and the plan.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <SelectCard
            key={opt.value}
            active={groupType === opt.value}
            onClick={() => onSelect(opt.value)}
            testId={`button-party-type-${opt.value}`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${groupType === opt.value ? "text-primary" : "text-muted-foreground"}`}>
              {opt.icon}
            </span>
            <div>
              <div className={`font-semibold text-base mb-0.5 ${groupType === opt.value ? "text-primary" : "text-foreground"}`}>
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

// ── Duration + Date ────────────────────────────────────────────────────────────
const MAX_DAYS = 4;

function cappedRange(a: Date, b: Date): DateRange {
  const [from, to] = a <= b ? [a, b] : [b, a];
  const cappedTo = differenceInDays(to, from) >= MAX_DAYS ? addDays(from, MAX_DAYS - 1) : to;
  return { from, to: cappedTo };
}


function StepDurationDate({
  state, setState, groupType,
}: {
  state: IntakeState;
  setState: any;
  groupType: GroupType;
}) {
  const today = new Date();
  const displayedMonthRef = useRef<Date>(today);
  const [capTooltipVisible, setCapTooltipVisible] = useState(false);

  const headings: Record<GroupType, string> = {
    solo:   "How long is your adventure?",
    duo:    "How long are you two getting away?",
    group:  "How long is the group trip?",
    family: "How many days are you planning for?",
  };

  function handleSelect(range: DateRange | undefined) {
    if (!range) {
      setState((s: IntakeState) => ({ ...s, startDate: undefined, endDate: undefined, duration: null }));
      return;
    }
    if (range.from && range.to) {
      const capped = cappedRange(range.from, range.to);
      const duration = differenceInDays(capped.to!, capped.from!) + 1;
      setState((s: IntakeState) => ({ ...s, startDate: capped.from, endDate: capped.to, duration }));
    } else if (range.from) {
      setState((s: IntakeState) => ({ ...s, startDate: range.from, endDate: undefined, duration: 1 }));
    }
  }

  const displayRange: DateRange | undefined =
    state.startDate ? { from: state.startDate, to: state.endDate } : undefined;

  const summaryFrom = displayRange?.from;
  const summaryTo   = displayRange?.to;
  const summaryDays = summaryFrom && summaryTo ? differenceInDays(summaryTo, summaryFrom) + 1 : 1;

  // Disable dates beyond the 4-day cap once a start date is selected
  const disabledDates = state.startDate
    ? { after: addDays(state.startDate, MAX_DAYS - 1) }
    : undefined;

  function handleCalendarMouseOver(e: React.MouseEvent) {
    const btn = (e.target as Element).closest("button") as HTMLButtonElement | null;
    setCapTooltipVisible(!!(btn?.disabled && state.startDate));
  }

  function handleCalendarTouchStart(e: React.TouchEvent) {
    const btn = (e.target as Element).closest("button") as HTMLButtonElement | null;
    if (btn?.disabled && state.startDate) {
      setCapTooltipVisible(true);
      setTimeout(() => setCapTooltipVisible(false), 2000);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-primary/6 border border-primary/12 mb-7">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-primary/75 leading-snug">
          The more you share, the more personalised your itinerary will be. Every question after this one is optional.
        </p>
      </div>

      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        {headings[groupType]}
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        When you're going matters — we'll tailor recommendations to the season and what's actually on.
      </p>

      <div
        className="relative border border-border rounded-2xl overflow-hidden bg-card"
        onMouseOver={handleCalendarMouseOver}
        onMouseLeave={() => setCapTooltipVisible(false)}
        onTouchStart={handleCalendarTouchStart}
      >
        {capTooltipVisible && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-medium shadow-md pointer-events-none whitespace-nowrap">
            Max 4 days
          </div>
        )}
        <div className="flex justify-center p-2">
          <style>{`
            .rdp-day_selected { background-color: hsl(155 35% 22%) !important; color: white !important; }
            .rdp-day_range_middle { background-color: hsl(155 35% 22% / 0.12) !important; color: hsl(155 35% 22%) !important; border-radius: 0 !important; }
            .rdp-day_range_start, .rdp-day_range_end { background-color: hsl(155 35% 22%) !important; color: white !important; }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected):not(.rdp-day_range_middle) { background-color: hsl(155 35% 22% / 0.08) !important; }
            .rdp { --rdp-accent-color: hsl(155 35% 22%); }
            .rdp-caption_label { font-family: var(--font-serif); font-weight: 400; font-size: 1rem; letter-spacing: 0.04em; }
          `}</style>
          <DayPicker
            mode="range"
            selected={displayRange}
            onSelect={handleSelect}
            onMonthChange={(m) => { displayedMonthRef.current = m; }}
            disabled={disabledDates}
            fromDate={today}
            numberOfMonths={1}
          />
        </div>
        {summaryFrom && (
          <div className="px-4 pb-3 flex items-center justify-between border-t border-border">
            <p className="text-sm text-primary font-medium pt-3">
              {summaryTo && summaryTo.getTime() !== summaryFrom.getTime()
                ? `${format(summaryFrom, "MMM d")} – ${format(summaryTo, "MMM d, yyyy")} · ${summaryDays} days`
                : `${format(summaryFrom, "MMM d, yyyy")} · 1 day`}
            </p>
            <button
              onClick={() => setState((s: IntakeState) => ({ ...s, startDate: undefined, endDate: undefined, duration: null }))}
              className="text-xs text-muted-foreground hover:text-foreground underline pt-3"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center">Wandr is built for short escapes up to 4 days.</p>
    </div>
  );
}

// ── First time in destination ──────────────────────────────────────────────────
function StepFirstTime({ state, setState }: { state: IntakeState; setState: any }) {
  const dest = state.destination || "this destination";
  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        First time in {dest}?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Wandr tailors the mix of iconic spots and hidden gems based on your familiarity.
      </p>
      <div className="flex flex-col gap-3">
        {[
          { value: true,  label: "Yes, first time",        sub: "I want to see the must-dos alongside the hidden gems." },
          { value: false, label: "No, I've been before",   sub: "Skip the basics — show me what locals actually do." },
        ].map((opt) => {
          const active = state.firstTime === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => setState((s: IntakeState) => ({ ...s, firstTime: opt.value }))}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
              }`}
            >
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
      label:   "Romantic getaway",
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
        How do you like to travel with your group?
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
  const options: Record<GroupType, { label: string; sub: string; value: number }[]> = {
    solo: [
      { label: "Keep it gentle",      sub: "Easy on the body — accessible spots, minimal exertion.", value: 0   },
      { label: "Moderately active",   sub: "Some activity, nothing too demanding.",             value: 50  },
      { label: "Bring it on",         sub: "Physically engaged days — keep me moving.",               value: 100 },
    ],
    duo: [
      { label: "Keep it gentle",      sub: "Easy on the body — accessible spots, minimal exertion.", value: 0   },
      { label: "Moderately active",   sub: "Some activity, nothing too demanding.",             value: 50  },
      { label: "Bring it on",         sub: "Physically engaged days — keep us moving.",               value: 100 },
    ],
    group: [
      { label: "Keep it gentle",      sub: "Easy on the body — accessible spots, minimal exertion.", value: 0   },
      { label: "Moderately active",   sub: "Some activity, nothing too demanding.",             value: 50  },
      { label: "Bring it on",         sub: "Physically engaged days — keep everyone moving.",         value: 100 },
    ],
    family: [
      { label: "Keep it gentle",      sub: "Easy on the body — accessible spots, minimal exertion.", value: 0   },
      { label: "Moderately active",   sub: "Some activity, nothing too demanding.",             value: 50  },
      { label: "Bring it on",         sub: "Physically engaged days — keep everyone moving.",         value: 100 },
    ],
  };

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        How physical do you want to get?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">We'll match activities to what you're up for.</p>
      <div className="flex flex-col gap-3">
        {options[groupType].map((opt) => {
          const active = state.energy === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setState((s: IntakeState) => ({ ...s, energy: opt.value }))}
              className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
              }`}
              data-testid={`button-energy-${opt.value}`}
            >
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
  );
}

// ── Budget ─────────────────────────────────────────────────────────────────────
function StepBudget({ state, setState, groupType }: { state: IntakeState; setState: any; groupType: GroupType }) {
  const headings: Record<GroupType, string> = {
    solo:   "What's your spend style?",
    duo:    "What's your spend style?",
    group:  "What's your spend style?",
    family: "What's your spend style?",
  };
  const subtexts: Record<GroupType, string> = {
    solo:   "Your budget sets the bar — we'll find the best within it.",
    duo:    "Your budget sets the bar — we'll find the best within it.",
    group:  "Your budget sets the bar — we'll find the best within it.",
    family: "Your budget sets the bar — we'll find the best within it.",
  };

  const suffix = groupType === "group" ? "/person/day" : "/day";
  const options = [
    { value: "under-100", label: "Budget-friendly", range: `~$50–100${suffix}`  },
    { value: "100-200",   label: "Comfortable",     range: `~$100–200${suffix}` },
    { value: "200-350",   label: "Treat yourself",  range: `~$200–350${suffix}` },
    { value: "350-plus",  label: "Luxury",           range: `$350+${suffix}`    },
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
              <div className={`font-semibold text-lg leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-1 ${active ? "text-primary/60" : "text-muted-foreground"}`}>
                {opt.range}
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
    group:  "What do you enjoy most?",
    family: "What does your family enjoy most?",
  };
  const subtexts: Record<GroupType, string> = {
    solo:   "Your picks shape every activity, neighbourhood, and stop we suggest.",
    duo:    "Your picks shape every activity, neighbourhood, and stop we suggest.",
    group:  "Your picks shape every activity, neighbourhood, and stop we suggest.",
    family: "Your picks shape every activity, neighbourhood, and stop we suggest.",
  };

  const allOptions = [
    { value: "hidden-gems",       label: "Hidden Gems",       sub: "Off-the-beaten-path spots locals love" },
    { value: "iconic-landmarks",  label: "Iconic Landmarks",  sub: "The must-sees, done right" },
    { value: "food-drink",        label: "Food & Drink",      sub: "Food tours • markets • local specialties" },
    { value: "history-museums",   label: "History & Museums", sub: "Museums • historic sites • architecture" },
    { value: "nature-parks",      label: "Nature & Parks",    sub: "Parks • viewpoints • scenic walks" },
    { value: "markets-shopping",  label: "Markets & Shopping",sub: "Local markets • boutiques • vintage finds" },
    { value: "nightlife",         label: "Nightlife",         sub: "Bars • live music • late-night spots" },
    { value: "art-culture",       label: "Art & Culture",     sub: "Galleries • street art • performances" },
    { value: "beaches-coastal",   label: "Beaches & Coastal", sub: "Beach clubs • coastal walks • seaside spots" },
    { value: "outdoor-adventure", label: "Outdoor Adventure", sub: "Hiking • cycling • watersports • active pursuits" },
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

  function toggle(value: string) {
    setState((s: IntakeState) => ({
      ...s,
      activityTypes: s.activityTypes.includes(value)
        ? s.activityTypes.filter((a) => a !== value)
        : [...s.activityTypes, value],
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
          const active = state.activityTypes.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
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
            : "Anything specific you'd like to plan around?"}
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
    solo:   "What's your dining style?",
    duo:    "What's your dining style?",
    group:  "What's your dining style?",
    family: "What's your dining style?",
  };
  const subtexts: Record<GroupType, string> = {
    solo:   "Good food isn't a footnote — we'll build it into the plan.",
    duo:    "Good food isn't a footnote — we'll build it into the plan.",
    group:  "Good food isn't a footnote — we'll build it into the plan.",
    family: "Good food isn't a footnote — we'll build it into the plan.",
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
      <p className="text-muted-foreground mb-8 text-sm">{subtexts[groupType]}</p>
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
          value={state.dietaryNotes}
          onChange={(e) => setState((s: IntakeState) => ({ ...s, dietaryNotes: e.target.value }))}
          rows={2}
          className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          data-testid="input-dietary-notes"
        />
        <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
          We'll make every effort to suggest places that support mainstream needs — gluten-free, vegetarian, vegan, keto, and more. For complex restrictions or severe allergies, we recommend contacting venues ahead of your visit. We can't guarantee a perfect match for every requirement.
        </p>
      </div>
    </div>
  );
}

// ── Family needs ───────────────────────────────────────────────────────────────
const FAMILY_NEEDS_OPTIONS = [
  { value: "stroller-friendly",   label: "Stroller-friendly",    sub: "Flat paths, ramps, easy terrain" },
  { value: "wheelchair-access",   label: "Wheelchair accessible", sub: "Step-free venues & pathways" },
  { value: "kid-friendly-dining", label: "Kid-friendly dining",   sub: "Kid menus, patience included" },
  { value: "hands-on-kids",       label: "Hands-on for kids",     sub: "Interactive museums, science, play" },
  { value: "outdoor-space",       label: "Lots of outdoor space", sub: "Parks, open areas, room to run" },
  { value: "easy-pacing",         label: "Easy pacing",           sub: "Short distances, no marathon walks" },
  { value: "educational",         label: "Educational stops",     sub: "History, science, discovery" },
  { value: "early-finish",        label: "Early day structure",   sub: "Plans that wrap by 7 pm" },
];

function StepFamilyNeeds({ state, setState }: { state: IntakeState; setState: any }) {
  function toggle(value: string) {
    setState((s: IntakeState) => ({
      ...s,
      familyNeeds: s.familyNeeds.includes(value)
        ? s.familyNeeds.filter((v) => v !== value)
        : [...s.familyNeeds, value],
    }));
  }

  return (
    <div>
      <h2 className="font-serif text-4xl font-light text-foreground mb-1 leading-tight">
        What does your family need?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Select anything that matters — Wandr will plan around it.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {FAMILY_NEEDS_OPTIONS.map((opt) => {
          const active = state.familyNeeds.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                active ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
              }`}
              data-testid={`button-family-need-${opt.value}`}
            >
              <div className={`text-sm font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.sub}</div>
            </button>
          );
        })}
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-2 tracking-wide">
          Anything specific? Allergies, nap schedules, must-see spots for the kids…
        </label>
        <textarea
          placeholder={"e.g. Nut allergy · My 4-year-old loves dinosaurs · Need a nap break after lunch"}
          value={typeof state.activityNotes === "string" ? state.activityNotes : ""}
          onChange={(e) => setState((s: IntakeState) => ({ ...s, activityNotes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/70 outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          data-testid="input-family-notes"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Skip if nothing specific applies — Wandr builds family-friendly by default.
      </p>
    </div>
  );
}
