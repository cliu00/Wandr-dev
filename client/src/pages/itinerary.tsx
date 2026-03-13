import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Share2, Bookmark, Users, RefreshCw, LogIn, UserPlus, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { MOCK_ITINERARY } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

export default function ItineraryView() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);


  const itinerary = MOCK_ITINERARY;
  const currentDay = itinerary.days.find((d) => d.dayNumber === activeDay) ?? itinerary.days[0];

  function handleSave() {
    if (user) {
      setSaved(true);
      toast({ title: "Itinerary saved", description: "Added to your trips." });
    } else {
      setShowAuthModal(true);
    }
  }

  async function handleShare() {
    const ok = await copyToClipboard("https://wandr.app/itinerary/share/vancouver-abc123");
    if (ok) {
      toast({ title: "Link copied", description: "Share this link with your companions." });
    } else {
      toast({
        title: "Couldn't copy automatically",
        description: "Copy this link manually: wandr.app/itinerary/share/vancouver-abc123",
        variant: "destructive",
      });
    }
  }

  function handleInvite() {
    navigate("/survey/invite");
  }

  function handleRegenerate() {
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Main header row */}
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="flex-shrink-0 p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to home"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Title block — left-aligned, takes remaining space */}
          <div className="flex-1 min-w-0">
            <h1
              className="font-serif text-lg font-light text-foreground leading-none truncate"
              data-testid="text-itinerary-title"
            >
              {itinerary.destination}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">
              {itinerary.durationDays}-day itinerary
            </p>
          </div>

        </div>

        {/* Day tab selector */}
        {itinerary.days.length > 1 && (
          <div className="border-t border-border/40">
            <div className="max-w-4xl mx-auto px-4">
              <div
                className="flex gap-1 py-2 overflow-x-auto"
                role="tablist"
                aria-label="Itinerary days"
              >
                {itinerary.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    role="tab"
                    aria-selected={activeDay === day.dayNumber}
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeDay === day.dayNumber
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                    data-testid={`button-day-${day.dayNumber}`}
                  >
                    Day {day.dayNumber}
                    <span className={`text-[10px] font-normal ${activeDay === day.dayNumber ? "opacity-70" : "opacity-50"}`}>
                      {day.date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 pb-32 md:pb-8">

        {/* Active day content */}
        <div className="mb-10">

          <div className="flex flex-col gap-4">
            {currentDay.blocks.map((block, idx) => (
              <ActivityCard
                key={block.id}
                block={block}
                index={idx}
                dayNumber={currentDay.dayNumber}
              />
            ))}
          </div>
        </div>

        {/* Day navigation footer */}
        {itinerary.days.length > 1 && (
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => setActiveDay((d) => Math.max(1, d - 1))}
              disabled={activeDay === 1}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-testid="button-prev-day"
            >
              ← Day {activeDay - 1}
            </button>
            <span className="text-xs text-muted-foreground">
              {activeDay} / {itinerary.days.length}
            </span>
            <button
              onClick={() => setActiveDay((d) => Math.min(itinerary.days.length, d + 1))}
              disabled={activeDay === itinerary.days.length}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-testid="button-next-day"
            >
              Day {activeDay + 1} →
            </button>
          </div>
        )}

        {/* End of itinerary CTA */}
        {activeDay === itinerary.days.length && (
          <div className="border border-border rounded-3xl p-6 md:p-8 text-center">
            <h3 className="font-serif text-2xl font-light text-foreground mb-1">
              Your adventure is ready.
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              What would you like to do next?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
                data-testid="button-save-cta"
              >
                <Bookmark className={`w-5 h-5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium text-foreground">{saved ? "Saved" : "Save Trip"}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
                data-testid="button-share-cta"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Share Trip</span>
              </button>
              <button
                onClick={handleInvite}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
                data-testid="button-invite-cta"
              >
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Invite Companions</span>
              </button>
              <button
                onClick={handleRegenerate}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
                data-testid="button-regenerate-cta"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Start Over</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3">
        <div className="flex items-center justify-around gap-1">
          <button
            onClick={handleSave}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              saved ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="button-save-mobile"
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-primary" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            data-testid="button-share-action-mobile"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={handleInvite}
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            data-testid="button-invite-mobile"
          >
            <Users className="w-5 h-5" />
            Invite
          </button>
          <button
            onClick={handleRegenerate}
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            data-testid="button-regenerate-mobile"
          >
            <RefreshCw className="w-5 h-5" />
            Start over
          </button>
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
          data-testid="modal-auth-backdrop"
        >
          <div
            className="w-full max-w-sm bg-background rounded-3xl border border-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-auth"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">Save your trip</h3>
                <p className="text-sm text-muted-foreground mt-0.5">A free account keeps it safe.</p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-close-auth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full rounded-full gap-2"
                onClick={() => { setShowAuthModal(false); navigate("/sign-up"); }}
                data-testid="button-signup"
              >
                <UserPlus className="w-4 h-4" />
                Create a free account
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full gap-2"
                onClick={() => { setShowAuthModal(false); navigate("/sign-in"); }}
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
