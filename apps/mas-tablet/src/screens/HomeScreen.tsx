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
      className="flex flex-col items-center justify-center w-full h-full gap-6 px-8 py-6"
      style={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 25%, #1565c0 60%, #0288d1 100%)",
      }}
    >
      {/* En-tête compact */}
      <div className="flex items-center gap-4">
        <Mascot
          state="wave"
          size={reducedMotion ? 0 : 100}
          className={reducedMotion ? "hidden" : "drop-shadow-2xl"}
        />
        <div className="text-center">
          <h1 className="font-masque font-bold text-white text-4xl leading-tight drop-shadow-lg">
            MAS Tablette
          </h1>
          <p className="font-masque text-white/75 text-xl mt-0.5 drop-shadow">
            Choisis ton activité 👇
          </p>
        </div>
      </div>

      {/* Grille de tuiles — s'adapte au nombre d'activités */}
      <nav
        aria-label="Activités disponibles"
        className={[
          "grid gap-6 w-full",
          ACTIVITIES.length <= 2
            ? "grid-cols-2 max-w-[900px]"
            : ACTIVITIES.length <= 4
            ? "grid-cols-4 max-w-[1400px]"
            : ACTIVITIES.length <= 6
            ? "grid-cols-3 max-w-[1200px]"
            : "grid-cols-4 max-w-[1400px]",
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
      <p className="font-masque text-white/30 text-lg mt-2 text-center select-none">
        Réglages : bouton ⚙️ en bas à droite · Shift+F10
      </p>
    </div>
  );
}
