import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Share2, Bookmark, Users, RefreshCw, LogIn, UserPlus, RotateCcw, X, AlertCircle, Sparkles } from "lucide-react";
import { FlowHeader } from "@/components/flow-header";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ItineraryView() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [updatedBanner, setUpdatedBanner] = useState(false);
  const seenVersionRef = useRef<number | null>(null);

  // If the companion just submitted preferences, track the version they submitted on
  // so we can show a "regenerating" state until the new version appears.
  const submittedOnVersionKey = `wandr_submitted_on_${id}`;
  const submittedOnVersion = sessionStorage.getItem(submittedOnVersionKey);
  if (submittedOnVersion) sessionStorage.removeItem(submittedOnVersionKey);
  const submittedOnVersionRef = useRef<number | null>(submittedOnVersion ? Number(submittedOnVersion) : null);
  const [regenerating, setRegenerating] = useState(submittedOnVersionRef.current !== null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error("Failed to load itinerary");
      return res.json();
    },
    enabled: !!id,
    // Poll every 3s for group trips so both people see updates quickly
    refetchInterval: (query) => {
      const d = query.state.data as any;
      return d?.trip?.groupType === "group" ? 3000 : false;
    },
  });

  // Show banner when a new version is detected; clear "regenerating" state
  useEffect(() => {
    const version = data?.versionNumber;
    if (version == null) return;
    if (seenVersionRef.current === null) {
      seenVersionRef.current = version;
    } else if (version > seenVersionRef.current) {
      seenVersionRef.current = version;
      setUpdatedBanner(true);
      setRegenerating(false);
      const t = setTimeout(() => setUpdatedBanner(false), 6000);
      return () => clearTimeout(t);
    }
    // If the version advanced past the submitted-on version, we're done regenerating
    if (submittedOnVersionRef.current !== null && version > submittedOnVersionRef.current) {
      setRegenerating(false);
      submittedOnVersionRef.current = null;
    }
  }, [data?.versionNumber]);

  const itinerary = data?.itinerary;
  const tripData = data?.trip;
  const isGroupTrip = tripData?.groupType === "group";
  const urlGroupType = itinerary?.groupType || tripData?.groupType || "solo";
  const contributorCount: number = data?.contributorCount ?? 1;
  const currentVersionNumber: number = data?.versionNumber ?? 1;
  const currentDay = itinerary?.days?.find((d: any) => d.dayNumber === activeDay) ?? itinerary?.days?.[0];

  function handleSave() {
    if (user) {
      setSaved(true);
      toast({ title: "Itinerary saved", description: "Added to your trips." });
    } else {
      setShowAuthModal(true);
    }
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/itinerary/${id}`;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      toast({ title: "Link copied", description: "Share this link with your companions." });
    } else {
      toast({
        title: "Couldn't copy automatically",
        description: `Copy this link manually: ${shareUrl}`,
        variant: "destructive",
      });
    }
  }

  async function handleInvite() {
    if (isGroupTrip) {
      // Copy the trip URL — companions open it and click "Add my preferences"
      const shareUrl = `${window.location.origin}/itinerary/${id}`;
      const ok = await copyToClipboard(shareUrl);
      if (ok) {
        toast({ title: "Link copied", description: "Share this link — companions can add their preferences." });
      } else {
        toast({ title: "Couldn't copy automatically", description: `Copy manually: ${shareUrl}`, variant: "destructive" });
      }
    } else {
      navigate("/survey/invite");
    }
  }

  function handleRegenerate() {
    const params = new URLSearchParams();
    params.set("destination", itinerary.destination);
    params.set("tripType", urlGroupType);
    navigate(`/intake?${params.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <FlowHeader onBack={() => navigate("/")} />
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-6 w-32 mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 rounded-2xl border border-border bg-card p-5">
              <Skeleton className="h-6 w-20 rounded-full mb-3" />
              <Skeleton className="h-36 w-full rounded-xl mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !itinerary) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <h2 className="font-serif text-2xl font-light">We couldn't load this itinerary</h2>
        <p className="text-sm text-muted-foreground">It may have been removed or the link may be incorrect.</p>
        <Button onClick={() => navigate("/")} className="rounded-full mt-2">Back to home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* "Regenerating…" banner — shown while companion's AI call is in progress */}
      {regenerating && !updatedBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="mt-4 px-5 py-2.5 bg-muted border border-border rounded-full shadow-lg text-sm font-medium flex items-center gap-2 text-foreground pointer-events-auto">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            Merging preferences and updating itinerary…
          </div>
        </div>
      )}

      {/* "Itinerary updated" banner for group trips */}
      {updatedBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-auto">
            <Sparkles className="w-4 h-4" />
            Itinerary updated with new preferences
          </div>
        </div>
      )}

      {/* Sticky nav header — compact, just back + day tabs */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto">
          <FlowHeader onBack={() => navigate("/")} />
        </div>

      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-32 md:pb-8">

        {/* Page title hero */}
        <div className="mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Your Wandr Itinerary
          </p>
          <h1
            className="font-serif text-6xl md:text-7xl font-light text-foreground leading-none mb-1"
            data-testid="text-itinerary-title"
          >
            {itinerary.destination}
          </h1>
          {itinerary.country && (
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5">
              {itinerary.country}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-foreground/75 bg-muted px-3 py-1 rounded-full border border-border">
              {itinerary.durationDays} {itinerary.durationDays === 1 ? "day" : "days"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-foreground/75 bg-muted px-3 py-1 rounded-full border border-border">
              {(() => {
                const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
                const first = itinerary.days[0]?.date;
                const last = itinerary.days[itinerary.days.length - 1]?.date;
                return itinerary.days.length > 1 ? `${fmt(first)} — ${fmt(last)}` : fmt(first);
              })()}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-foreground/75 bg-muted px-3 py-1 rounded-full border border-border capitalize">
              {urlGroupType === "solo" ? "Solo" : urlGroupType === "duo" ? "Duo" : urlGroupType === "family" ? "Family" : "Group trip"}
            </span>
          </div>
        </div>

        {/* Active day content */}
        <div className="mb-10">

          {/* Day tab selector — sits right above the cards */}
          {itinerary.days.length > 1 && (
            <div
              className="flex gap-1 mb-6 overflow-x-auto"
              role="tablist"
              aria-label="Itinerary days"
            >
              {itinerary.days.map((day: any) => (
                <button
                  key={day.dayNumber}
                  role="tab"
                  aria-selected={activeDay === day.dayNumber}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeDay === day.dayNumber
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border"
                  }`}
                  data-testid={`button-day-${day.dayNumber}`}
                >
                  Day {day.dayNumber}
                  <span className={`font-normal ${activeDay === day.dayNumber ? "opacity-80" : "opacity-60"}`}>·</span>
                  <span className={`text-xs font-normal ${activeDay === day.dayNumber ? "opacity-80" : "opacity-60"}`}>
                    {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Cards with connector lines */}
          <div className="relative flex flex-col">
            {/* Vertical connector line behind cards */}
            <div className="absolute left-6 top-10 bottom-10 w-px bg-border/50 pointer-events-none" aria-hidden="true" />

            <div className="flex flex-col gap-4">
              {currentDay.blocks.map((block: any, idx: number) => (
                <ActivityCard
                  key={block.id}
                  block={block}
                  index={idx}
                  dayNumber={currentDay.dayNumber}
                />
              ))}
            </div>
          </div>
        </div>


        {/* Group trip — contributor status + "Add my preferences" prompt */}
        {isGroupTrip && (
          <div className="mb-6 p-5 rounded-2xl border border-primary/25 bg-primary/5">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-0.5">Group trip</p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Built from {contributorCount} {contributorCount === 1 ? "person's" : "people's"} preferences (v{currentVersionNumber}).
                  Haven't added yours yet? Answer 5 quick questions and it updates automatically.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() => navigate(`/survey/join?tripId=${id}`)}
                    data-testid="button-add-preferences"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Add my preferences
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-2"
                    onClick={handleInvite}
                    data-testid="button-copy-link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Copy invite link
                  </Button>
                </div>
              </div>
            </div>
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
                  <p className="text-sm font-semibold text-foreground leading-snug">{isGroupTrip ? "Share with your group" : "Invite another wandrer"}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{isGroupTrip ? "Copy this itinerary link — companions can add their preferences and it updates automatically." : "Send a personal link — they answer 5 quick questions. Wandr blends everyone's input and refines this itinerary."}</p>
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
