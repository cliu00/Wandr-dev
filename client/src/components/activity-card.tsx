import { useState } from "react";
import { Sun, Sunset, Moon, Bed, RefreshCw, Star, Coffee, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isRested, setIsRested] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isBaseRest = block.timeSlot === "rest";
  const timeConfig = TIME_CONFIG[block.timeSlot];

  const activity = swapped
    ? {
        ...block.primary,
        name: block.backup.name,
        costRange: block.backup.costRange,
        imageUrl: block.backup.imageUrl ?? block.primary.imageUrl,
        type: block.backup.type ?? block.primary.type,
        description: block.backup.description ?? "An alternative option your AI matched to your preferences.",
        whyForYou: block.backup.whyForYou ?? "Swapped in based on your style.",
      }
    : block.primary;

  function handleSwap() {
    if (isBaseRest || !block.backup.name) return;
    setSwapping(true);
    setImgError(false);
    setTimeout(() => {
      setSwapped((s) => !s);
      setSwapping(false);
    }, 800);
  }

  if (isRested) {
    return (
      <div
        id={`block-d${dayNumber}-${index}`}
        className="rounded-2xl border border-muted bg-muted/30 overflow-hidden"
        data-testid={`card-rest-d${dayNumber}-${index}`}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Bed className="w-3.5 h-3.5" />
              Free time
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground mb-0.5 leading-tight">
            Free Time / Rest
          </h3>
          <p className="text-xs text-muted-foreground tracking-wide uppercase mb-3">Unstructured</p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Take a break, explore at your own pace, or relax at a café. No agenda — just you and the city.
          </p>
          <div className="pt-3 border-t border-border/60">
            <button
              onClick={() => setIsRested(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`button-restore-d${dayNumber}-${index}`}
            >
              ← Restore activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`block-d${dayNumber}-${index}`}
      className={`rounded-2xl border overflow-hidden bg-card transition-all ${
        isBaseRest ? "border-muted bg-muted/30" : "border-card-border shadow-sm"
      }`}
    >
      {!isBaseRest && (
        <div className="relative h-56 overflow-hidden bg-muted">
          {swapping ? (
            <Skeleton className="w-full h-full" />
          ) : imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
              <ImageOff className="w-8 h-8" />
              <span className="text-xs">Image unavailable</span>
            </div>
          ) : (
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="w-full h-full object-cover"
              loading="lazy"
              width={640}
              height={176}
              onError={() => setImgError(true)}
            />
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${timeConfig.color}`}>
            {timeConfig.icon}
            {timeConfig.label}
          </span>
          {!isBaseRest && (
            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
              {activity.costRange}
            </span>
          )}
        </div>

        {swapping ? (
          <Skeleton className="h-7 w-48 mb-1" />
        ) : (
          <h3 className="font-serif text-xl font-bold text-foreground mb-0.5 leading-tight">
            {activity.name}
          </h3>
        )}

        <p className="text-sm text-muted-foreground mb-3">
          {activity.type?.includes("·") ? activity.type.split("·").pop()?.trim() : activity.type}
        </p>

        {swapping ? (
          <>
            <Skeleton className="h-4 w-full mb-1.5" />
            <Skeleton className="h-4 w-4/5 mb-4" />
          </>
        ) : (
          <p className="text-base text-foreground/80 leading-relaxed mb-4">
            {activity.description}
          </p>
        )}

        {!swapping && !isBaseRest && (
          <div className="bg-muted/60 rounded-xl p-3.5 mb-4">
            <div className="flex items-start gap-2">
              <Star className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  Why this for you
                </span>
                <p className="text-sm text-foreground/70 mt-0.5 leading-relaxed">
                  {activity.whyForYou}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isBaseRest && (
          <div className="pt-3 border-t border-border/60">
            {block.backup.name && (
              <div className={`flex items-center gap-2 mb-2.5 ${swapped ? "justify-between" : "justify-end"}`}>
                {swapped && (
                  <span className="text-xs text-muted-foreground truncate">
                    <span className="inline-flex items-center gap-1 text-primary font-medium mr-1.5">Swapped</span>
                    · Original: <span className="font-medium text-foreground/70">{block.primary.name}</span>
                    <span className="ml-1.5 text-muted-foreground">· {block.primary.costRange}</span>
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwap}
                  disabled={swapping}
                  className={`flex-shrink-0 gap-1.5 text-xs rounded-full ${swapped ? "border-primary/40 text-primary" : ""}`}
                  data-testid={`button-swap-d${dayNumber}-${index}`}
                >
                  <RefreshCw className={`w-3 h-3 ${swapping ? "animate-spin" : ""}`} />
                  {swapped ? "Swap back" : "Swap"}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRested(true)}
              className="w-full gap-1.5 text-xs rounded-full text-muted-foreground"
              data-testid={`button-rest-d${dayNumber}-${index}`}
            >
              <Coffee className="w-3 h-3" />
              Take a rest instead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
