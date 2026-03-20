import { useLocation } from "wouter";
import {
  ArrowRight, Plus, Compass, Loader2, Calendar, Clock, Users, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";

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
  const status = tripStatus(trip.startDate, trip.endDate);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const title = trip.tripName || trip.destination;

  const statusBadge = status === "upcoming"
    ? "bg-primary/10 text-primary border border-primary/20"
    : "bg-muted text-muted-foreground border border-border";
  const statusLabel = status === "upcoming" ? "Upcoming" : "Past adventure";

  return (
    <div
      className="flex flex-col gap-0 rounded-2xl border border-border bg-card overflow-hidden"
      data-testid={`card-trip-${trip.id}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Destination initial block */}
        <div className="sm:w-52 h-32 sm:h-auto flex-shrink-0 bg-primary/8 flex items-center justify-center">
          <span className="font-serif text-5xl font-light text-primary/40 select-none">
            {trip.destination.charAt(0)}
          </span>
        </div>

        <div className="flex flex-col justify-between flex-1 p-5">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>
                {statusLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {trip.groupType === "group" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {GROUP_TYPE_LABEL[trip.groupType] ?? trip.groupType}
              </span>
            </div>

            <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">
              {title}
            </h3>
            {trip.tripVibe && (
              <p className="text-sm text-muted-foreground mt-0.5 mb-3 italic">{trip.tripVibe}</p>
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

          <div className="mt-4">
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

export default function Trips() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

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
  const upcoming = allTrips.filter((t) => tripStatus(t.startDate, t.endDate) === "upcoming");
  const past = allTrips.filter((t) => tripStatus(t.startDate, t.endDate) === "past");
  const noDate = allTrips.filter((t) => !t.startDate);

  const firstName = user?.name?.split(" ")[0] ?? "Wanderer";

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
                {upcoming.length > 0 && ` · ${upcoming.length} upcoming`}
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
          <div className="flex flex-col gap-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Upcoming</h2>
                <div className="flex flex-col gap-4">
                  {upcoming.map((t) => <TripCard key={t.id} trip={t} />)}
                </div>
              </section>
            )}
            {noDate.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Recent</h2>
                <div className="flex flex-col gap-4">
                  {noDate.map((t) => <TripCard key={t.id} trip={t} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Past adventures</h2>
                <div className="flex flex-col gap-4">
                  {past.map((t) => <TripCard key={t.id} trip={t} />)}
                </div>
              </section>
            )}
          </div>
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
