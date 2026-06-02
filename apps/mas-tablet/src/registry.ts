import type { ActivityDefinition } from "./types";
import { sensoryActivity } from "./activities/sensory";
import { memoryActivity } from "./activities/memory";
import { musicalActivity } from "./activities/musical";
import { puzzleActivity } from "./activities/puzzle";
import { scenesActivity } from "./activities/scenes";
import { douleurActivity } from "./activities/douleur";
import { photosActivity } from "./activities/photos";
import { comptinesActivity } from "./activities/comptines";

export const ACTIVITIES: ActivityDefinition[] = [
  sensoryActivity,    // 🫧 Bulles Magiques
  memoryActivity,     // 🃏 Les Paires
  musicalActivity,    // 🎵 Jeu Musical
  puzzleActivity,     // 🧩 Puzzle Photo
  scenesActivity,     // 🌿 Scènes Visuelles
  douleurActivity,    // 🤗 Comment je me sens ?
  photosActivity,     // 📷 Mes Photos
  comptinesActivity,  // 🎵 Comptines
];
