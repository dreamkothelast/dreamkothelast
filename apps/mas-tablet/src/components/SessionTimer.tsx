import type { TimerPhase } from "../hooks/useSessionTimer";

interface SessionTimerProps {
  label: string;
  phase: TimerPhase;
  isActive: boolean;
}

/**
 * Affichage discret du minuteur de session (haut-droit).
 * Jamais anxiogène : petit, sobre, change de couleur en pré-alerte.
 */
export function SessionTimer({ label, phase, isActive }: SessionTimerProps) {
  if (!isActive) return null;

  const isAlert = phase === "pre-alert";

  return (
    <div
      className={[
        "fixed top-4 right-4 z-50",
        "px-4 py-2 rounded-mas border-2",
        "font-masque font-semibold text-lg select-none",
        "shadow-tuile transition-all duration-500",
        isAlert
          ? "bg-soleil-clair border-soleil text-brun animate-pulse"
          : "bg-creme border-brun/20 text-brun/60",
      ].join(" ")}
      aria-live="off"
      aria-label={`Temps restant : ${label}`}
    >
      <span className="text-base mr-1" role="img" aria-hidden>⏱</span>
      {label}
    </div>
  );
}
