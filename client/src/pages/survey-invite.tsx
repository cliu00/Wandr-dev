import { useState } from "react";
import { useLocation } from "wouter";
import { FlowHeader } from "@/components/flow-header";
import {
  Copy, Check, Users, ChevronRight,
  Plus, X, Link2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

interface Companion {
  name: string;
  token: string | null;  // null until API returns a real token
  joinUrl: string | null;
  copied: boolean;
}

function displayLink(joinUrl: string | null, name: string): string {
  if (joinUrl) return `${window.location.origin}${joinUrl}`;
  return name.trim() ? `wandr.app/join/…` : "";
}

export default function SurveyInvite() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [companions, setCompanions] = useState<Companion[]>([
    { name: "", token: null, joinUrl: null, copied: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const groupTripId = sessionStorage.getItem("wandr_group_trip_id");

  function updateName(index: number, value: string) {
    setCompanions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, name: value, token: null, joinUrl: null } : c))
    );
  }

  function addCompanion() {
    setCompanions((prev) => [
      ...prev,
      { name: "", token: null, joinUrl: null, copied: false },
    ]);
  }

  function removeCompanion(index: number) {
    setCompanions((prev) => prev.filter((_, i) => i !== index));
  }

  async function copyPersonalLink(index: number) {
    const c = companions[index];
    if (!c.joinUrl) return;
    const url = `${window.location.origin}${c.joinUrl}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCompanions((prev) =>
        prev.map((x, i) => (i === index ? { ...x, copied: true } : x))
      );
      setTimeout(() => {
        setCompanions((prev) =>
          prev.map((x, i) => (i === index ? { ...x, copied: false } : x))
        );
      }, 2500);
      toast({
        title: `Link copied for ${c.name}`,
        description: "Send it directly to them — the survey will greet them by name.",
      });
    } else {
      toast({
        title: "Couldn't copy automatically",
        description: `Copy manually: ${url}`,
        variant: "destructive",
      });
    }
  }

  async function copyAllLinks() {
    const filled = companions.filter((c) => c.joinUrl);
    if (!filled.length) return;
    const text = filled
      .map((c) => `${c.name}: ${window.location.origin}${c.joinUrl}`)
      .join("\n");
    const ok = await copyToClipboard(text);
    toast({
      title: ok ? "All links copied" : "Copy failed",
      description: ok
        ? `${filled.length} personal links copied — paste into a message.`
        : "Try copying individual links instead.",
      variant: ok ? "default" : "destructive",
    });
  }

  async function handleTrackResponses() {
    if (!groupTripId) {
      toast({ title: "Session expired", description: "Please start over.", variant: "destructive" });
      navigate("/intake");
      return;
    }

    const filledNames = companions.map((c) => c.name.trim()).filter(Boolean);
    if (!filledNames.length) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupTripId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: filledNames }),
      });

      if (!res.ok) throw new Error("Failed to create participants");
      const data = await res.json();

      // Update companions with real tokens and join URLs from the API
      setCompanions((prev) => {
        let apiIndex = 0;
        return prev.map((c) => {
          if (!c.name.trim()) return c;
          const participant = data.participants[apiIndex++];
          return participant
            ? { ...c, token: participant.token, joinUrl: participant.joinUrl }
            : c;
        });
      });

      navigate(`/survey/status?groupTripId=${groupTripId}`);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Couldn't generate invite links. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const filledCompanions = companions.filter((c) => c.name.trim());
  const hasAnyFilled = filledCompanions.length > 0;
  const linksReady = companions.some((c) => c.joinUrl !== null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FlowHeader onBack={() => navigate("/")} />

      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Title */}
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground mb-2 leading-tight">
            Invite your wandrers
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each wandrer gets their own personal link. When they open it, the survey already knows
            who they are — no name entry needed. Wandr blends everyone's preferences automatically.
          </p>
        </div>

        {/* How it works */}
        <div className="flex flex-col gap-2">
          {[
            { n: "1", text: "Enter each wandrer's name below." },
            { n: "2", text: "Click \"Track responses\" — personal links are generated instantly." },
            { n: "3", text: "Copy and send each link. Once everyone responds, generate the group itinerary." },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Companion list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your wandrers
            </label>
            {linksReady && filledCompanions.length > 1 && (
              <button
                onClick={copyAllLinks}
                className="text-xs text-primary hover:text-primary/70 transition-colors font-medium"
                data-testid="button-copy-all"
              >
                Copy all links
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {companions.map((companion, i) => {
              const hasName = companion.name.trim().length > 0;
              const linkText = displayLink(companion.joinUrl, companion.name);

              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-colors ${
                    hasName ? "border-border bg-card" : "border-dashed border-border bg-transparent"
                  }`}
                  data-testid={`companion-row-${i}`}
                >
                  {/* Name input row */}
                  <div className="flex items-center gap-2 p-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground flex-shrink-0">
                      {hasName ? companion.name.trim()[0].toUpperCase() : (i + 1)}
                    </div>
                    <input
                      type="text"
                      value={companion.name}
                      onChange={(e) => updateName(i, e.target.value)}
                      placeholder={`Wandrer ${i + 1} name`}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                      data-testid={`input-name-${i}`}
                    />
                    {companions.length > 1 && (
                      <button
                        onClick={() => removeCompanion(i)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
                        data-testid={`button-remove-${i}`}
                        aria-label="Remove wandrer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Personal link row — shown once links have been generated */}
                  {companion.joinUrl && (
                    <div className="flex items-center gap-2 px-3 pb-3 border-t border-border/50 pt-2.5">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-xs text-muted-foreground font-mono truncate">
                        {linkText}
                      </span>
                      <button
                        onClick={() => copyPersonalLink(i)}
                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all flex-shrink-0 ${
                          companion.copied
                            ? "border-primary/30 bg-primary/8 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                        data-testid={`button-copy-${i}`}
                      >
                        {companion.copied
                          ? <><Check className="w-3 h-3" /> Copied</>
                          : <><Copy className="w-3 h-3" /> Copy</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add person */}
          <button
            onClick={addCompanion}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-3"
            data-testid="button-add-person"
          >
            <Plus className="w-4 h-4" />
            Invite another wandrer
          </button>
        </div>

        {/* What happens next */}
        {hasAnyFilled && (
          <div className="bg-muted/50 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">What happens next:</span> each person opens
            their personal link and answers 5 questions about their travel style. You'll see their
            responses appear on the status page in real time.
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Button
            className="w-full rounded-full gap-2"
            disabled={!hasAnyFilled || submitting}
            onClick={handleTrackResponses}
            data-testid="button-track-responses"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating links…</>
              : <><Users className="w-4 h-4" /> Track responses <ChevronRight className="w-4 h-4" /></>
            }
          </Button>
          {!hasAnyFilled && (
            <p className="text-center text-xs text-muted-foreground">
              Invite at least one wandrer to continue.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
