import { useState } from "react";
import { Sun, Sunset, Moon, Bed, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityBlock } from "@/lib/mock-data";

interface ActivityCardProps {
  block: ActivityBlock;
  index: number;
  dayNumber: number;
}

const TIME_CONFIG = {
  morning: { label: "Morning", icon: <Sun className="w-3.5 h-3.5" />, color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  afternoon: { label: "Afternoon", icon: <Sunset className="w-3.5 h-3.5" />, color: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  evening: { label: "Evening", icon: <Moon className="w-3.5 h-3.5" />, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  rest: { label: "Rest", icon: <Bed className="w-3.5 h-3.5" />, color: "bg-muted text-muted-foreground" },
};

export function ActivityCard({ block, index, dayNumber }: ActivityCardProps) {
  const [swapped, setSwapped] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const isRest = block.timeSlot === "rest";
  const timeConfig = TIME_CONFIG[block.timeSlot];
  const activity = swapped
    ? { ...block.primary, name: block.backup.name, costRange: block.backup.costRange, description: "An alternative option your AI matched to your preferences.", whyForYou: "Swapped in based on your style." }
    : block.primary;

  function handleSwap() {
    if (isRest || !block.backup.name) return;
    setSwapping(true);
    setTimeout(() => {
      setSwapped((s) => !s);
      setSwapping(false);
    }, 800);
  }

  return (
    <div
      id={`block-d${dayNumber}-${index}`}
      className={`rounded-2xl border overflow-hidden bg-card transition-all ${
        isRest ? "border-muted bg-muted/30" : "border-card-border shadow-sm"
      }`}
    >
      {/* Card Image */}
      {!isRest && (
        <div className="relative h-44 overflow-hidden">
          {swapping ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      )}

      <div className="p-5">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${timeConfig.color}`}>
              {timeConfig.icon}
              {timeConfig.label}
            </span>
            {block.curatorName && (
              <span className="text-xs text-muted-foreground">{block.curatorName}</span>
            )}
          </div>
          {!isRest && (
            <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
              {activity.costRange}
            </span>
          )}
        </div>

        {/* Venue Name */}
        {swapping ? (
          <Skeleton className="h-7 w-48 mb-1" />
        ) : (
          <h3 className="font-serif text-xl font-bold text-foreground mb-0.5 leading-tight">
            {activity.name}
          </h3>
        )}

        {/* Type */}
        <p className="text-xs text-muted-foreground tracking-wide uppercase mb-3">
          {activity.type}
        </p>

        {/* Description */}
        {swapping ? (
          <>
            <Skeleton className="h-4 w-full mb-1.5" />
            <Skeleton className="h-4 w-4/5 mb-4" />
          </>
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {activity.description}
          </p>
        )}

        {/* Why This For You */}
        {!swapping && (
          <div className="bg-muted/60 rounded-xl p-3.5 mb-4">
            <div className="flex items-start gap-2">
              <Star className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  Why this for you
                </span>
                <p className="text-sm italic text-muted-foreground mt-0.5 leading-relaxed">
                  {activity.whyForYou}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Group Attribution */}
        {block.groupAttribution.length > 0 && !isRest && (
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground">For:</span>
            {block.groupAttribution.map((name) => (
              <Badge
                key={name}
                variant="secondary"
                className="text-xs rounded-full px-2.5 py-0.5"
              >
                {name}
              </Badge>
            ))}
          </div>
        )}

        {/* Backup / Swap Row */}
        {!isRest && block.backup.name && (
          <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
            <span className="text-xs text-muted-foreground truncate">
              Backup: <span className="font-medium text-foreground/70">{block.backup.name}</span>
              <span className="ml-1.5 text-muted-foreground">· {block.backup.costRange}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              disabled={swapping}
              className="flex-shrink-0 gap-1.5 text-xs rounded-full"
              data-testid={`button-swap-d${dayNumber}-${index}`}
            >
              <RefreshCw className={`w-3 h-3 ${swapping ? "animate-spin" : ""}`} />
              Swap
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
