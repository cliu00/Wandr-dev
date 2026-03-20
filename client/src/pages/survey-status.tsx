import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Check, Clock, Users, ChevronRight, Sparkles, Heart, Wrench, Loader2 } from "lucide-react";
import { FlowHeader } from "@/components/flow-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Feedback = "love" | "tweaks" | null;

interface Participant {
  id: string;
  name: string;
  responded: boolean;
  joinUrl: string;
}

interface GroupTrip {
  id: string;
  destination: string;
  startDate: string | null;
  durationDays: number;
  organizerName: string;
  status: string;
}

export default function SurveyStatus() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  // groupTripId comes from URL param (set by invite page) or sessionStorage
  const groupTripId = params.get("groupTripId") || sessionStorage.getItem("wandr_group_trip_id") || "";

  const [groupTrip, setGroupTrip] = useState<GroupTrip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [respondedCount, setRespondedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Poll status every 4 seconds
  useEffect(() => {
    if (!groupTripId) return;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/groups/${groupTripId}/status`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setGroupTrip(data.groupTrip);
        setParticipants(data.participants);
        setRespondedCount(data.respondedCount);
        setTotalCount(data.totalCount);
      } catch {
        setLoadError(true);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [groupTripId]);

  const canGenerate = respondedCount >= 1;

  async function handleGenerate() {
    if (!groupTripId || generating) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/groups/${groupTripId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      // Store tripId and navigate to the generating screen to show the animation + poll
      sessionStorage.setItem("wandr_group_pending_trip_id", data.tripId);
      navigate(`/generating?groupTripId=${groupTripId}`);
    } catch {
      setGenerating(false);
    }
  }

  if (!groupTripId || loadError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <h1 className="font-serif text-2xl font-light text-foreground mb-2">Group trip not found</h1>
        <p className="text-muted-foreground text-sm mb-4">The link may have expired or the group trip doesn't exist.</p>
        <Button onClick={() => navigate("/")} className="rounded-full">Go to Wandr</Button>
      </div>
    );
  }

  if (!groupTrip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tripSubtitle = [
    groupTrip.destination,
    groupTrip.durationDays ? `${groupTrip.durationDays} day${groupTrip.durationDays !== 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FlowHeader onBack={() => navigate("/")} />

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Who's in?</h1>
          <p className="text-muted-foreground text-sm">{tripSubtitle}</p>
        </div>

        {/* Participant list */}
        <div className="flex flex-col gap-3 mb-5" aria-label="Participant list">
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground">No participants yet — share the invite links.</p>
          )}
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
              data-testid={`participant-${p.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    p.responded ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="font-medium text-foreground text-sm">{p.name}</div>
              </div>

              <div className="flex items-center gap-2">
                {p.responded ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs bg-primary/15 text-primary border-0"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs text-muted-foreground border-0"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Waiting
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Status banners */}
        {totalCount > 0 && !canGenerate && (
          <div role="status" className="bg-muted/50 rounded-2xl p-4 mb-5 text-sm text-muted-foreground">
            Waiting for at least 1 person to respond before generating the group itinerary.
          </div>
        )}

        {canGenerate && (
          <div role="status" className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-5 text-sm text-primary">
            <strong>Ready to go!</strong> {respondedCount} of {totalCount} {totalCount === 1 ? "person has" : "people have"} shared their preferences. Generate your group itinerary now.
          </div>
        )}

        {/* Generate button */}
        <Button
          className="w-full rounded-full gap-2 mb-4"
          disabled={!canGenerate || generating}
          onClick={handleGenerate}
          data-testid="button-generate"
        >
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting generation…</>
            : <><Sparkles className="w-4 h-4" /> Generate Group Itinerary</>
          }
        </Button>

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mb-8"
          data-testid="button-invite-more"
        >
          Invite more people
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Feedback */}
        <div className="border border-border bg-card rounded-2xl p-5">
          <h2 className="font-medium text-foreground text-sm mb-0.5">
            Does this feel like your kind of trip?
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Your feedback helps us improve.</p>
          <div className="flex gap-2">
            {[
              { key: "love" as const, icon: <Heart className={`w-4 h-4 ${feedback === "love" ? "fill-primary" : ""}`} />, label: "Love it" },
              { key: "tweaks" as const, icon: <Wrench className="w-4 h-4" />, label: "Needs tweaks" },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setFeedback(key)}
                aria-pressed={feedback === key}
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
          {feedback === "love" && (
            <p className="text-xs text-primary mt-3 text-center">Glad to hear it — enjoy the trip!</p>
          )}
          {feedback === "tweaks" && (
            <p className="text-xs text-muted-foreground mt-3 text-center">Got it. Swap individual activities or adjust preferences to fine-tune.</p>
          )}
        </div>
      </main>
    </div>
  );
}
