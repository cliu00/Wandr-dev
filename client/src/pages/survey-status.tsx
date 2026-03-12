import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Clock, Users, ChevronRight, Sparkles, Bell, Heart, Wrench, RefreshCw, Sun, Sunset, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PARTICIPANTS, MOCK_ITINERARY } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

type Tab = "itinerary" | "preferences";
type Feedback = "love" | "tweaks" | "startover" | null;

const PERSON_COLORS: Record<string, string> = {
  Alice: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  Bob: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  Charlie: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const TIME_LABEL: Record<string, { label: string; icon: JSX.Element }> = {
  morning: { label: "Morning", icon: <Sun className="w-3 h-3" /> },
  afternoon: { label: "Afternoon", icon: <Sunset className="w-3 h-3" /> },
  evening: { label: "Evening", icon: <Moon className="w-3 h-3" /> },
  rest: { label: "Rest", icon: <Moon className="w-3 h-3" /> },
};

const BALANCE_INSIGHTS = [
  {
    emoji: "💰",
    title: "Budget range varies",
    desc: "Alice prefers occasional splurges; Bob keeps it moderate. We've mixed great-value spots with a treat-yourself pick.",
  },
  {
    emoji: "⚡",
    title: "Energy levels differ",
    desc: "Different paces in the group — rest blocks keep the itinerary comfortable without slowing anyone down.",
  },
  {
    emoji: "🍽️",
    title: "Evening consensus",
    desc: "Everyone aligns on food-focused evenings. We've leaned into memorable dinners and cocktail bars.",
  },
];

const MATCH_COUNTS: Record<string, { matched: number; total: number }> = {
  alice: { matched: 4, total: 5 },
  bob: { matched: 3, total: 5 },
  charlie: { matched: 4, total: 5 },
};

export default function SurveyStatus() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("itinerary");
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);

  const completed = MOCK_PARTICIPANTS.filter((p) => p.status === "completed").length;
  const pending = MOCK_PARTICIPANTS.filter((p) => p.status === "pending");
  const total = MOCK_PARTICIPANTS.length;
  const canGenerate = completed >= 2;

  const activityRows = MOCK_ITINERARY.days.flatMap((day) =>
    day.blocks
      .filter((b) => b.groupAttribution.length > 0)
      .map((b) => ({
        dayLabel: `Day ${day.dayNumber}`,
        timeSlot: b.timeSlot,
        name: b.primary.name,
        attribution: b.groupAttribution,
      }))
  );

  function sendReminder(id: string, name: string) {
    setReminded((prev) => new Set([...prev, id]));
    toast({
      title: `Reminder sent to ${name}`,
      description: "They'll receive a personal link to add their preferences.",
    });
  }

  function sendAllReminders() {
    const ids = pending.map((p) => p.id);
    setReminded((prev) => new Set([...prev, ...ids]));
    toast({
      title: `Reminders sent to ${pending.length} people`,
      description: "They'll receive a personal link to add their preferences.",
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/survey/invite")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Vancouver Group Trip</span>
        <div className="w-9" />
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Who's in?</h1>
          <p className="text-muted-foreground text-sm">Vancouver · Apr 18–20 · 2 days</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => setTab("itinerary")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "itinerary"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-itinerary"
          >
            Itinerary
          </button>
          <button
            onClick={() => setTab("preferences")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "preferences"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-preferences"
          >
            Group Preferences
          </button>
        </div>

        {/* Tab: Itinerary */}
        {tab === "itinerary" && (
          <>
            <div className="flex flex-col gap-3 mb-5">
              {MOCK_PARTICIPANTS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
                  data-testid={`participant-${p.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
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
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs text-muted-foreground border-0"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting
                        </Badge>
                        <button
                          onClick={() => sendReminder(p.id, p.name)}
                          disabled={reminded.has(p.id)}
                          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                            reminded.has(p.id)
                              ? "border-border text-muted-foreground cursor-default"
                              : "border-primary/40 text-primary hover:bg-primary/5"
                          }`}
                          data-testid={`button-remind-${p.id}`}
                        >
                          <Bell className="w-3 h-3" />
                          {reminded.has(p.id) ? "Sent" : "Remind"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pending.length > 1 && (
              <button
                onClick={sendAllReminders}
                className="w-full text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl py-3 transition-colors mb-5 flex items-center justify-center gap-2"
                data-testid="button-remind-all"
              >
                <Bell className="w-3.5 h-3.5" />
                Send reminders to everyone pending
              </button>
            )}

            {!canGenerate && (
              <div className="bg-muted/50 rounded-2xl p-4 mb-5 text-sm text-muted-foreground">
                Waiting for at least 2 people before generating. Remind anyone who hasn't responded yet.
              </div>
            )}

            {canGenerate && (
              <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-5 text-sm text-primary">
                <strong>Ready to go!</strong> {completed} people have shared their preferences. Generate your group itinerary now.
              </div>
            )}

            <Button
              className="w-full rounded-full gap-2 mb-4"
              disabled={!canGenerate}
              onClick={() => navigate("/generating")}
              data-testid="button-generate"
            >
              <Sparkles className="w-4 h-4" />
              Generate Group Itinerary
            </Button>

            <button
              onClick={() => navigate("/survey/invite")}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mb-8"
              data-testid="button-invite-more"
            >
              Invite more people
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Feedback */}
            <div className="border border-border rounded-2xl p-5">
              <h3 className="font-medium text-foreground text-sm mb-0.5">
                Does this feel like your kind of trip?
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Your feedback helps us improve.</p>
              <div className="flex gap-2">
                {[
                  { key: "love" as const, icon: <Heart className={`w-4 h-4 ${feedback === "love" ? "fill-primary" : ""}`} />, label: "Love it" },
                  { key: "tweaks" as const, icon: <Wrench className="w-4 h-4" />, label: "Needs tweaks" },
                  { key: "startover" as const, icon: <RefreshCw className="w-4 h-4" />, label: "Start over" },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setFeedback(key)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
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
              {feedback === "love" && <p className="text-xs text-primary mt-3 text-center">Glad to hear it — enjoy the trip!</p>}
              {feedback === "tweaks" && <p className="text-xs text-muted-foreground mt-3 text-center">Got it. Swap individual activities or adjust preferences to fine-tune.</p>}
              {feedback === "startover" && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  No problem.{" "}
                  <button onClick={() => navigate("/")} className="underline hover:text-foreground transition-colors" data-testid="button-startover-confirm">
                    Start fresh →
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Tab: Group Preferences */}
        {tab === "preferences" && (
          <div className="flex flex-col gap-8">

            {/* How we balanced it — Image 2 style */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">How we balanced it</h2>
              <div className="flex flex-col gap-2.5">
                {BALANCE_INSIGHTS.map((insight) => (
                  <div
                    key={insight.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40"
                  >
                    <span className="text-xl leading-none mt-0.5 flex-shrink-0">{insight.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-0.5">{insight.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who each pick satisfies — Image 1 style */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Who each pick satisfies</h2>
              <div className="flex flex-col gap-2">
                {activityRows.map((row, i) => {
                  const time = TIME_LABEL[row.timeSlot] ?? TIME_LABEL.morning;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-muted/40"
                      data-testid={`attribution-row-${i}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-muted-foreground flex-shrink-0">{time.icon}</span>
                        <div className="min-w-0">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                            {row.dayLabel} {time.label}
                          </div>
                          <div className="text-sm font-medium text-foreground truncate">{row.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
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
            </div>

            {/* Individual preference cards — airy grid */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-4">Individual preferences</h2>
              <div className="flex flex-col gap-8">
                {MOCK_PARTICIPANTS.filter((p) => p.status === "completed" && p.preferences).map((p) => {
                  const match = MATCH_COUNTS[p.id] ?? { matched: 3, total: 5 };
                  return (
                    <div key={p.id} data-testid={`preferences-${p.id}`}>
                      {/* Person header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">Responded {p.completedAt}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">{match.matched}/{match.total}</div>
                          <div className="text-[10px] text-muted-foreground leading-tight">picks<br/>included</div>
                        </div>
                      </div>

                      {/* Stat grid */}
                      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                        <div className="bg-muted/40 rounded-2xl p-4">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Energy</div>
                          <div className="text-sm font-medium text-foreground leading-snug">{p.preferences!.energy}</div>
                        </div>
                        <div className="bg-muted/40 rounded-2xl p-4">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Budget</div>
                          <div className="text-sm font-medium text-foreground leading-snug">{p.preferences!.budget}<span className="text-muted-foreground font-normal"> /day</span></div>
                        </div>
                        <div className="bg-muted/40 rounded-2xl p-4 col-span-2">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Food & Drink</div>
                          <div className="text-sm font-medium text-foreground leading-snug">{p.preferences!.food}</div>
                        </div>
                      </div>

                      {/* Activity tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {p.preferences!.activities.map((act) => (
                          <span
                            key={act}
                            className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Pending */}
                {MOCK_PARTICIPANTS.filter((p) => p.status === "pending").map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-4 border-t border-dashed border-border"
                    data-testid={`preferences-pending-${p.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">Hasn't responded yet</div>
                      </div>
                    </div>
                    <button
                      onClick={() => sendReminder(p.id, p.name)}
                      disabled={reminded.has(p.id)}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                        reminded.has(p.id)
                          ? "border-border text-muted-foreground cursor-default"
                          : "border-primary/40 text-primary hover:bg-primary/5"
                      }`}
                      data-testid={`button-remind-pref-${p.id}`}
                    >
                      <Bell className="w-3 h-3" />
                      {reminded.has(p.id) ? "Sent" : "Remind"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full rounded-full gap-2"
              disabled={!canGenerate}
              onClick={() => navigate("/generating")}
              data-testid="button-generate-from-prefs"
            >
              <Sparkles className="w-4 h-4" />
              Generate Group Itinerary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
