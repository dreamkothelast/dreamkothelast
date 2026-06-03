import type { ActivityDefinition } from "../../types";
import { DouleurActivity } from "./DouleurActivity";

export const douleurActivity: ActivityDefinition = {
  id: "douleur",
  title: "Comment je me sens ?",
  icon: "feeling-hug",
  colors: {
    primary: "#7986CB",   // indigo doux
    secondary: "#3949AB", // indigo foncé
  },
  component: DouleurActivity,
  sounds: [],
};
