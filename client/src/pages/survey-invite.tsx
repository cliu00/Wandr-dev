import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Copy, Mail, Check, Users, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FAKE_LINK = "https://wandr.app/survey/join/vancouver-x7k9m";

const EMAIL_SCRIPT = `Subject: Help plan our trip!

Hey! I'm planning a trip and using Wandr to build our itinerary. Add your preferences here so we can create a plan everyone loves.

Your personal link: ${FAKE_LINK}

Takes about 2 minutes — just a few quick questions about what you enjoy. See you there!`;

export default function SurveyInvite() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [names, setNames] = useState<string[]>(["", ""]);
  const [nameInput, setNameInput] = useState("");

  function handleCopyLink() {
    navigator.clipboard.writeText(FAKE_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", description: "Share it with your crew." });
  }

  function handleCopyScript() {
    navigator.clipboard.writeText(EMAIL_SCRIPT).catch(() => {});
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2500);
    toast({ title: "Email copied", description: "Paste it into any email client." });
  }

  function handleEmailVia() {
    const subject = encodeURIComponent("Help plan our trip!");
    const body = encodeURIComponent(EMAIL_SCRIPT);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }

  function addName() {
    const trimmed = nameInput.trim();
    if (!trimmed || names.includes(trimmed)) return;
    setNames((n) => [...n.filter(Boolean), trimmed]);
    setNameInput("");
  }

  function removeName(name: string) {
    setNames((n) => n.filter((x) => x !== name));
  }

  function updateName(index: number, value: string) {
    setNames((n) => n.map((x, i) => (i === index ? value : x)));
  }

  const filledNames = names.filter(Boolean);
  const readyToInvite = filledNames.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center px-5 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/itinerary")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Invite your crew
          </h1>
          <p className="text-muted-foreground text-sm">
            Planning Vancouver · Apr 18–20
          </p>
        </div>

        {/* Group planning explainer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/6 border border-primary/15 mb-8">
          <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">Traveling with others?</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share a link so everyone adds their preferences. We'll blend them automatically — no compromises, just a smarter mix.
            </p>
          </div>
        </div>

        {/* Step 1: Who's coming */}
        <div className="mb-8">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Who's joining?
          </label>
          <div className="flex flex-col gap-2 mb-3">
            {names.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`Person ${i + 1}`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
                  data-testid={`input-name-${i}`}
                />
                {names.length > 1 && (
                  <button
                    onClick={() => setNames((n) => n.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    data-testid={`button-remove-name-${i}`}
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

        {/* Step 2: Group link */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Your group link
          </label>
          <div className="flex items-center gap-2 p-3 rounded-2xl border border-border bg-card">
            <span className="flex-1 text-sm text-foreground truncate font-mono">
              {FAKE_LINK}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyLink}
              className="flex-shrink-0 gap-1.5 rounded-full"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Step 3: Email invite */}
        <div className="mb-8">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Invite by email
          </label>
          <div className="rounded-2xl border border-border bg-card p-4 mb-3">
            <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {EMAIL_SCRIPT}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyScript}
              className="flex-1 gap-1.5 rounded-full text-xs"
              data-testid="button-copy-script"
            >
              {scriptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {scriptCopied ? "Copied!" : "Copy message"}
            </Button>
            <Button
              size="sm"
              onClick={handleEmailVia}
              className="flex-1 gap-1.5 rounded-full text-xs"
              data-testid="button-open-email"
            >
              <Mail className="w-3.5 h-3.5" />
              Open in email
            </Button>
          </div>
        </div>

        {/* Info note */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-8 text-sm text-muted-foreground">
          Each person fills in a quick survey. Once everyone responds, you'll generate a single itinerary that works for the whole group.
        </div>

        <Button
          className="w-full rounded-full gap-2"
          disabled={!readyToInvite}
          onClick={() => navigate("/survey/status")}
          data-testid="button-track-responses"
        >
          Track responses
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
