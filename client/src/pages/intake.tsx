import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Users, User, Heart, PartyPopper, Sun, Moon, Bed, BedDouble, Star, Utensils, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";
import "react-day-picker/dist/style.css";

type DateRange = { from: Date | undefined; to?: Date | undefined };

interface IntakeState {
  destination: string;
  duration: number | null;
  dates: DateRange;
  groupType: "solo" | "partner" | "small" | "big" | null;
  energy: number;
  budget: string | null;
  activityTypes: string[];
  food: string | null;
  wantsRest: boolean | null;
}

const TOTAL_STEPS_SOLO = 8;
const TOTAL_STEPS_GROUP = 7;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

export default function Intake() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const prefillDestination = searchParams.get("destination") || "";
  const isGroupStart = searchParams.get("group") === "true";

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<IntakeState>({
    destination: prefillDestination,
    duration: null,
    dates: { from: undefined, to: undefined },
    groupType: null,
    energy: 50,
    budget: null,
    activityTypes: [],
    food: null,
    wantsRest: null,
  });

  const isSolo = state.groupType === "solo" || state.groupType === null;
  const totalSteps = isSolo ? TOTAL_STEPS_SOLO : TOTAL_STEPS_GROUP;

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 1) {
      navigate("/");
      return;
    }
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function handleSubmit() {
    if (state.groupType !== "solo") {
      navigate("/survey/invite");
    } else {
      navigate("/generating");
    }
  }

  const isLastStep = step === totalSteps;

  function canContinue(): boolean {
    switch (step) {
      case 1: return state.duration !== null;
      case 2: return !!state.dates.from && !!state.dates.to;
      case 3: return state.groupType !== null;
      case 4: return true;
      case 5: return state.budget !== null;
      case 6: return state.activityTypes.length > 0;
      case 7: return state.food !== null;
      case 8: return state.wantsRest !== null;
      default: return false;
    }
  }

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
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
          {prefillDestination && (
            <span className="text-xs text-muted-foreground tracking-wide">
              Planning your {prefillDestination} escape
            </span>
          )}
          <span className="text-sm text-muted-foreground font-medium" data-testid="text-step-counter">
            {step}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col pt-20 pb-28">
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
              {step === 1 && <StepDuration state={state} setState={setState} />}
              {step === 2 && <StepDates state={state} setState={setState} />}
              {step === 3 && <StepGroup state={state} setState={setState} />}
              {step === 4 && <StepEnergy state={state} setState={setState} />}
              {step === 5 && <StepBudget state={state} setState={setState} />}
              {step === 6 && <StepActivities state={state} setState={setState} />}
              {step === 7 && <StepFood state={state} setState={setState} />}
              {step === 8 && isSolo && <StepRest state={state} setState={setState} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/60 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full rounded-full text-base font-medium gap-2"
            disabled={!canContinue()}
            onClick={isLastStep ? handleSubmit : goNext}
            data-testid="button-continue"
          >
            {isLastStep
              ? state.groupType !== "solo"
                ? "Invite My Crew"
                : "Curate My Escape"
              : "Continue"}
            {isLastStep && <span>→</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepDuration({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    { value: 2, label: "2 days" },
    { value: 3, label: "3 days" },
    { value: 4, label: "4 days" },
    { value: 5, label: "4+ days" },
  ];

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">How long is your escape?</h2>
      <p className="text-muted-foreground mb-8">We'll pace your itinerary accordingly.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, duration: opt.value }))}
            className={`p-5 rounded-2xl border-2 text-center font-semibold text-lg transition-all ${
              state.duration === opt.value
                ? "border-primary bg-primary/8 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
            data-testid={`button-duration-${opt.value}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDates({ state, setState }: { state: IntakeState; setState: any }) {
  const today = new Date();

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">When are you travelling?</h2>
      <p className="text-muted-foreground mb-6">We'll make sure everything is timed right.</p>
      <div className="flex justify-center">
        <style>{`
          .rdp-day_selected, .rdp-day_range_start, .rdp-day_range_end {
            background-color: hsl(155 35% 22%) !important;
            color: white !important;
          }
          .rdp-day_range_middle {
            background-color: hsl(155 35% 22% / 0.12) !important;
            color: hsl(155 35% 22%) !important;
          }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: hsl(155 35% 22% / 0.08) !important;
          }
          .rdp {
            --rdp-accent-color: hsl(155 35% 22%);
          }
        `}</style>
        <DayPicker
          mode="range"
          selected={state.dates}
          onSelect={(range) => setState((s: IntakeState) => ({ ...s, dates: range || { from: undefined, to: undefined } }))}
          fromDate={today}
          numberOfMonths={1}
          data-testid="date-picker"
        />
      </div>
      {state.dates.from && state.dates.to && (
        <p className="text-center text-sm text-primary font-medium mt-2">
          {format(state.dates.from, "MMM d")} – {format(state.dates.to, "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
}

function StepGroup({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    { value: "solo", icon: <User className="w-5 h-5" />, label: "Just me", sub: "Solo traveller" },
    { value: "partner", icon: <Heart className="w-5 h-5" />, label: "Me + partner", sub: "Two of us" },
    { value: "small", icon: <Users className="w-5 h-5" />, label: "Small group (3–4)", sub: "Friends or family" },
    { value: "big", icon: <PartyPopper className="w-5 h-5" />, label: "Big group (5+)", sub: "The whole crew" },
  ];

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Who's coming?</h2>
      <p className="text-muted-foreground mb-8">We'll adjust recommendations for your crew.</p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, groupType: opt.value as any }))}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              state.groupType === opt.value
                ? "border-primary bg-primary/8"
                : "border-border bg-card hover:border-primary/40"
            }`}
            data-testid={`button-group-${opt.value}`}
          >
            <span className={`${state.groupType === opt.value ? "text-primary" : "text-muted-foreground"}`}>
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
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">What's your energy this trip?</h2>
      <p className="text-muted-foreground mb-12">From full chill to full throttle.</p>
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
          <span>I need to decompress</span>
          <span>Balanced</span>
          <span>Pack it all in</span>
        </div>
      </div>
      <div className="mt-10 text-center">
        <div className="inline-block px-5 py-2 rounded-full bg-muted text-sm text-foreground font-medium">
          {state.energy < 33 ? "Relaxed pace" : state.energy < 66 ? "Balanced mix" : "Action-packed"}
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

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">What's your daily budget per person?</h2>
      <p className="text-muted-foreground mb-8">So we know what to recommend before you fall in love with a plan.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, budget: opt.value }))}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              state.budget === opt.value
                ? "border-primary bg-primary/8"
                : "border-border bg-card hover:border-primary/40"
            }`}
            data-testid={`button-budget-${opt.value}`}
          >
            <div className="font-semibold text-foreground text-lg">{opt.label}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepActivities({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    "Hidden gems",
    "Iconic landmarks",
    "Street art & murals",
    "Markets & shopping",
    "Nature & parks",
    "Nightlife",
    "Wellness & spas",
    "Architecture",
  ];

  function toggle(opt: string) {
    setState((s: IntakeState) => ({
      ...s,
      activityTypes: s.activityTypes.includes(opt)
        ? s.activityTypes.filter((a) => a !== opt)
        : [...s.activityTypes, opt],
    }));
  }

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">What kind of finds do you want?</h2>
      <p className="text-muted-foreground mb-8">Pick all that excite you.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = state.activityTypes.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`p-4 rounded-2xl border-2 text-sm font-medium text-center transition-all ${
                active
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
              data-testid={`button-activity-${opt.toLowerCase().replace(/[^a-z]/g, "-")}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepFood({ state, setState }: { state: IntakeState; setState: any }) {
  const options = [
    {
      value: "food-is-trip",
      icon: <Utensils className="w-5 h-5" />,
      label: "Food IS the trip",
      sub: "Plan meals first, build the day around them",
    },
    {
      value: "great-meals",
      icon: <Star className="w-5 h-5" />,
      label: "Great meals, won't rearrange for them",
      sub: "Quality matters, but so does flexibility",
    },
    {
      value: "just-fed",
      icon: <Timer className="w-5 h-5" />,
      label: "Just keep me fed",
      sub: "Quick, easy, then on to activities",
    },
  ];

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">How do you feel about food?</h2>
      <p className="text-muted-foreground mb-8">Helps us prioritise your days right.</p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setState((s: IntakeState) => ({ ...s, food: opt.value }))}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              state.food === opt.value
                ? "border-primary bg-primary/8"
                : "border-border bg-card hover:border-primary/40"
            }`}
            data-testid={`button-food-${opt.value}`}
          >
            <span className={`flex-shrink-0 ${state.food === opt.value ? "text-primary" : "text-muted-foreground"}`}>
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

function StepRest({ state, setState }: { state: IntakeState; setState: any }) {
  return (
    <div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Would you like built-in downtime?</h2>
      <p className="text-muted-foreground mb-8">We can schedule a rest block each afternoon so you arrive at dinner restored.</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setState((s: IntakeState) => ({ ...s, wantsRest: true }))}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            state.wantsRest === true
              ? "border-primary bg-primary/8"
              : "border-border bg-card hover:border-primary/40"
          }`}
          data-testid="button-rest-yes"
        >
          <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="font-semibold text-foreground">Yes please</div>
          <div className="text-sm text-muted-foreground mt-1">Include rest blocks</div>
        </button>
        <button
          onClick={() => setState((s: IntakeState) => ({ ...s, wantsRest: false }))}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            state.wantsRest === false
              ? "border-primary bg-primary/8"
              : "border-border bg-card hover:border-primary/40"
          }`}
          data-testid="button-rest-no"
        >
          <Sun className="w-6 h-6 mx-auto mb-2 text-accent" />
          <div className="font-semibold text-foreground">Pack my schedule</div>
          <div className="text-sm text-muted-foreground mt-1">I'll sleep when I'm home</div>
        </button>
      </div>
    </div>
  );
}
