import { useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Star, Utensils, Timer, Users } from "lucide-react";

type JoinStep = "identity" | "energy" | "budget" | "activities" | "food" | "done";

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

export default function SurveyJoin() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<JoinStep>("identity");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [energy, setEnergy] = useState(50);
  const [budget, setBudget] = useState<string | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [food, setFood] = useState<string | null>(null);

  const STEPS: JoinStep[] = ["identity", "energy", "budget", "activities", "food", "done"];
  const currentIndex = STEPS.indexOf(step);
  const progress = (currentIndex / (STEPS.length - 1)) * 100;

  function goNext() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx === 0) {
      window.history.back();
      return;
    }
    setStep(STEPS[idx - 1]);
  }

  function canContinue() {
    if (step === "identity") return name.trim().length > 0;
    if (step === "budget") return budget !== null;
    if (step === "activities") return activities.length > 0;
    if (step === "food") return food !== null;
    return true;
  }

  if (step === "done") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative px-6"
      >
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
              The organiser will generate the final itinerary once everyone responds. We'll notify you when it's ready.
            </p>
          </div>

          {/* Two clear next actions — not a dead end */}
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
              Back to 48HRS
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
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
            <span>Vancouver Group Trip · Apr 18–20</span>
          </div>
          <div />
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-20 pb-28">
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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

              {step === "energy" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">
                    What's your energy for this trip, {name}?
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
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === "food" && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">How do you feel about food?</h2>
                  <p className="text-muted-foreground mb-8">
                    Helps calibrate the group's dining priorities.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        value: "food-is-trip",
                        icon: <Utensils className="w-5 h-5" />,
                        label: "Food IS the trip",
                        sub: "Plan meals first, build the day around them",
                      },
                      {
                        value: "great-meals",
                        icon: <Star className="w-5 h-5" />,
                        label: "Great meals, won't rearrange",
                        sub: "Quality matters, but so does flexibility",
                      },
                      {
                        value: "just-fed",
                        icon: <Timer className="w-5 h-5" />,
                        label: "Just keep me fed",
                        sub: "Quick, easy, then on to activities",
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
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/60 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full rounded-full"
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
