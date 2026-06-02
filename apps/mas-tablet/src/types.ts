import type { ComponentType } from "react";

// Niveaux de difficulté : cause-effet est le plancher, tous les écrans le proposent
export type Difficulty = "cause-effet" | "facile" | "normal";

// Intensité visuelle : doux = animations lentes et peu saturées, vif = plus coloré
export type Intensity = "doux" | "vif";

// Thème d'images pour le jeu d'écoute et le memory
export type ImageTheme = "animaux" | "objets" | "nourriture" | "instruments";

export interface Settings {
  volume: number;                // 0 à 1
  intensity: Intensity;
  timerDuration: number | null;  // minutes, null = minuteur désactivé
  difficulty: Difficulty;
  reducedMotion: boolean;
  theme: ImageTheme;
}

// Contrat commun que chaque activité doit exporter
export interface ActivityProps {
  difficulty: Difficulty;
  intensity: Intensity;
  reducedMotion: boolean;
  volume?: number;               // volume 0-1 (réglage accompagnant)
  onCelebrate: () => void;       // déclenche l'écran de célébration
  onHome: () => void;            // retour accueil direct
}

export interface ActivityDefinition {
  id: string;
  title: string;
  icon: string;                  // emoji ou chemin d'asset image
  colors: {
    primary: string;             // couleur tuile
    secondary: string;           // couleur bordure / ombre
  };
  component: ComponentType<ActivityProps>;
  // Noms des fichiers audio dans src/assets/sounds/ (documenté dans README)
  sounds: string[];
}

// État de navigation de l'application (machine d'état simple)
export type Screen =
  | { type: "home" }
  | { type: "activity"; id: string }
  | { type: "celebration"; fromActivityId: string }
  | { type: "companion" };       // panneau accompagnant (overlay)
