import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Share2, Bookmark, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { MOCK_ITINERARY } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ItineraryView() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
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
      .writeText("https://wandr.app/itinerary/share/vancouver-abc123")
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
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
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
              Start over
            </Button>
          </div>

          {/* Mobile: share icon */}
          <div className="flex md:hidden items-center gap-1">
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

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-32 md:pb-8">
        {itinerary.groupType !== "solo" && (
          <p className="text-sm text-muted-foreground mb-6">
            Curated for{" "}
            <span className="font-medium text-foreground">
              {itinerary.participants.join(" & ")}
            </span>
          </p>
        )}

        {itinerary.days.map((day) => (
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
    </div>
  );
}
