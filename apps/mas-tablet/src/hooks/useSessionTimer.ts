import { useState, useEffect, useRef, useCallback } from "react";

export type TimerPhase = "idle" | "running" | "pre-alert" | "ended";

export function useSessionTimer(
  durationMinutes: number | null,
  onPreAlert: () => void,
  onEnd: () => void
) {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [remaining, setRemaining] = useState(0); // secondes
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Garde des références stables pour les callbacks
  const onPreAlertRef = useRef(onPreAlert);
  const onEndRef = useRef(onEnd);
  onPreAlertRef.current = onPreAlert;
  onEndRef.current = onEnd;

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (!durationMinutes) return;
    clearTimer();
    setRemaining(durationMinutes * 60);
    setPhase("running");
  }, [durationMinutes]);

  const stop = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setRemaining(0);
  }, []);

  useEffect(() => {
    if (phase !== "running" && phase !== "pre-alert") {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setPhase("ended");
          clearTimer();
          onEndRef.current();
          return 0;
        }
        // Pré-alerte à 60 secondes restantes
        if (next === 60 && phase === "running") {
          setPhase("pre-alert");
          onPreAlertRef.current();
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [phase]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const isActive = phase === "running" || phase === "pre-alert";

  return { phase, remaining, label, isActive, start, stop };
}
