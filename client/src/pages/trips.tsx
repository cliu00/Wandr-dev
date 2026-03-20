import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, Plus, Compass, Loader2, Calendar, Clock, Users, User, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TripSummary {
  id: string;
  destination: string;
  tripName: string | null;
  groupType: string;
  durationDays: number;
  startDate: string | null;
  endDate: string | null;
  tripVibe: string | null;
  createdAt: string;
}

const GROUP_TYPE_LABEL: Record<string, string> = {
  solo: "Solo",
  duo: "Duo",
  group: "Group",
  family: "Family",
};

function tripStatus(startDate: string | null, endDate: string | null): "upcoming" | "past" | "recent" {
  if (!startDate) return "recent";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + "T00:00:00");
  const end = endDate ? new Date(endDate + "T00:00:00") : start;
  if (start > today) return "upcoming";
  if (end < today) return "past";
  return "upcoming"; // happening now — treat as upcoming
}

function formatDateRange(startDate: string | null, endDate: string | null): string | null {
  if (!startDate) return null;
  const fmt = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!endDate || endDate === startDate) return fmt(startDate);
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate + "T12:00:00");
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.getDate()}`;
  }
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function TripCard({ trip }: { trip: TripSummary }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const title = trip.tripName || trip.destination;

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      queryClient.invalidateQueries({ queryKey: ["user-trips"] });
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      data-testid={`card-trip-${trip.id}`}
    >
      <div className="flex flex-col justify-between p-5 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {trip.groupType === "group" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {GROUP_TYPE_LABEL[trip.groupType] ?? trip.groupType}
              </span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">
              {title}
            </h3>
            {trip.tripVibe && (
              <p className="text-sm text-muted-foreground mt-0.5 italic">{trip.tripVibe}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              {dateRange && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {dateRange}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {trip.durationDays} {trip.durationDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          {/* Delete button */}
          {confirmDelete ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full text-xs h-7 px-3 gap-1"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Delete
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors flex-shrink-0"
              aria-label="Delete trip"
              data-testid={`button-delete-trip-${trip.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <Button
            size="sm"
            className="rounded-full gap-1.5 text-xs"
            onClick={() => navigate(`/itinerary/${trip.id}`)}
            data-testid={`button-view-trip-${trip.id}`}
          >
            View itinerary
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-border rounded-2xl">
      <Compass className="w-8 h-8 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

type Tab = "upcoming" | "past";

export default function Trips() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-trips"],
    queryFn: async () => {
      const res = await fetch("/api/trips");
      if (!res.ok) throw new Error("Failed to load trips");
      return res.json() as Promise<{ trips: TripSummary[] }>;
    },
    enabled: !!user,
  });

  const allTrips: TripSummary[] = data?.trips ?? [];
  const upcoming = allTrips.filter((t) => tripStatus(t.startDate, t.endDate) !== "past");
  const past = allTrips.filter((t) => tripStatus(t.startDate, t.endDate) === "past");

  const firstName = user?.name?.split(" ")[0] ?? "Wanderer";

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past",     label: "Past",     count: past.length },
  ];

  const visibleTrips = activeTab === "upcoming" ? upcoming : past;

  const emptyLabels: Record<Tab, string> = {
    upcoming: "No upcoming trips. Plan one now.",
    past: "No past adventures yet.",
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main id="main-content" className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light text-foreground">
              {firstName}'s adventures
            </h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {allTrips.length} saved {allTrips.length === 1 ? "itinerary" : "itineraries"}
              </p>
            )}
          </div>
          <Button
            size="sm"
            className="rounded-full gap-1.5 flex-shrink-0"
            onClick={() => navigate("/")}
            data-testid="button-plan-new"
          >
            <Plus className="w-4 h-4" />
            Plan new trip
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Couldn't load your trips. Try refreshing.
          </div>
        )}

        {!isLoading && !isError && allTrips.length === 0 && (
          <EmptyState label="No saved trips yet. Plan your first adventure below." />
        )}

        {!isLoading && !isError && allTrips.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 pb-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {visibleTrips.length === 0 ? (
              <EmptyState label={emptyLabels[activeTab]} />
            ) : (
              <div className="flex flex-col gap-4">
                {visibleTrips.map((t) => <TripCard key={t.id} trip={t} />)}
              </div>
            )}
          </>
        )}

        {allTrips.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              data-testid="button-plan-cta"
            >
              Plan another trip
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
