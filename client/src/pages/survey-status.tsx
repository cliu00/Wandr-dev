import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Clock, Users, ChevronRight, Sparkles, Bell, Zap, Utensils, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_PARTICIPANTS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

type Tab = "itinerary" | "preferences";

export default function SurveyStatus() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("itinerary");
  const [reminded, setReminded] = useState<Set<string>>(new Set());

  const completed = MOCK_PARTICIPANTS.filter((p) => p.status === "completed").length;
  const pending = MOCK_PARTICIPANTS.filter((p) => p.status === "pending");
  const total = MOCK_PARTICIPANTS.length;
  const progressPct = (completed / total) * 100;
  const canGenerate = completed >= 2;

  function sendReminder(id: string, name: string) {
    setReminded((prev) => new Set([...prev, id]));
    toast({
      title: `Reminder sent to ${name}`,
      description: "They'll receive a link to add their preferences.",
    });
  }

  function sendAllReminders() {
    const ids = pending.map((p) => p.id);
    setReminded((prev) => new Set([...prev, ...ids]));
    toast({
      title: `Reminders sent to ${pending.length} people`,
      description: "They'll receive a link to add their preferences.",
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
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Who's in?</h1>
          <p className="text-muted-foreground text-sm">Vancouver · Apr 18–20 · 2 days</p>
        </div>

        {/* Progress Summary */}
        <div className="p-5 rounded-2xl border border-border bg-card mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {completed} of {total} responded
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />

          {pending.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Waiting for {pending.length} {pending.length === 1 ? "person" : "people"} to add their preferences.
            </p>
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

            {/* Batch remind for all pending */}
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

            {/* Status Notes */}
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

            {/* Generate CTA */}
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
              className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              data-testid="button-invite-more"
            >
              Invite more people
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Tab: Group Preferences */}
        {tab === "preferences" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Here's what each person wants — the itinerary reflects the group's shared priorities.
            </p>

            {MOCK_PARTICIPANTS.filter((p) => p.status === "completed" && p.preferences).map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-card p-5"
                data-testid={`preferences-${p.id}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Responded {p.completedAt}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
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
              </div>
            ))}

            {/* Pending members on preferences tab */}
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

            {/* CTA at bottom of preferences tab */}
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
