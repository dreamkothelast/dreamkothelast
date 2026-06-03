import type { ActivityDefinition } from "../../types";
import { HistoiresActivity } from "./HistoiresActivity";

export const histoiresActivity: ActivityDefinition = {
  id: "histoires",
  title: "Histoires",
  icon: "book",
  colors: {
    primary: "#8E24AA",
    secondary: "#4A148C",
  },
  component: HistoiresActivity,
  sounds: [],
};
