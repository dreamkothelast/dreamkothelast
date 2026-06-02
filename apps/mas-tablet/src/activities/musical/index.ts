import type { ActivityDefinition } from "../../types";
import { MusicalActivity } from "./MusicalActivity";

export const musicalActivity: ActivityDefinition = {
  id: "musical",
  title: "Jeu Musical",
  icon: "🎵",
  colors: {
    primary: "#AB47BC",   // violet doux
    secondary: "#6A1B9A", // violet profond
  },
  component: MusicalActivity,
  sounds: [],             // sons générés via Web Audio API
};
