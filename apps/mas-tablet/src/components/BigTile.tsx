import type { ActivityDefinition } from "../types";

interface BigTileProps {
  activity: ActivityDefinition;
  onClick: () => void;
  tabIndex?: number;
}

/**
 * Tuile de l'écran d'accueil — grande cible tactile, gros picto + nom.
 * Navigation clavier (switch) : tabIndex ordonné, focus visible très marqué.
 */
export function BigTile({ activity, onClick, tabIndex = 0 }: BigTileProps) {
  return (
    <button
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={`Jouer à ${activity.title}`}
      className={[
        "relative flex flex-col items-center justify-center gap-4",
        "min-w-[200px] min-h-[200px] p-6",
        "rounded-mas-2xl border-[5px]",
        "font-masque font-bold text-brun text-2xl text-center",
        "cursor-pointer select-none",
        "transition-all duration-300",
        "shadow-tuile active:scale-95 active:shadow-tuile-press",
        // Focus marqué pour accès contacteur (espace ou entrée)
        "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun focus-visible:ring-offset-4 focus-visible:ring-offset-creme",
        "hover:scale-[1.03] hover:brightness-105",
        // Squash & stretch au clic (CSS : pas de motion si reduced-motion)
        "motion-safe:active:scale-90",
      ].join(" ")}
      style={{
        backgroundColor: activity.colors.primary,
        borderColor: activity.colors.secondary,
      }}
    >
      {/* Picto ou emoji */}
      <span
        className="text-7xl leading-none select-none motion-safe:animate-[float_3s_ease-in-out_infinite]"
        role="img"
        aria-hidden="true"
      >
        {activity.icon}
      </span>

      {/* Nom de l'activité */}
      <span className="leading-tight max-w-[180px] text-brun drop-shadow-sm">
        {activity.title}
      </span>

      {/* Ombre cel-shading bas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 rounded-b-[2.3rem] opacity-20"
        style={{ backgroundColor: activity.colors.secondary }}
      />
    </button>
  );
}
