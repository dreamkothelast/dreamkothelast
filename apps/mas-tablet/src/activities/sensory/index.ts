import type { ActivityDefinition } from "../../types";
import { SensoryActivity } from "./SensoryActivity";

export const sensoryActivity: ActivityDefinition = {
  id: "sensory",
  title: "Bulles Magiques",
  icon: "🫧",
  colors: {
    primary: "#C5E9F8",   // ciel clair
    secondary: "#3DA8D8", // ciel foncé
  },
  component: SensoryActivity,
  sounds: [],             // Pas de fichiers audio : sons générés via Web Audio API
};
