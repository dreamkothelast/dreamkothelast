import type { ActivityDefinition } from "../types";

interface BigTileProps {
  activity: ActivityDefinition;
  onClick: () => void;
  tabIndex?: number;
}

/**
 * Tuile de l'écran d'accueil — style Grid 3 :
 * icône centrée sur fond coloré + bande titre en bas plus sombre.
 * Grande cible tactile, texte blanc, ombres profondes.
 */
export function BigTile({ activity, onClick, tabIndex = 0 }: BigTileProps) {
  return (
    <button
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={`Jouer à ${activity.title}`}
      className={[
        "relative flex flex-col items-stretch overflow-hidden",
        "min-h-[220px] w-full",
        "rounded-[2rem]",
        "cursor-pointer select-none",
        "transition-all duration-200",
        "shadow-[0_8px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]",
        "active:scale-95 active:shadow-[0_3px_10px_rgba(0,0,0,0.35)]",
        "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
        "hover:scale-[1.04] hover:shadow-[0_14px_36px_rgba(0,0,0,0.45)]",
      ].join(" ")}
      style={{ backgroundColor: activity.colors.primary }}
    >
      {/* Zone icône — occupe ~65 % de la hauteur */}
      <div className="flex-1 flex items-center justify-center py-8">
        <span
          className="text-[88px] leading-none select-none motion-safe:animate-[float_3s_ease-in-out_infinite]"
          role="img"
          aria-hidden="true"
        >
          {activity.icon}
        </span>
      </div>

      {/* Bande titre — style Grid 3 */}
      <div
        className="px-4 py-4 text-center"
        style={{ backgroundColor: activity.colors.secondary }}
      >
        <span className="font-masque font-bold text-white text-2xl leading-tight drop-shadow-sm">
          {activity.title}
        </span>
      </div>
    </button>
  );
}
