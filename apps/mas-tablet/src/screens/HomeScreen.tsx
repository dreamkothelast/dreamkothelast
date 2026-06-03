import { useEffect } from "react";
import { BigTile } from "../components/BigTile";
import { Mascot } from "../components/Mascot";
import { ACTIVITIES } from "../registry";
import type { ActivityDefinition } from "../types";
import { useAudio } from "../hooks/useAudio";
import { APP_NAME, APP_TAGLINE } from "../appName";

interface HomeScreenProps {
  onSelectActivity: (id: string) => void;
  volume: number;
  reducedMotion: boolean;
}

/**
 * Écran d'accueil — fond bleu dégradé style Grid 3, grandes tuiles, mascotte.
 * tabIndex ordonné pour compatibilité balayage switch.
 */
export function HomeScreen({ onSelectActivity, volume, reducedMotion }: HomeScreenProps) {
  const { playClick } = useAudio(volume);

  useEffect(() => {
    const first = document.querySelector<HTMLElement>("nav button");
    first?.focus();
  }, []);

  const handleSelect = (activity: ActivityDefinition) => {
    playClick();
    onSelectActivity(activity.id);
  };

  return (
    <div
      className="mas-scroll flex flex-col items-center justify-center w-full h-full gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-6"
      style={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 25%, #1565c0 60%, #0288d1 100%)",
        paddingTop: "max(1rem, var(--safe-top))",
        paddingBottom: "max(1rem, var(--safe-bottom))",
        paddingLeft: "max(1rem, var(--safe-left))",
        paddingRight: "max(1rem, var(--safe-right))",
      }}
    >
      {/* En-tête compact — mascotte masquée sur très petits écrans */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <Mascot
          state="wave"
          size={reducedMotion ? 0 : 100}
          className={reducedMotion ? "hidden" : "hidden sm:block drop-shadow-2xl"}
        />
        <div className="text-center">
          <h1 className="font-masque font-bold text-white text-2xl sm:text-4xl leading-tight drop-shadow-lg">
            {APP_NAME}
          </h1>
          <p className="font-masque text-white/75 text-base sm:text-xl mt-0.5 drop-shadow">
            {APP_TAGLINE}
          </p>
        </div>
      </div>

      {/* Grille de tuiles — 2 colonnes (téléphone) → 3 → 4 (tablette/PC) */}
      <nav
        aria-label="Activités disponibles"
        className={[
          "grid gap-3 sm:gap-5 lg:gap-6 w-full",
          "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          ACTIVITIES.length <= 2
            ? "max-w-[900px]"
            : ACTIVITIES.length <= 6
            ? "max-w-[1200px]"
            : "max-w-[1400px]",
        ].join(" ")}
      >
        {ACTIVITIES.map((activity, idx) => (
          <BigTile
            key={activity.id}
            activity={activity}
            onClick={() => handleSelect(activity)}
            tabIndex={idx + 1}
          />
        ))}
      </nav>

      {/* Indication discrète pour les accompagnants */}
      <p className="font-masque text-white/30 text-sm sm:text-lg mt-1 sm:mt-2 text-center select-none shrink-0">
        Réglages : bouton en bas à droite · Shift+F10
      </p>
    </div>
  );
}
