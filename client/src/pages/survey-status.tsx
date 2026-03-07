import { useLocation } from "wouter";
import { ArrowLeft, Check, Clock, Users, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_PARTICIPANTS } from "@/lib/mock-data";

export default function SurveyStatus() {
  const [, navigate] = useLocation();
  const completed = MOCK_PARTICIPANTS.filter((p) => p.status === "completed").length;
  const total = MOCK_PARTICIPANTS.length;
  const progressPct = (completed / total) * 100;
  const canGenerate = completed >= 2;

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
        <span className="text-sm font-medium text-muted-foreground">London Group Trip</span>
        <div className="w-9" />
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Who's in?</h1>
          <p className="text-muted-foreground">London · Apr 18–20 · 2 days</p>
        </div>

        {/* Progress Summary */}
        <div className="p-5 rounded-2xl border border-border bg-card mb-6">
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
        </div>

        {/* Participant List */}
        <div className="flex flex-col gap-3 mb-8">
          {MOCK_PARTICIPANTS.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
              data-testid={`participant-${p.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  p.status === "completed"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
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
                    <Badge variant="secondary" className="rounded-full text-xs bg-primary/15 text-primary border-0">
                      <Check className="w-3 h-3 mr-1" />
                      Done
                    </Badge>
                  </>
                ) : (
                  <Badge variant="secondary" className="rounded-full text-xs text-muted-foreground border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Waiting...
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info note for pending */}
        {!canGenerate && (
          <div className="bg-muted/50 rounded-2xl p-4 mb-6 text-sm text-muted-foreground">
            Waiting for at least 2 people to respond before generating. You can generate once more people are in.
          </div>
        )}

        {canGenerate && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-6 text-sm text-primary">
            <strong>Ready to go!</strong> {completed} people have shared their preferences. Generate your itinerary now.
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

        {/* Invite More */}
        <button
          onClick={() => navigate("/survey/invite")}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          data-testid="button-invite-more"
        >
          Invite more people
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
