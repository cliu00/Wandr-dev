import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Bookmark, Calendar, Users, User, Handshake, Baby,
  ArrowRight, Plus, MapPin, Clock, Pencil, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";
import { MOCK_SAVED_TRIPS, SavedTrip, TripStatus } from "@/lib/mock-data";

const GROUP_TYPE_LABEL: Record<string, string> = {
  solo: "Solo",
  duo: "Duo",
  group: "Group",
  family: "Family",
};

const GROUP_TYPE_ICON: Record<string, React.ReactNode> = {
  solo: <User className="w-3 h-3" />,
  duo: <Handshake className="w-3 h-3" />,
  group: <Users className="w-3 h-3" />,
  family: <Baby className="w-3 h-3" />,
};

const STATUS_CONFIG: Record<TripStatus, { label: string; className: string }> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  past: {
    label: "Past adventure",
    className: "bg-muted text-muted-foreground border border-border",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  },
};

function TripCard({ trip }: { trip: SavedTrip }) {
  const [, navigate] = useLocation();
  const status = STATUS_CONFIG[trip.status];

  return (
    <div
      className="flex flex-col sm:flex-row gap-0 rounded-2xl border border-border bg-card overflow-hidden"
      data-testid={`card-trip-${trip.id}`}
    >
      {/* Image */}
      <div className="relative sm:w-52 h-44 sm:h-auto flex-shrink-0">
        <img
          src={trip.imageUrl}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        {trip.status === "past" && (
          <div className="absolute inset-0 bg-black/25" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-5">
        <div>
          {/* Status + group type badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {GROUP_TYPE_ICON[trip.groupType]}
              {GROUP_TYPE_LABEL[trip.groupType]}
            </span>
          </div>

          {/* Destination */}
          <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">
            {trip.destination}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 mb-3">{trip.tagline}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {trip.status !== "draft" && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {trip.startDate} – {trip.endDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {trip.durationDays} {trip.durationDays === 1 ? "day" : "days"}
            </span>
            {trip.companions && trip.companions.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {trip.companions.join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="mt-4 flex items-center gap-2">
          {trip.status === "draft" ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => navigate("/intake")}
              data-testid={`button-continue-draft-${trip.id}`}
            >
              <Pencil className="w-3 h-3" />
              Continue planning
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => navigate(`/itinerary/${trip.itineraryId}`)}
              data-testid={`button-view-trip-${trip.id}`}
            >
              View itinerary
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
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
  const [activeTab, setActiveTab] = useState<"all" | TripStatus>("all");

  const firstName = user?.name?.split(" ")[0] ?? "Wanderer";

  const tabs: { key: "all" | TripStatus; label: string }[] = [
    { key: "all", label: "All trips" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "draft", label: "Drafts" },
  ];

  const filtered = activeTab === "all"
    ? MOCK_SAVED_TRIPS
    : MOCK_SAVED_TRIPS.filter((t) => t.status === activeTab);

  const upcoming = MOCK_SAVED_TRIPS.filter((t) => t.status === "upcoming");
  const past = MOCK_SAVED_TRIPS.filter((t) => t.status === "past");
  const drafts = MOCK_SAVED_TRIPS.filter((t) => t.status === "draft");

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main id="main-content" className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light text-foreground">
              {firstName}'s adventures
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {MOCK_SAVED_TRIPS.length} saved{" "}
              {MOCK_SAVED_TRIPS.length === 1 ? "itinerary" : "itineraries"}
              {upcoming.length > 0 && ` · ${upcoming.length} upcoming`}
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full gap-1.5 flex-shrink-0"
            onClick={() => navigate("/intake")}
            data-testid="button-plan-new"
          >
            <Plus className="w-4 h-4" />
            Plan new trip
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Upcoming", value: upcoming.length, status: "upcoming" as TripStatus },
            { label: "Past adventures", value: past.length, status: "past" as TripStatus },
            { label: "Drafts", value: drafts.length, status: "draft" as TripStatus },
          ].map(({ label, value, status }) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`p-4 rounded-2xl border text-left transition-colors ${
                activeTab === status
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
              data-testid={`button-stat-${status}`}
            >
              <p className="text-2xl font-serif font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map(({ key, label }) => {
            const count = key === "all"
              ? MOCK_SAVED_TRIPS.length
              : MOCK_SAVED_TRIPS.filter((t) => t.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 px-1 mr-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${key}`}
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Trip list */}
        {filtered.length === 0 ? (
          <EmptyState
            label={
              activeTab === "upcoming"
                ? "No upcoming trips yet. Plan your next adventure."
                : activeTab === "draft"
                ? "No drafts in progress."
                : "No past trips on record."
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 border border-dashed border-border rounded-3xl p-8 text-center">
          <MapPin className="w-6 h-6 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-light text-foreground mb-1">
            Ready for your next adventure?
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Wandr builds a personalised itinerary around your travel style in under a minute.
          </p>
          <Button
            className="rounded-full gap-1.5"
            onClick={() => navigate("/intake")}
            data-testid="button-plan-cta"
          >
            Plan My Adventure
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
