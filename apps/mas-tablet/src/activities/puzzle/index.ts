import type { ActivityDefinition } from "../../types";
import { PuzzleActivity } from "./PuzzleActivity";

export const puzzleActivity: ActivityDefinition = {
  id: "puzzle",
  title: "Puzzle Photo",
  icon: "puzzle",
  colors: {
    primary: "#1E88E5",   // bleu vif
    secondary: "#0D47A1", // bleu marine
  },
  component: PuzzleActivity,
  sounds: [],             // sons générés via Web Audio API
};
