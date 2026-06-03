import type { ActivityDefinition } from "../../types";
import { PhotosActivity } from "./PhotosActivity";

export const photosActivity: ActivityDefinition = {
  id: "photos",
  title: "Mes Photos",
  icon: "camera",
  colors: {
    primary: "#FF6F00",
    secondary: "#E65100",
  },
  component: PhotosActivity,
  sounds: [],
};
