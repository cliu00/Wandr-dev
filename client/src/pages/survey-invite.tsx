import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Copy, Mail, MessageCircle, Check, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FAKE_LINK = "https://48hrs.app/survey/join/london-x7k9m";

export default function SurveyInvite() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(FAKE_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", description: "Share it with your crew." });
  }

  function handleShare(channel: string) {
    toast({
      title: `${channel} sharing`,
      description: "Sharing will be available in the full version.",
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center px-5 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/intake")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Invite your crew
          </h1>
          <p className="text-muted-foreground">
            Planning London · Apr 18–20, 2 days
          </p>
        </div>

        {/* Share Link */}
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
              onClick={handleCopy}
              className="flex-shrink-0 gap-1.5 rounded-full"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Share via
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Email", icon: <Mail className="w-5 h-5" />, channel: "Email" },
              { label: "SMS", icon: <MessageCircle className="w-5 h-5" />, channel: "SMS" },
              { label: "WhatsApp", icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              ), channel: "WhatsApp" },
            ].map(({ label, icon, channel }) => (
              <button
                key={label}
                onClick={() => handleShare(channel)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover-elevate active-elevate-2 transition-colors"
                data-testid={`button-share-${label.toLowerCase()}`}
              >
                <span className="text-muted-foreground">{icon}</span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-8 text-sm text-muted-foreground">
          Each person fills in a quick 4-question survey. Once everyone responds, you'll generate a single itinerary that works for the whole group.
        </div>

        {/* Track Button */}
        <Button
          className="w-full rounded-full gap-2"
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
