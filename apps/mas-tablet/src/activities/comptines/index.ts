import type { ActivityDefinition } from "../../types";
import { ComptinesActivity } from "./ComptinesActivity";

export const comptinesActivity: ActivityDefinition = {
  id: "comptines",
  title: "Comptines",
  icon: "music-note",
  colors: {
    primary: "#E91E63",
    secondary: "#880E4F",
  },
  component: ComptinesActivity,
  sounds: [],
};
