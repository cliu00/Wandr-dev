import { useState } from "react";
import { Sun, Sunset, Moon, Bed, RefreshCw, Coffee, Utensils, Wine, TreePine, Landmark, ShoppingBag, Camera, Zap, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityBlock } from "@/lib/mock-data";

// Icon + colors by activity type
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; from: string; to: string; fg: string }> = {
  cafe:        { icon: <Coffee className="w-5 h-5" />,      from: "#fef3c7", to: "#fffbeb", fg: "text-amber-700"  },
  restaurant:  { icon: <Utensils className="w-5 h-5" />,    from: "#ffedd5", to: "#fff7ed", fg: "text-orange-700" },
  bar:         { icon: <Wine className="w-5 h-5" />,        from: "#f3e8ff", to: "#faf5ff", fg: "text-purple-700" },
  park:        { icon: <TreePine className="w-5 h-5" />,    from: "#dcfce7", to: "#f0fdf4", fg: "text-green-700"  },
  museum:      { icon: <Landmark className="w-5 h-5" />,    from: "#f5f5f4", to: "#fafaf9", fg: "text-stone-600"  },
  market:      { icon: <ShoppingBag className="w-5 h-5" />, from: "#fce7f3", to: "#fdf2f8", fg: "text-pink-700"   },
  attraction:  { icon: <Camera className="w-5 h-5" />,      from: "#e0f2fe", to: "#f0f9ff", fg: "text-sky-700"    },
  activity:    { icon: <Zap className="w-5 h-5" />,         from: "#fef9c3", to: "#fefce8", fg: "text-yellow-700" },
};
const TYPE_DEFAULT = { icon: <MapPin className="w-5 h-5" />, from: "hsl(155 35% 22% / 0.1)", to: "hsl(155 35% 22% / 0.04)", fg: "text-primary" };

function getTypeConfig(type: string | undefined) {
  if (!type) return TYPE_DEFAULT;
  const key = type.toLowerCase().split(/[\s·|/]/)[0].trim();
  return TYPE_CONFIG[key] ?? TYPE_DEFAULT;
}

// Left border accent color per time slot
const BORDER_COLOR: Record<string, string> = {
  morning:   "border-l-amber-400",
  afternoon: "border-l-orange-400",
  evening:   "border-l-indigo-400",
  rest:      "border-l-border",
};

interface ActivityCardProps {
  block: ActivityBlock;
  index: number;
  dayNumber: number;
}

const TIME_CONFIG = {
  morning:   { label: "Morning",   icon: <Sun className="w-3.5 h-3.5" />,    color: "bg-amber-50 text-amber-700" },
  afternoon: { label: "Afternoon", icon: <Sunset className="w-3.5 h-3.5" />, color: "bg-orange-50 text-orange-700" },
  evening:   { label: "Evening",   icon: <Moon className="w-3.5 h-3.5" />,   color: "bg-indigo-50 text-indigo-700" },
  rest:      { label: "Rest",      icon: <Bed className="w-3.5 h-3.5" />,    color: "bg-muted text-muted-foreground" },
};

export function ActivityCard({ block, index, dayNumber }: ActivityCardProps) {
  const [swapped, setSwapped] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [isRested, setIsRested] = useState(false);

  const isBaseRest = block.timeSlot === "rest";
  const timeConfig = TIME_CONFIG[block.timeSlot];
  const borderColor = BORDER_COLOR[block.timeSlot] ?? "border-l-border";

  const activity = swapped
    ? {
        ...block.primary,
        name:        block.backup.name,
        costRange:   block.backup.costRange,
        type:        block.backup.type ?? block.primary.type,
        description: block.backup.description ?? "An alternative option matched to your preferences.",
        whyForYou:   block.backup.whyForYou ?? "Swapped in based on your style.",
      }
    : block.primary;

  const typeConfig = getTypeConfig(activity.type);

  function handleSwap() {
    if (isBaseRest || !block.backup.name) return;
    setSwapping(true);
    setTimeout(() => {
      setSwapped((s) => !s);
      setSwapping(false);
    }, 800);
  }

  if (isRested) {
    return (
      <div
        id={`block-d${dayNumber}-${index}`}
        className="rounded-2xl border border-l-4 border-l-border border-muted bg-muted/30 overflow-hidden"
        data-testid={`card-rest-d${dayNumber}-${index}`}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Bed className="w-3.5 h-3.5" />
              Free time
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground mb-0.5 leading-tight">Free Time / Rest</h3>
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
      className={`rounded-2xl border border-l-4 ${borderColor} overflow-hidden bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
        isBaseRest ? "border-muted bg-muted/30" : "border-border"
      }`}
    >
      <div className="p-5">
        {/* Header: time badge + type icon */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${timeConfig.color}`}>
            {timeConfig.icon}
            {timeConfig.label}
          </span>
          {!isBaseRest && (
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.fg}`}
              style={{ background: `radial-gradient(circle at 30% 30%, ${typeConfig.from}, ${typeConfig.to})` }}
            >
              {typeConfig.icon}
            </div>
          )}
        </div>

        {/* Name */}
        {swapping ? (
          <Skeleton className="h-7 w-48 mb-1" />
        ) : (
          <h3 className="font-serif text-xl font-bold text-foreground mb-0.5 leading-tight">
            {activity.name}
          </h3>
        )}

        {/* Type + cost range */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-muted-foreground">
            {activity.type?.includes("·") ? activity.type.split("·").pop()?.trim() : activity.type}
          </p>
          {!isBaseRest && (
            <span className="text-xs font-medium text-muted-foreground border border-border/60 bg-muted/50 px-2.5 py-0.5 rounded-full">
              {activity.costRange}
            </span>
          )}
        </div>

        {/* Address */}
        {!isBaseRest && activity.address ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name + " " + activity.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
          >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {activity.address}
          </a>
        ) : (
          <div className="mb-3" />
        )}

        {/* Description */}
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

        {/* Why this for you — gold left-border blockquote */}
        {!swapping && !isBaseRest && activity.whyForYou && (
          <div className="border-l-2 border-accent pl-3 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Why we picked this for you
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {activity.whyForYou}
            </p>
          </div>
        )}

        {/* Footer: swap + skip */}
        {!isBaseRest && (
          <div className="pt-3 border-t border-border/60">
            {swapped && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                <span className="text-primary font-medium mr-1.5">Swapped</span>
                · Original: <span className="font-medium text-foreground/70">{block.primary.name}</span>
                <span className="ml-1.5">· {block.primary.costRange}</span>
              </p>
            )}
            <div className="flex items-center gap-2">
              {block.backup.name && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSwap}
                  disabled={swapping}
                  className={`gap-1.5 text-xs rounded-full border border-dashed ${
                    swapped ? "border-primary/50 text-primary hover:bg-primary/5" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-testid={`button-swap-d${dayNumber}-${index}`}
                >
                  <RefreshCw className={`w-3 h-3 ${swapping ? "animate-spin" : ""}`} />
                  {swapped ? "Swap back" : "Swap"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRested(true)}
                className="gap-1.5 text-xs rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                data-testid={`button-rest-d${dayNumber}-${index}`}
              >
                <Coffee className="w-3 h-3" />
                Skip
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
