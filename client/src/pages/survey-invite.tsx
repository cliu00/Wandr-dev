import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Copy, Check, Users, ChevronRight,
  Plus, X, Link2, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

const FAKE_LINK = "wandr.app/join/vancouver-x7k9m";
const FAKE_LINK_FULL = "https://wandr.app/join/vancouver-x7k9m";

export default function SurveyInvite() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [names, setNames] = useState<string[]>([""]);

  async function handleCopyLink() {
    const ok = await copyToClipboard(FAKE_LINK_FULL);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast({ title: "Link copied!", description: "Send it to your companions — they'll each fill in their preferences." });
    } else {
      toast({
        title: "Couldn't copy automatically",
        description: `Copy manually: ${FAKE_LINK}`,
        variant: "destructive",
      });
    }
  }

  function updateName(index: number, value: string) {
    setNames((n) => n.map((x, i) => (i === index ? value : x)));
  }

  const filledNames = names.filter(Boolean);

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
            Invite companions to co-plan
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Share a link with your group. Each person answers 4 quick questions about their preferences.
            Wandr blends everyone's input and updates the itinerary automatically — no back-and-forth needed.
          </p>
        </div>

        {/* How it works — 3 steps */}
        <div className="flex flex-col gap-2">
          {[
            { n: "1", text: "You share the link below with your companions." },
            { n: "2", text: "Each person fills in their travel preferences — takes under 2 minutes." },
            { n: "3", text: "Once everyone responds, you generate a new itinerary that works for the whole group." },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Share link — primary action */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Your group invite link
          </label>
          <div className={`flex items-center gap-2 p-3 rounded-2xl border ${copied ? "border-primary/40 bg-primary/5" : "border-border bg-card"} transition-colors`}>
            <Link2 className={`w-4 h-4 flex-shrink-0 ${copied ? "text-primary" : "text-muted-foreground"}`} />
            <span className="flex-1 text-sm truncate font-mono text-foreground">
              {FAKE_LINK}
            </span>
            <Button
              size="sm"
              onClick={handleCopyLink}
              className={`flex-shrink-0 gap-1.5 rounded-full transition-all ${copied ? "bg-primary/15 text-primary hover:bg-primary/20" : ""}`}
              variant={copied ? "ghost" : "default"}
              data-testid="button-copy-link"
            >
              {copied
                ? <><ClipboardCheck className="w-3.5 h-3.5" /> Copied!</>
                : <><Copy className="w-3.5 h-3.5" /> Copy link</>
              }
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pl-1">
            Anyone with this link can submit their preferences. The link is unique to this trip.
          </p>
        </div>

        {/* Optional: track companions by name */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Who are you expecting? <span className="normal-case font-normal">(optional)</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Add names so you can track who's responded and send reminders.
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {names.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`Companion ${i + 1} name`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
                  data-testid={`input-name-${i}`}
                />
                {names.length > 1 && (
                  <button
                    onClick={() => setNames((n) => n.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    data-testid={`button-remove-name-${i}`}
                    aria-label="Remove person"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setNames((n) => [...n, ""])}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-add-person"
          >
            <Plus className="w-4 h-4" />
            Add another person
          </button>
        </div>

        {/* Track responses CTA */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            className="w-full rounded-full gap-2"
            onClick={() => navigate("/survey/status")}
            data-testid="button-track-responses"
          >
            <Users className="w-4 h-4" />
            Track responses
            <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You can also share the link and check back later.
          </p>
        </div>

      </div>
    </div>
  );
}
