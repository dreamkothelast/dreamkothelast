import type { ActivityDefinition } from "../../types";
import { MemoryActivity } from "./MemoryActivity";

export const memoryActivity: ActivityDefinition = {
  id: "memory",
  title: "Les Paires",
  icon: "🧩",
  colors: {
    primary: "#FFE88C",   // soleil clair
    secondary: "#FFD23F", // soleil
  },
  component: MemoryActivity,
  sounds: [],             // sons générés via Web Audio API
};
