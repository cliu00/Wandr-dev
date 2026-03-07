import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Share2, Map, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { ActivityCard } from "@/components/activity-card";
import { ItineraryMap } from "@/components/itinerary-map";
import { MOCK_ITINERARY } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ItineraryView() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showMobileMap, setShowMobileMap] = useState(false);

  const itinerary = MOCK_ITINERARY;

  function handleShare() {
    navigator.clipboard.writeText("https://48hrs.app/itinerary/share/london-abc123").catch(() => {});
    toast({
      title: "Link copied",
      description: "Share this link with your crew.",
    });
  }

  function handleMarkerClick(dayNumber: number, blockIndex: number) {
    const el = document.getElementById(`block-d${dayNumber}-${blockIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
    }
  }

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
            <div className="font-serif text-base font-semibold text-foreground" data-testid="text-itinerary-title">
              {itinerary.destination}
            </div>
            <div className="text-xs text-muted-foreground">
              {itinerary.durationDays}-day itinerary
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMap(true)}
              className="md:hidden"
              data-testid="button-view-map-mobile"
            >
              <Map className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Left — Itinerary */}
        <div className="flex-1 min-w-0 px-4 md:px-8 py-8 md:max-w-[58%]">
          {/* Participants */}
          {itinerary.groupType !== "solo" && (
            <div className="mb-6 p-4 rounded-2xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Curated for{" "}
                <span className="font-medium text-foreground">
                  {itinerary.participants.join(" & ")}
                </span>
                {" "}· Each card shows who it's tailored for.
              </p>
            </div>
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

        {/* Right — Map (desktop only) */}
        <div className="hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] flex-1 border-l border-border">
          <ItineraryMap
            itinerary={itinerary}
            onMarkerClick={handleMarkerClick}
          />
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
