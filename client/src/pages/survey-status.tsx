import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Clock, Users, ChevronRight, Sparkles, Bell, Zap, Utensils, DollarSign, Heart, Wrench, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PARTICIPANTS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

type Tab = "itinerary" | "preferences";
type Feedback = "love" | "tweaks" | "startover" | null;

const MATCH_COUNTS: Record<string, { matched: number; total: number }> = {
  alice: { matched: 4, total: 5 },
  bob: { matched: 3, total: 5 },
  carol: { matched: 4, total: 5 },
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
      {/* Header */}
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
        {/* Heading */}
        <div className="mb-5">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Who's in?</h1>
          <p className="text-muted-foreground text-sm">Vancouver · Apr 18–20 · 2 days</p>
        </div>

        {/* Group planning explainer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/6 border border-primary/15 mb-5">
          <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">Traveling with others?</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share a link so everyone adds their preferences. We'll blend them automatically — no compromises, just a smarter mix.
            </p>
          </div>
        </div>

        {/* Response count — no progress bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {completed} of {total} responded
            </span>
          </div>
          {pending.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Waiting on {pending.length} {pending.length === 1 ? "person" : "people"}
            </span>
          )}
          {pending.length === 0 && (
            <Badge className="rounded-full text-xs bg-primary/15 text-primary border-0">
              Everyone's in
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
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
            {/* Participant List */}
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

            {/* Batch remind */}
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

            {/* Feedback section */}
            <div className="border border-border rounded-2xl p-5">
              <h3 className="font-medium text-foreground text-sm mb-0.5">
                Does this feel like your kind of trip?
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Your feedback helps us improve.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedback("love")}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                    feedback === "love"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border text-foreground hover:border-primary/30"
                  }`}
                  data-testid="button-feedback-love"
                >
                  <Heart className={`w-4 h-4 ${feedback === "love" ? "fill-primary" : ""}`} />
                  Love it
                </button>
                <button
                  onClick={() => setFeedback("tweaks")}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                    feedback === "tweaks"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border text-foreground hover:border-primary/30"
                  }`}
                  data-testid="button-feedback-tweaks"
                >
                  <Wrench className="w-4 h-4" />
                  Needs tweaks
                </button>
                <button
                  onClick={() => setFeedback("startover")}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                    feedback === "startover"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border text-foreground hover:border-primary/30"
                  }`}
                  data-testid="button-feedback-startover"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start over
                </button>
              </div>
              {feedback === "love" && (
                <p className="text-xs text-primary mt-3 text-center">
                  Glad to hear it — enjoy the trip!
                </p>
              )}
              {feedback === "tweaks" && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Got it. Swap individual activities or adjust preferences to fine-tune.
                </p>
              )}
              {feedback === "startover" && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  No problem.{" "}
                  <button
                    onClick={() => navigate("/")}
                    className="underline hover:text-foreground transition-colors"
                    data-testid="button-startover-confirm"
                  >
                    Start fresh →
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Tab: Group Preferences */}
        {tab === "preferences" && (
          <div className="flex flex-col gap-4">
            {/* How we balanced it */}
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  How we balanced it
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Where preferences overlapped, we went deeper. Where they differed, we alternated picks so each person gets their top priority. No one got everything — but everyone got what matters most.
              </p>
            </div>

            {MOCK_PARTICIPANTS.filter((p) => p.status === "completed" && p.preferences).map((p) => {
              const match = MATCH_COUNTS[p.id] ?? { matched: 3, total: 5 };
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-5"
                  data-testid={`preferences-${p.id}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">Responded {p.completedAt}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-primary">{match.matched}/{match.total}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">top picks<br/>included</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mb-3">
                    <div className="flex items-start gap-2.5 text-sm">
                      <Zap className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{p.preferences!.energy}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{p.preferences!.budget} / day</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <Utensils className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{p.preferences!.food}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.preferences!.activities.map((act) => (
                        <span
                          key={act}
                          className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{match.matched} of their picks</span> made the final itinerary.
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Pending members */}
            {MOCK_PARTICIPANTS.filter((p) => p.status === "pending").map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-dashed border-border bg-card/50 p-5 flex items-center justify-between"
                data-testid={`preferences-pending-${p.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
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

            <Button
              className="w-full rounded-full gap-2 mt-2"
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
