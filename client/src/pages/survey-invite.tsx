import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Copy, Check, Users, ChevronRight,
  Plus, X, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

const SESSION = "x7k9m"; // mock session tied to this trip

function makeToken(name: string, index: number): string {
  // deterministic fake token for prototype
  const seeds = ["a1b2", "c3d4", "e5f6", "g7h8", "i9j0"];
  return seeds[index % seeds.length];
}

function makePersonalLink(name: string, token: string): string {
  return `wandr.app/join/${SESSION}/${token}`;
}

function makePersonalLinkFull(name: string, token: string): string {
  const slug = encodeURIComponent(name.trim());
  return `${window.location.origin}/survey/join?name=${slug}&token=${token}`;
}

interface Wandrer {
  name: string;
  token: string;
  copied: boolean;
}

export default function SurveyInvite() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [companions, setCompanions] = useState<Wandrer[]>([
    { name: "", token: makeToken("", 0), copied: false },
  ]);

  function updateName(index: number, value: string) {
    setCompanions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, name: value } : c))
    );
  }

  function addCompanion() {
    setCompanions((prev) => [
      ...prev,
      { name: "", token: makeToken("", prev.length), copied: false },
    ]);
  }

  function removeCompanion(index: number) {
    setCompanions((prev) => prev.filter((_, i) => i !== index));
  }

  async function copyPersonalLink(index: number) {
    const c = companions[index];
    if (!c.name.trim()) return;
    const url = makePersonalLinkFull(c.name, c.token);
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
        description: `Copy manually: ${makePersonalLink(c.name, c.token)}`,
        variant: "destructive",
      });
    }
  }

  async function copyAllLinks() {
    const filled = companions.filter((c) => c.name.trim());
    if (!filled.length) return;
    const text = filled
      .map((c) => `${c.name}: ${makePersonalLinkFull(c.name, c.token)}`)
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

  const filledCompanions = companions.filter((c) => c.name.trim());
  const hasAnyFilled = filledCompanions.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/itinerary/vancouver-2day")}
          aria-label="Back to itinerary"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Vancouver · Apr 18–19</span>
      </header>

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
            { n: "1", text: "Enter each wandrer's name below — a personal link is generated instantly." },
            { n: "2", text: "Copy and send each person their unique link directly (text, email, DM)." },
            { n: "3", text: "They answer 4 quick questions. Once everyone responds, you generate the group itinerary." },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Companion list with personal links */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your wandrers
            </label>
            {hasAnyFilled && filledCompanions.length > 1 && (
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
              const personalLink = makePersonalLink(companion.name, companion.token);

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

                  {/* Personal link row — only shown when name is filled */}
                  {hasName && (
                    <div className="flex items-center gap-2 px-3 pb-3 border-t border-border/50 pt-2.5">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-xs text-muted-foreground font-mono truncate">
                        {personalLink}
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
            their personal link and answers 4 questions about their travel style. You'll see their
            responses appear on the status page in real time.
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Button
            className="w-full rounded-full gap-2"
            onClick={() => navigate("/survey/status")}
            data-testid="button-track-responses"
          >
            <Users className="w-4 h-4" />
            Track responses
            <ChevronRight className="w-4 h-4" />
          </Button>
          {!hasAnyFilled && (
            <p className="text-center text-xs text-muted-foreground">
              Invite at least one wandrer to generate personal links.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
