import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Bookmark, Users, RefreshCw, LogIn, UserPlus, X, AlertCircle, Sparkles, Download, Calendar, Link2, Pencil } from "lucide-react";
import { FlowHeader } from "@/components/flow-header";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function ItineraryView() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviterName, setInviterName] = useState("");
  const [updatedBanner, setUpdatedBanner] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temp: number; label: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tripName, setTripName] = useState<string>("");
  const seenVersionRef = useRef<number | null>(null);

  // Pre-fill inviter name from auth once available
  useEffect(() => {
    if (user?.name && !inviterName) setInviterName(user.name);
  }, [user?.name]);

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
    // Poll every 3s for group trips (or trips that could become group when a friend joins)
    refetchInterval: (query) => {
      const d = query.state.data as any;
      const type = d?.trip?.groupType;
      return type === "group" || type === "solo" ? 3000 : false;
    },
  });

  // Show banner + toast when a new version is detected; clear "regenerating" state
  useEffect(() => {
    const version = data?.versionNumber;
    if (version == null) return;
    if (seenVersionRef.current === null) {
      seenVersionRef.current = version;
    } else if (version > seenVersionRef.current) {
      seenVersionRef.current = version;
      const contributor: string | null = data?.latestContributorName ?? null;
      const isFirstCompanion = (data?.contributorCount ?? 1) === 2;
      const msg = isFirstCompanion && contributor
        ? `${contributor} joined — your group is taking shape!`
        : contributor
        ? `${contributor} added their preferences — itinerary updated`
        : "Itinerary updated with new preferences";
      setUpdatedBanner(msg);
      setRegenerating(false);
      toast({ title: isFirstCompanion ? "Your first wandrer joined 🎉" : "Itinerary updated", description: msg });
    }
    // If the version advanced past the submitted-on version, we're done regenerating
    if (submittedOnVersionRef.current !== null && version > submittedOnVersionRef.current) {
      setRegenerating(false);
      submittedOnVersionRef.current = null;
    }
  }, [data?.versionNumber]);

  // Fetch weather for day 1 using Open-Meteo (free, no API key)
  useEffect(() => {
    if (!data?.itinerary) return;
    const day1 = data.itinerary.days?.[0];
    if (!day1?.date) return;
    // Use lat/lng from the first activity block
    const firstBlock = day1.blocks?.find((b: any) => b.primary?.lat && b.primary?.lng);
    if (!firstBlock) return;
    const { lat, lng } = firstBlock.primary;
    const date = day1.date;

    const WMO_LABEL: Record<number, string> = {
      0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
      45: "foggy", 48: "foggy", 51: "light drizzle", 53: "drizzle", 55: "drizzle",
      61: "light rain", 63: "rain", 65: "heavy rain", 71: "light snow", 73: "snow", 75: "heavy snow",
      80: "showers", 81: "showers", 82: "heavy showers", 95: "thunderstorms",
    };

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,weathercode&start_date=${date}&end_date=${date}&timezone=auto`)
      .then((r) => r.json())
      .then((d) => {
        const temp = Math.round(d.daily?.temperature_2m_max?.[0]);
        const code = d.daily?.weathercode?.[0];
        if (!isNaN(temp)) {
          setWeather({ temp, label: WMO_LABEL[code] ?? "variable conditions" });
        }
      })
      .catch(() => {}); // silent fail — weather is non-critical
  }, [data?.itinerary?.days?.[0]?.date]);

  const itinerary = data?.itinerary;
  const tripData = data?.trip;
  const isGroupTrip = tripData?.groupType === "group";
  const isCreator = !!(data?.isCreator ?? sessionStorage.getItem(`wandr_created_${id}`));
  const urlGroupType = itinerary?.groupType || tripData?.groupType || "solo";
  const contributorCount: number = data?.contributorCount ?? 1;
  const currentVersionNumber: number = data?.versionNumber ?? 1;
  const currentDay = itinerary?.days?.find((d: any) => d.dayNumber === activeDay) ?? itinerary?.days?.[0];

  // Sync tripName from server (only on first load, after tripData is available)
  useEffect(() => {
    if (tripData?.tripName && !tripName) setTripName(tripData.tripName);
  }, [tripData?.tripName]);

  async function handleSave() {
    if (!user) { setShowAuthModal(true); return; }
    if (saved) return;
    setSaved(true);
    try {
      const res = await fetch(`/api/trips/${id}/save`, { method: "POST" });
      if (!res.ok) throw new Error(`${res.status}`);
      toast({ title: "Itinerary saved", description: "Added to your trips." });
    } catch {
      setSaved(false);
      toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    }
  }

  function handleInvite() {
    setShowInviteModal(true);
  }

  async function saveTripName() {
    setEditingName(false);
    const name = tripName.trim();
    await fetch(`/api/trips/${id}/name`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripName: name }),
    });
  }

  async function copyInviteLink() {
    const params = new URLSearchParams({ tripId: id! });
    if (inviterName.trim()) params.set("from", inviterName.trim());
    const inviteUrl = `${window.location.origin}/survey/join?${params.toString()}`;
    const ok = await copyToClipboard(inviteUrl);
    setShowInviteModal(false);
    if (ok) {
      toast({ title: "Invite link copied", description: "Send it to your friends — they'll add their preferences and the itinerary updates." });
    } else {
      toast({ title: "Couldn't copy automatically", description: `Copy manually: ${inviteUrl}`, variant: "destructive" });
    }
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

  if (data?.status === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-10 h-10 text-destructive/60" />
        <h2 className="font-serif text-2xl font-light">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">We couldn't generate your itinerary. Please try again.</p>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => navigate("/intake")} className="rounded-full">Try again</Button>
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-full">Back to home</Button>
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
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{updatedBanner}</span>
            <button
              onClick={() => setUpdatedBanner(null)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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
          {/* Label row: "Your Wandr Itinerary" + countdown */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Your Wandr Itinerary
            </p>
            {(() => {
              const first = itinerary.days[0]?.date;
              const last = itinerary.days[itinerary.days.length - 1]?.date;
              if (!first) return null;
              const today = new Date(); today.setHours(0,0,0,0);
              const start = new Date(first + "T00:00:00"); start.setHours(0,0,0,0);
              const end = new Date(last + "T00:00:00"); end.setHours(0,0,0,0);
              const daysUntil = Math.round((start.getTime() - today.getTime()) / 86400000);
              if (daysUntil < 0 && today > end) return null; // trip is over
              if (daysUntil === 0) return <span className="text-xs font-semibold text-primary bg-primary/8 border border-primary/20 px-3 py-1 rounded-full">Today!</span>;
              if (daysUntil === 1) return <span className="text-xs font-semibold text-primary bg-primary/8 border border-primary/20 px-3 py-1 rounded-full">Tomorrow</span>;
              if (daysUntil > 0) return <span className="text-xs font-medium text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full">In {daysUntil} days</span>;
              return <span className="text-xs font-medium text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full">Happening now</span>;
            })()}
          </div>

          {/* Trip title — editable by creator, read-only for friends */}
          {isCreator && editingName ? (
            <input
              autoFocus
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              onBlur={saveTripName}
              onKeyDown={(e) => { if (e.key === "Enter") saveTripName(); if (e.key === "Escape") setEditingName(false); }}
              maxLength={80}
              className="font-serif text-6xl md:text-7xl font-light text-foreground leading-none mb-1 bg-transparent border-b-2 border-primary outline-none w-full"
              data-testid="input-trip-name"
            />
          ) : (
            <h1
              className={`font-serif text-6xl md:text-7xl font-light text-foreground leading-none mb-1 ${isCreator ? "cursor-pointer group" : ""}`}
              onClick={() => { if (isCreator) { if (!tripName) setTripName(tripData?.tripName || (() => { const name = user?.name || inviterName || null; if (!name) return itinerary.destination; if (urlGroupType === "group") return `The ${itinerary.destination} Crew`; return `${name}'s ${itinerary.destination}`; })()); setEditingName(true); } }}
              title={isCreator ? "Click to rename" : undefined}
              data-testid="text-itinerary-title"
            >
              {tripName || (() => {
                const name = user?.name || inviterName || null;
                if (!name) return itinerary.destination;
                if (urlGroupType === "group") return `The ${itinerary.destination} Crew`;
                if (urlGroupType === "duo") return `${name} & ${itinerary.destination}`;
                return `${name}'s ${itinerary.destination}`;
              })()}
              {isCreator && (
                <Pencil className="inline ml-3 w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity align-middle mb-1" />
              )}
            </h1>
          )}

          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {itinerary.country ? `${itinerary.country}` : ""}
            {itinerary.country ? <span className="mx-2 opacity-40">·</span> : null}
            <span>{urlGroupType === "solo" ? "Solo" : urlGroupType === "duo" ? "Duo" : urlGroupType === "family" ? "Family" : "Group Trip"}</span>
          </p>

          {/* Trip vibe + weather */}
          <div className={`flex flex-wrap items-center gap-3 mb-5 ${!itinerary.tripVibe && !weather ? "hidden" : ""}`}>
            {itinerary.tripVibe && (
              <p className="text-sm italic text-muted-foreground">{itinerary.tripVibe}</p>
            )}
            {itinerary.tripVibe && weather && <span className="text-muted-foreground/40 text-sm">·</span>}
            {weather && (
              <p className="text-sm text-muted-foreground">
                {weather.temp}°C · {weather.label} on Day 1
              </p>
            )}
          </div>

          {/* Hero action pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
                saved
                  ? "border-primary/50 bg-primary/8 text-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground/80"
              }`}
              data-testid="button-save-hero"
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleInvite}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground/80 transition-colors"
              data-testid="button-invite-hero"
            >
              <Users className="w-3.5 h-3.5" />
              Invite friends
            </button>
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
                  isGroupTrip={isGroupTrip}
                />
              ))}
            </div>
          </div>
        </div>



        {/* Invite friends CTA for group trips */}
        {isGroupTrip && (
          <div className="py-4 mb-4">
            <button
              onClick={handleInvite}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-3 rounded-full border border-primary bg-primary/8 hover:bg-primary/15 text-primary transition-colors"
              data-testid="button-invite-bottom"
            >
              <UserPlus className="w-4 h-4" />
              Invite friends to join
            </button>
          </div>
        )}

        {/* Export strip */}
        <div className="flex items-center gap-3 py-4 border-t border-border">
          <a
            href={`/api/trips/${id}/pdf`}
            download
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground/80 transition-colors"
            data-testid="button-pdf-strip"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </a>
          <a
            href={`/api/trips/${id}/ical`}
            download
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground/80 transition-colors"
            data-testid="button-ical-strip"
          >
            <Calendar className="w-3.5 h-3.5" />
            Add to calendar
          </a>
        </div>

        {/* Start over */}
        <div className="py-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            data-testid="button-start-over"
          >
            Start over
          </button>
        </div>
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
            onClick={handleInvite}
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            data-testid="button-invite-mobile"
          >
            <Users className="w-5 h-5" />
            Invite
          </button>
          <a
            href={`/api/trips/${id}/pdf`}
            download
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            data-testid="button-pdf-mobile"
          >
            <Download className="w-5 h-5" />
            PDF
          </a>
        </div>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="w-full max-w-sm bg-background rounded-3xl border border-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">Invite friends</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Your name appears on their invite screen.</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Your name <span className="text-destructive">*</span>
              </label>
              <Input
                value={inviterName}
                onChange={(e) => setInviterName(e.target.value)}
                placeholder="e.g. Sarah"
                className="rounded-xl h-11"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && inviterName.trim() && copyInviteLink()}
              />
              <p className="text-xs text-muted-foreground mt-1.5">So your friends know who invited them.</p>
            </div>
            <Button
              className="w-full rounded-full gap-2"
              onClick={copyInviteLink}
              disabled={!inviterName.trim()}
            >
              <Link2 className="w-4 h-4" />
              Copy invite link
            </Button>
          </div>
        </div>
      )}

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
