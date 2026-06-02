import type { ActivityDefinition } from "../../types";
import { SensoryActivity } from "./SensoryActivity";

export const sensoryActivity: ActivityDefinition = {
  id: "sensory",
  title: "Bulles Magiques",
  icon: "🫧",
  colors: {
    primary: "#29B6F6",   // bleu ciel vif
    secondary: "#0277BD", // bleu profond
  },
  component: SensoryActivity,
  sounds: [],             // sons générés via Web Audio API
};
