import type { ActivityDefinition } from "../../types";
import { MemoryActivity } from "./MemoryActivity";

export const memoryActivity: ActivityDefinition = {
  id: "memory",
  title: "Les Paires",
  icon: "cards",
  colors: {
    primary: "#FFA726",   // orange doux
    secondary: "#E65100", // orange profond
  },
  component: MemoryActivity,
  sounds: [],             // sons générés via Web Audio API
};
