import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Share2, Bookmark, Users, RefreshCw, LogIn, UserPlus, RotateCcw, X } from "lucide-react";
import { FlowHeader } from "@/components/flow-header";
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
  const search = useSearch();

  const itinerary = MOCK_ITINERARY;
  const urlGroupType = new URLSearchParams(search).get("groupType") || itinerary.groupType;
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
    const params = new URLSearchParams();
    params.set("destination", itinerary.destination);
    params.set("tripType", urlGroupType);
    navigate(`/intake?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav header — compact, just back + day tabs */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto">
          <FlowHeader onBack={() => navigate("/")} />
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

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-32 md:pb-8">

        {/* Page title hero */}
        <div className="mb-8 pb-6 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Your Wandr Itinerary
          </p>
          <h1
            className="font-serif text-5xl md:text-6xl font-light text-foreground leading-none mb-4"
            data-testid="text-itinerary-title"
          >
            {itinerary.destination}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
              {itinerary.durationDays} {itinerary.durationDays === 1 ? "day" : "days"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
              {itinerary.days[0]?.date}
              {itinerary.days.length > 1 && ` – ${itinerary.days[itinerary.days.length - 1]?.date}`}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border capitalize">
              {urlGroupType === "solo" ? "Solo" : urlGroupType === "duo" ? "Duo" : urlGroupType === "family" ? "Family" : "Group trip"}
            </span>
          </div>
        </div>

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
          <div className="border border-border rounded-3xl p-6 md:p-8">
            <h3 className="font-serif text-2xl font-light text-foreground mb-1">
              Your adventure is ready.
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              What would you like to do next?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* 1 — Save */}
              <button
                onClick={handleSave}
                className={`flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-colors ${
                  saved ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/40"
                }`}
                data-testid="button-save-cta"
              >
                <Bookmark className={`w-5 h-5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{saved ? "Saved to your trips" : "Save this itinerary"}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Keep it in your account so you can come back any time.</p>
                </div>
              </button>

              {/* 2 — Share */}
              <button
                onClick={handleShare}
                className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 text-left transition-colors"
                data-testid="button-share-cta"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-snug">Share a link</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Copy a read-only link — send it to anyone to view the itinerary.</p>
                </div>
              </button>

              {/* 3 — Invite */}
              <button
                onClick={handleInvite}
                className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 text-left transition-colors"
                data-testid="button-invite-cta"
              >
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-snug">Invite another wandrer</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Send a personal link — they answer 5 quick questions. Wandr blends everyone's input and refines this itinerary.</p>
                </div>
              </button>

              {/* 4 — Start over */}
              <button
                onClick={handleRegenerate}
                className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 text-left transition-colors"
                data-testid="button-regenerate-cta"
              >
                <RotateCcw className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-snug">Start over</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Go back to the beginning and plan a different trip.</p>
                </div>
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
