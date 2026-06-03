import { useEffect, type ReactNode } from "react";
import { HomeButton } from "./HomeButton";
import { SessionTimer } from "./SessionTimer";
import { Icon } from "./Icon";
import type { TimerPhase } from "../hooks/useSessionTimer";

interface GameShellProps {
  children: ReactNode;
  onHome: () => void;
  onOpenCompanion: () => void;
  timerLabel: string;
  timerPhase: TimerPhase;
  timerActive: boolean;
  bgColor?: string;
  /**
   * Réserve une bande en haut/bas sur petit écran pour que le contenu de
   * l'activité ne passe pas SOUS les boutons flottants Accueil / Réglages.
   * Activé pour les activités, inutile pour l'accueil (contenu centré).
   */
  reserveControls?: boolean;
  /** Affiche le bouton Accueil flottant. Masqué sur l'écran d'accueil (inutile). */
  showHome?: boolean;
}

export function GameShell({
  children,
  onHome,
  onOpenCompanion,
  timerLabel,
  timerPhase,
  timerActive,
  bgColor = "bg-creme",
  reserveControls = false,
  showHome = true,
}: GameShellProps) {
  // Raccourci clavier Shift+F10 pour les accompagnants (clavier/contacteur)
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
      {/* Bouton Accueil — haut-gauche, fixe (masqué sur l'écran d'accueil) */}
      {showHome && <HomeButton onClick={onHome} />}

      {/* Minuteur — haut-droit, discret */}
      <SessionTimer label={timerLabel} phase={timerPhase} isActive={timerActive} />

      {/* Contenu de l'activité — sur mobile, dégage les boutons flottants */}
      <div
        className={[
          "flex-1 flex flex-col min-h-0",
          reserveControls ? "pt-[76px] sm:pt-0" : "",
        ].join(" ")}
      >
        {children}
      </div>

      {/* Bouton Réglages — bas-droit, toujours visible, grande cible tactile */}
      <button
        onClick={onOpenCompanion}
        style={{ bottom: "max(1.25rem, var(--safe-bottom))", right: "max(1.25rem, var(--safe-right))" }}
        className={[
          "fixed z-50",
          "min-w-[64px] min-h-[64px] sm:min-w-[84px] sm:min-h-[84px] px-3 py-2 sm:px-4",
          "flex flex-col items-center justify-center gap-1",
          "bg-creme border-4 border-brun/30 rounded-mas-xl shadow-tuile",
          "font-masque font-bold text-brun text-base",
          "cursor-pointer select-none",
          "transition-all duration-200 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-[5px] focus-visible:ring-soleil",
          "hover:brightness-105",
        ].join(" ")}
        aria-label="Ouvrir les réglages"
      >
        <Icon name="gear" size={32} className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="hidden sm:inline text-sm leading-tight">Réglages</span>
      </button>
    </div>
  );
}
