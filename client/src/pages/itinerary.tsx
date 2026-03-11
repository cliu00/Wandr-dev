import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Share2, Map, X, Bed, Bookmark, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { ItineraryMap } from "@/components/itinerary-map";
import { MOCK_ITINERARY } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ItineraryView() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showRestBlocks, setShowRestBlocks] = useState(false);
  const [saved, setSaved] = useState(false);

  const itinerary = MOCK_ITINERARY;

  function handleSave() {
    setSaved(true);
    toast({
      title: "Itinerary saved",
      description: "Added to your trips.",
    });
  }

  function handleShare() {
    navigator.clipboard
      .writeText("https://48hrs.app/itinerary/share/vancouver-abc123")
      .catch(() => {});
    toast({
      title: "Link copied",
      description: "Share this link with your crew.",
    });
  }

  function handleInvite() {
    navigate("/survey/invite");
  }

  function handleRegenerate() {
    navigate("/generating");
  }

  function handleMarkerClick(dayNumber: number, blockIndex: number) {
    const el = document.getElementById(`block-d${dayNumber}-${blockIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
    }
  }

  const filteredDays = itinerary.days.map((day) => ({
    ...day,
    blocks: showRestBlocks
      ? day.blocks
      : day.blocks.filter((b) => b.timeSlot !== "rest"),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div
              className="font-serif text-base font-semibold text-foreground"
              data-testid="text-itinerary-title"
            >
              {itinerary.destination}
            </div>
            <div className="text-xs text-muted-foreground">
              {itinerary.durationDays}-day itinerary
            </div>
          </div>

          {/* Desktop action row */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`gap-1.5 text-xs ${saved ? "text-primary" : ""}`}
              data-testid="button-save"
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
              data-testid="button-share"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInvite}
              className="gap-1.5 text-xs"
              data-testid="button-invite"
            >
              <Users className="w-3.5 h-3.5" />
              Invite Others
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              className="gap-1.5 text-xs"
              data-testid="button-regenerate"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>

          {/* Mobile: map + share icons */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMap(true)}
              data-testid="button-view-map-mobile"
            >
              <Map className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              data-testid="button-share-mobile"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Left — Itinerary */}
        <div className="flex-1 min-w-0 px-4 md:px-8 py-8 md:max-w-[58%]">
          {/* Controls row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            {itinerary.groupType !== "solo" ? (
              <p className="text-sm text-muted-foreground">
                Curated for{" "}
                <span className="font-medium text-foreground">
                  {itinerary.participants.join(" & ")}
                </span>
              </p>
            ) : (
              <div />
            )}

            {/* Rest blocks toggle */}
            <button
              onClick={() => setShowRestBlocks((v) => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
                showRestBlocks
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
              data-testid="button-toggle-rest"
            >
              <Bed className="w-3.5 h-3.5" />
              Rest blocks
              <span
                className={`w-7 h-4 rounded-full transition-colors relative flex-shrink-0 ${
                  showRestBlocks ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    showRestBlocks ? "translate-x-0.5" : "translate-x-3.5"
                  }`}
                />
              </span>
            </button>
          </div>

          {filteredDays.map((day) => (
            <div key={day.dayNumber} className="mb-10">
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Day {day.dayNumber}
                </h2>
                <span className="text-muted-foreground text-sm">{day.date}</span>
              </div>

              <div className="flex flex-col gap-4">
                {day.blocks.map((block, idx) => (
                  <ActivityCard
                    key={block.id}
                    block={block}
                    index={idx}
                    dayNumber={day.dayNumber}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right — Map (desktop only) */}
        <div className="hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] flex-1 border-l border-border">
          <ItineraryMap itinerary={itinerary} onMarkerClick={handleMarkerClick} />
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
            Regenerate
          </button>
          <button
            onClick={() => setShowMobileMap(true)}
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            data-testid="button-map-mobile"
          >
            <Map className="w-5 h-5" />
            Map
          </button>
        </div>
      </div>

      {/* Mobile Map Sheet */}
      {showMobileMap && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setShowMobileMap(false)}
                data-testid="button-close-map"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ItineraryMap
              itinerary={itinerary}
              onMarkerClick={(day, idx) => {
                setShowMobileMap(false);
                setTimeout(() => handleMarkerClick(day, idx), 100);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
