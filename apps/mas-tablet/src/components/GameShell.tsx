import { useRef, useCallback, useEffect, type ReactNode } from "react";
import { HomeButton } from "./HomeButton";
import { SessionTimer } from "./SessionTimer";
import type { TimerPhase } from "../hooks/useSessionTimer";

interface GameShellProps {
  children: ReactNode;
  onHome: () => void;
  onOpenCompanion: () => void;
  timerLabel: string;
  timerPhase: TimerPhase;
  timerActive: boolean;
  bgColor?: string;   // classe Tailwind ou chaîne CSS inline
}

/**
 * Enveloppe commune à chaque activité.
 * Fournit : bouton Accueil, minuteur, zone d'accès au panneau accompagnant.
 *
 * Zone accompagnant : appui long 1,5 s sur le coin bas-droit (invisible).
 * Accessible aussi par Shift+F10 (alternative clavier).
 */
export function GameShell({
  children,
  onHome,
  onOpenCompanion,
  timerLabel,
  timerPhase,
  timerActive,
  bgColor = "bg-creme",
}: GameShellProps) {
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hotZoneRef = useRef<HTMLDivElement>(null);

  // Démarrage de l'appui long (tactile et souris)
  const startLongPress = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      onOpenCompanion();
    }, 1500);
  }, [onOpenCompanion]);

  const cancelLongPress = useCallback(() => {
    if (longPressRef.current !== null) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  // Raccourci clavier Shift+F10 pour l'accompagnant.
  // Attaché au niveau document pour fonctionner quel que soit l'élément focusé
  // (robuste pour l'accès clavier/contacteur, même juste après une navigation).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "F10") {
        e.preventDefault();
        onOpenCompanion();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onOpenCompanion]);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden ${bgColor}`}
    >
      {/* Bouton Accueil — haut-gauche, fixe, toujours visible */}
      <HomeButton onClick={onHome} />

      {/* Minuteur — haut-droit, discret */}
      <SessionTimer label={timerLabel} phase={timerPhase} isActive={timerActive} />

      {/* Contenu de l'activité */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Zone invisible bas-droit : déclencheur appui long accompagnant */}
      <div
        ref={hotZoneRef}
        className="fixed bottom-0 right-0 w-[100px] h-[100px] z-40 cursor-pointer"
        aria-hidden="true"
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        role="none"
      />

      {/* Indicateur discret de la zone accompagnant */}
      <div
        className="fixed bottom-2 right-2 w-6 h-6 rounded-full bg-brun/10 pointer-events-none z-30"
        aria-hidden="true"
      />
    </div>
  );
}
