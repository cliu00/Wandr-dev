import { useState } from "react";
import { useLocation } from "wouter";
import { Check, Clock, Users, ChevronRight, Sparkles, Heart, Wrench, Sun, Sunset, Moon } from "lucide-react";
import { FlowHeader } from "@/components/flow-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PARTICIPANTS, MOCK_ITINERARY } from "@/lib/mock-data";


type Tab = "itinerary" | "preferences";
type Feedback = "love" | "tweaks" | null;

const PERSON_COLORS: Record<string, string> = {
  Alice: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  Bob: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  Charlie: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const TIME_LABEL: Record<string, { label: string; icon: JSX.Element }> = {
  morning:   { label: "Morning",   icon: <Sun    className="w-3 h-3" aria-hidden="true" /> },
  afternoon: { label: "Afternoon", icon: <Sunset className="w-3 h-3" aria-hidden="true" /> },
  evening:   { label: "Evening",   icon: <Moon   className="w-3 h-3" aria-hidden="true" /> },
  rest:      { label: "Rest",      icon: <Moon   className="w-3 h-3" aria-hidden="true" /> },
};

const BALANCE_INSIGHTS = [
  {
    icon: "💰",
    iconLabel: "Budget",
    title: "Budget range varies",
    desc: "Alice prefers occasional splurges; Bob keeps it moderate. We've mixed great-value spots with a treat-yourself pick.",
  },
  {
    icon: "⚡",
    iconLabel: "Energy",
    title: "Energy levels differ",
    desc: "Different paces in the group — rest blocks keep the itinerary comfortable without slowing anyone down.",
  },
  {
    icon: "🍽️",
    iconLabel: "Food",
    title: "Evening consensus",
    desc: "Everyone aligns on food-focused evenings. We've leaned into memorable dinners and cocktail bars.",
  },
];


export default function SurveyStatus() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("itinerary");
  const [feedback, setFeedback] = useState<Feedback>(null);

  const completed = MOCK_PARTICIPANTS.filter((p) => p.status === "completed").length;
  const pending    = MOCK_PARTICIPANTS.filter((p) => p.status === "pending");
  const total      = MOCK_PARTICIPANTS.length;
  const canGenerate = completed >= 2;

  const activityRows = MOCK_ITINERARY.days.flatMap((day) =>
    day.blocks
      .filter((b) => b.groupAttribution.length > 0)
      .map((b) => ({
        dayLabel:    `Day ${day.dayNumber}`,
        timeSlot:    b.timeSlot,
        name:        b.primary.name,
        attribution: b.groupAttribution,
      }))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FlowHeader onBack={() => navigate("/survey/invite")} />

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Who's in?</h1>
          <p className="text-muted-foreground text-sm">Vancouver · Apr 18–20 · 2 days</p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Trip sections"
          className="flex gap-1 p-1 bg-muted rounded-xl mb-6"
        >
          {(["itinerary", "preferences"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`tabpanel-${t}`}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${t}`}
            >
              {t === "itinerary" ? "Itinerary" : "Group Preferences"}
            </button>
          ))}
        </div>

        {/* Tab: Itinerary */}
        <div
          role="tabpanel"
          id="tabpanel-itinerary"
          aria-labelledby="tab-itinerary"
          hidden={tab !== "itinerary"}
        >
          {tab === "itinerary" && (
            <>
              <div className="flex flex-col gap-3 mb-5" aria-label="Participant list">
                {MOCK_PARTICIPANTS.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
                    data-testid={`participant-${p.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                          p.status === "completed"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{p.name}</div>
                        {p.email && (
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.status === "completed" ? (
                        <>
                          <span className="text-xs text-muted-foreground">{p.completedAt}</span>
                          <Badge
                            variant="secondary"
                            className="rounded-full text-xs bg-primary/15 text-primary border-0"
                            aria-label={`${p.name} has completed the survey`}
                          >
                            <Check className="w-3 h-3 mr-1" aria-hidden="true" />
                            Done
                          </Badge>
                        </>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs text-muted-foreground border-0"
                          aria-label={`${p.name} hasn't responded yet`}
                        >
                          <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                          Waiting
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!canGenerate && (
                <div role="status" className="bg-muted/50 rounded-2xl p-4 mb-5 text-sm text-muted-foreground">
                  Waiting for at least 2 people to respond before generating the group itinerary.
                </div>
              )}

              {canGenerate && (
                <div role="status" className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-5 text-sm text-primary">
                  <strong>Ready to go!</strong> {completed} people have shared their preferences. Generate your group itinerary now.
                </div>
              )}

              <Button
                className="w-full rounded-full gap-2 mb-4"
                disabled={!canGenerate}
                onClick={() => navigate("/generating")}
                data-testid="button-generate"
                aria-disabled={!canGenerate}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Generate Group Itinerary
              </Button>

              <button
                onClick={() => navigate("/survey/invite")}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                data-testid="button-invite-more"
              >
                Invite more people
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              {/* Feedback */}
              <div className="border border-border bg-card rounded-2xl p-5">
                <h2 className="font-medium text-foreground text-sm mb-0.5">
                  Does this feel like your kind of trip?
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Your feedback helps us improve.</p>
                <div className="flex gap-2" role="group" aria-label="Trip feedback">
                  {[
                    { key: "love"   as const, icon: <Heart  className={`w-4 h-4 ${feedback === "love" ? "fill-primary" : ""}`} aria-hidden="true" />, label: "Love it" },
                    { key: "tweaks" as const, icon: <Wrench className="w-4 h-4" aria-hidden="true" />, label: "Needs tweaks" },
                  ].map(({ key, icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setFeedback(key)}
                      aria-pressed={feedback === key}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        feedback === key
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border text-foreground hover:border-primary/30"
                      }`}
                      data-testid={`button-feedback-${key}`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
                {feedback === "love" && (
                  <p role="status" className="text-xs text-primary mt-3 text-center">Glad to hear it — enjoy the trip!</p>
                )}
                {feedback === "tweaks" && (
                  <p role="status" className="text-xs text-muted-foreground mt-3 text-center">Got it. Swap individual activities or adjust preferences to fine-tune.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tab: Group Preferences */}
        <div
          role="tabpanel"
          id="tabpanel-preferences"
          aria-labelledby="tab-preferences"
          hidden={tab !== "preferences"}
        >
          {tab === "preferences" && (
            <div className="flex flex-col gap-8">

              {/* How we balanced it */}
              <section aria-labelledby="section-balance">
                <h2 id="section-balance" className="font-serif text-2xl font-light text-foreground mb-4">How we balanced it</h2>
                <div className="flex flex-col gap-2.5">
                  {BALANCE_INSIGHTS.map((insight) => (
                    <div
                      key={insight.title}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card"
                    >
                      <span className="text-xl leading-none mt-0.5 flex-shrink-0" role="img" aria-label={insight.iconLabel}>
                        {insight.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-0.5">{insight.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Who each pick satisfies */}
              <section aria-labelledby="section-picks">
                <h2 id="section-picks" className="font-serif text-2xl font-light text-foreground mb-4">Who each pick satisfies</h2>
                <div className="flex flex-col gap-2">
                  {activityRows.map((row, i) => {
                    const time = TIME_LABEL[row.timeSlot] ?? TIME_LABEL.morning;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-border bg-card"
                        data-testid={`attribution-row-${i}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-muted-foreground flex-shrink-0" aria-hidden="true">
                            {time.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                              {row.dayLabel} · {time.label}
                            </div>
                            <div className="text-sm font-medium text-foreground truncate">{row.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0" aria-label={`Satisfies: ${row.attribution.join(", ")}`}>
                          {row.attribution.map((name) => (
                            <span
                              key={name}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${PERSON_COLORS[name] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <Button
                className="w-full rounded-full gap-2"
                disabled={!canGenerate}
                onClick={() => navigate("/generating")}
                data-testid="button-generate-from-prefs"
                aria-disabled={!canGenerate}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Generate Group Itinerary
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
