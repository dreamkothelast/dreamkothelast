import { useEffect } from "react";
import { BigTile } from "../components/BigTile";
import { Mascot } from "../components/Mascot";
import { ACTIVITIES } from "../registry";
import type { ActivityDefinition } from "../types";
import { useAudio } from "../hooks/useAudio";

interface HomeScreenProps {
  onSelectActivity: (id: string) => void;
  volume: number;
  reducedMotion: boolean;
}

/**
 * Écran d'accueil — grandes tuiles, mascotte, navigation linéaire.
 * Les tuiles sont générées automatiquement depuis le registre.
 * tabIndex ordonné pour compatibilité balayage switch.
 */
export function HomeScreen({ onSelectActivity, volume, reducedMotion }: HomeScreenProps) {
  const { playClick } = useAudio(volume);

  // Focus auto sur la première tuile au montage (accès switch)
  useEffect(() => {
    const first = document.querySelector<HTMLElement>("nav button");
    first?.focus();
  }, []);

  const handleSelect = (activity: ActivityDefinition) => {
    playClick();
    onSelectActivity(activity.id);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-10 px-8 py-8 bg-creme">
      {/* En-tête avec mascotte */}
      <div className="flex items-center gap-6">
        <Mascot
          state="idle"
          size={reducedMotion ? 0 : 160}
          className={reducedMotion ? "hidden" : ""}
        />
        <div className="text-center">
          <h1 className="font-masque font-bold text-brun text-5xl leading-tight">
            MAS Tablette
          </h1>
          <p className="font-masque text-brun/60 text-2xl mt-1">
            Choisis ton activité 👇
          </p>
        </div>
        <Mascot
          state="wave"
          size={reducedMotion ? 0 : 160}
          className={reducedMotion ? "hidden" : ""}
        />
      </div>

      {/* Grille de tuiles — responsive selon le nombre d'activités */}
      <nav
        aria-label="Activités disponibles"
        className={[
          "grid gap-8 w-full max-w-[1400px]",
          ACTIVITIES.length <= 2
            ? "grid-cols-2"
            : ACTIVITIES.length <= 4
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-3 lg:grid-cols-5",
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
      <p className="font-masque text-brun/30 text-lg mt-2 text-center select-none">
        Réglages : maintenir le coin bas-droit · Shift+F10
      </p>
    </div>
  );
}
