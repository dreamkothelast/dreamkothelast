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
}

export function GameShell({
  children,
  onHome,
  onOpenCompanion,
  timerLabel,
  timerPhase,
  timerActive,
  bgColor = "bg-creme",
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
      {/* Bouton Accueil — haut-gauche, fixe, toujours visible */}
      <HomeButton onClick={onHome} />

      {/* Minuteur — haut-droit, discret */}
      <SessionTimer label={timerLabel} phase={timerPhase} isActive={timerActive} />

      {/* Contenu de l'activité */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Bouton Réglages — bas-droit, toujours visible, grande cible tactile */}
      <button
        onClick={onOpenCompanion}
        className={[
          "fixed bottom-5 right-5 z-50",
          "min-w-[84px] min-h-[84px] px-4 py-2",
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
        <Icon name="gear" size={32} />
        <span className="text-sm leading-tight">Réglages</span>
      </button>
    </div>
  );
}
