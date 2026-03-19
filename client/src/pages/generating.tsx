import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { FlowHeader } from "@/components/flow-header";

const MESSAGES = [
  "Mapping hidden gems…",
  "Charting the perfect route…",
  "Finding where locals eat…",
  "Packing in the details…",
  "Almost there…",
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1559511260-4f2f4a89b638?w=1920&q=90";

const GREEN = "hsl(155, 35%, 22%)";
const GOLD  = "#b8965a";

function WandrRouteAnimation() {
  return (
    <div className="flex flex-col items-center gap-0">
      <svg
        viewBox="0 0 80 200"
        width="48"
        height="120"
        fill="none"
        aria-hidden="true"
        overflow="visible"
      >
        {/* Destination dot — gold, fades in near end of draw */}
        <motion.circle
          cx="40"
          cy="16"
          r="7"
          fill={GOLD}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 0, 1.2, 1], opacity: [0, 0, 1, 1] }}
          transition={{
            duration: 3.2,
            times: [0, 0.72, 0.88, 1],
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.6,
          }}
        />

        {/* The wandering path — draws itself */}
        <motion.path
          d="M40 184 C40 155 16 148 16 120 C16 92 64 84 64 56 C64 38 40 26 40 16"
          stroke={GREEN}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{
            duration: 3.2,
            times: [0, 0.75, 0.88, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.6,
          }}
        />

        {/* Origin dot — green, steady pulse */}
        <motion.circle
          cx="40"
          cy="184"
          r="7"
          fill={GREEN}
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small inner highlight on origin dot */}
        <circle cx="40" cy="184" r="3" fill="white" opacity="0.4" />
      </svg>

      {/* Wordmark beneath the route mark */}
      <motion.p
        className="font-serif text-white/90 text-xl tracking-[0.3em] uppercase mt-3 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Wandr
      </motion.p>
    </div>
  );
}

export default function Generating() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const groupType = new URLSearchParams(search).get("groupType") || "solo";
  const [phase, setPhase] = useState<1 | 2>(1);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 1) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      // Progress bar fills to 90% while waiting for API, jumps to 100% on success
      const pct = Math.min((elapsed / 15000) * 90, 90);
      setProgress(pct);
      if (pct < 90) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  // Handles both solo (POST /api/trips/create) and group (tripId already exists) flows
  useEffect(() => {
    const groupPendingTripId = sessionStorage.getItem("wandr_group_pending_trip_id");
    const raw = sessionStorage.getItem("wandr_pending_preferences");

    // Group flow — tripId already created by POST /api/groups/:id/generate
    if (groupPendingTripId) {
      sessionStorage.removeItem("wandr_group_pending_trip_id");
      setTripId(groupPendingTripId);
      const t1 = setTimeout(() => setPhase(2), 4000);
      const stuckTimeout = setTimeout(() => setStuck(true), 60000);
      let cancelled = false;

      const pollInterval = setInterval(async () => {
        if (cancelled) return;
        try {
          const r = await fetch(`/api/trips/${groupPendingTripId}`);
          const payload = await r.json();
          if (payload.status === "ready") {
            clearInterval(pollInterval);
            clearTimeout(stuckTimeout);
            setProgress(100);
            setTimeout(() => navigate(`/itinerary/${groupPendingTripId}`), 800);
          } else if (payload.status === "failed") {
            clearInterval(pollInterval);
            clearTimeout(stuckTimeout);
            setError("generation_failed");
          }
        } catch { /* keep polling */ }
      }, 2000);

      return () => {
        cancelled = true;
        clearTimeout(t1);
        clearInterval(pollInterval);
        clearTimeout(stuckTimeout);
      };
    }

    // Solo flow — POST preferences to create trip, then poll
    if (!raw) {
      navigate("/intake");
      return;
    }

    const preferences = JSON.parse(raw);
    const t1 = setTimeout(() => setPhase(2), 4000);
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let stuckTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    fetch("/api/trips/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    })
      .then((res) => {
        if (res.status === 429) throw new Error("limit_reached");
        if (!res.ok) throw new Error("generation_failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const id = data.tripId as string;
        setTripId(id);
        sessionStorage.removeItem("wandr_pending_preferences");

        // Start polling GET /api/trips/:id until status === "ready"
        stuckTimeout = setTimeout(() => setStuck(true), 60000);

        pollInterval = setInterval(async () => {
          if (cancelled) return;
          try {
            const r = await fetch(`/api/trips/${id}`);
            const payload = await r.json();

            if (payload.status === "ready") {
              clearInterval(pollInterval!);
              clearTimeout(stuckTimeout!);
              setProgress(100);
              setTimeout(() => navigate(`/itinerary/${id}`), 800);
            } else if (payload.status === "failed") {
              clearInterval(pollInterval!);
              clearTimeout(stuckTimeout!);
              setError("generation_failed");
            }
            // status === "generating" → keep polling
          } catch {
            // network hiccup — keep polling
          }
        }, 2000);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      clearTimeout(t1);
      if (pollInterval) clearInterval(pollInterval);
      if (stuckTimeout) clearTimeout(stuckTimeout);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 1 ? (
          <motion.div
            key="phase1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            />
            <div className="absolute inset-0 bg-black/62" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg gap-10">
              {/* Branded route animation */}
              <WandrRouteAnimation />

              {/* Destination title */}
              <div>
                <h1 className="font-serif text-5xl md:text-6xl font-light text-white mb-1.5 tracking-wide">
                  Vancouver
                </h1>
                <p className="text-white/50 text-xs tracking-[0.25em] uppercase">
                  2-day adventure
                </p>
              </div>

              {/* Cycling status message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="text-white/60 text-sm font-light tracking-wide"
                >
                  {MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <div
                className="h-full bg-accent transition-all duration-100 ease-linear"
                style={{ width: `${Math.min(progress, 75)}%` }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="phase2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background overflow-y-auto"
          >
            <FlowHeader onBack={() => navigate("/")} />
            <div className="max-w-2xl mx-auto px-6 py-8">
              {error === "limit_reached" && (
                <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Generation limit reached
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                      Sign up for a free account to generate unlimited itineraries.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/sign-up")}
                      className="gap-1.5 rounded-full"
                    >
                      Create a free account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {error === "generation_failed" && (
                <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                      Something went wrong
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                      We couldn't generate your itinerary. Please try again.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/intake")}
                      className="gap-1.5 rounded-full"
                    >
                      Try again
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {stuck && !error && tripId && (
                <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Taking longer than expected
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                      Your itinerary is ready — the page may not have navigated automatically.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/itinerary/${tripId}`)}
                      className="gap-1.5 rounded-full"
                      data-testid="button-go-to-itinerary"
                    >
                      View your itinerary
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center mb-10">
                <Skeleton className="h-8 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>

              {[1, 2].map((day) => (
                <div key={day} className="mb-10">
                  <Skeleton className="h-7 w-24 mb-5" />
                  {[1, 2, 3].map((block) => (
                    <div key={block} className="mb-4 rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </div>
                      <Skeleton className="h-36 w-full rounded-xl mb-4" />
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-muted">
              <div
                className="h-full bg-accent transition-all duration-100 ease-linear"
                style={{ width: `${Math.max(progress, 75)}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
