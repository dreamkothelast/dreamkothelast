import type { ActivityDefinition } from "../../types";
import { ScenesActivity } from "./ScenesActivity";

export const scenesActivity: ActivityDefinition = {
  id: "scenes",
  title: "Scènes Visuelles",
  icon: "scene-nature",
  colors: {
    primary: "#2E7D32",   // vert forêt
    secondary: "#1B5E20", // vert profond
  },
  component: ScenesActivity,
  sounds: [],
};
