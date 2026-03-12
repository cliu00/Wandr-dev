import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";

const MESSAGES = [
  "Scanning local favorites…",
  "Mapping your perfect day…",
  "Finding hidden gems…",
  "Checking the best food spots…",
  "Almost ready…",
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1559511260-4f2f4a89b638?w=1920&q=90";

export default function Generating() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);

  // Cycle messages in phase 1
  useEffect(() => {
    if (phase !== 1) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Animate progress bar
  useEffect(() => {
    const start = Date.now();
    const totalMs = 6000;
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / totalMs) * 100, 100);
      setProgress(pct);
      if (elapsed < totalMs) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 4000);
    const t2 = setTimeout(() => navigate("/itinerary/vancouver-2day"), 6500);
    const t3 = setTimeout(() => setStuck(true), 11000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-2xl">
              <h1 className="font-serif text-6xl md:text-8xl font-bold text-white mb-3 tracking-tight">
                Vancouver
              </h1>
              <p className="text-white/60 text-lg mb-16 tracking-widest uppercase text-sm">
                2-day escape
              </p>

              {/* Animated dots */}
              <div className="flex justify-center items-center gap-1.5 mb-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-white/75 text-lg font-light tracking-wide"
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
            <div className="max-w-2xl mx-auto px-6 py-12">
              {/* Stuck fallback banner — only visible if navigation didn't fire */}
              {stuck && (
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
                      onClick={() => navigate("/itinerary/vancouver-2day")}
                      className="gap-1.5 rounded-full"
                      data-testid="button-go-to-itinerary"
                    >
                      View your itinerary
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Header skeleton */}
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

            {/* Progress Bar Phase 2 */}
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
