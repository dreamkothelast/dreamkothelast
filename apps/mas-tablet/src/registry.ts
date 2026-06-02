import type { ActivityDefinition } from "./types";
import { sensoryActivity } from "./activities/sensory";
import { memoryActivity } from "./activities/memory";
import { musicalActivity } from "./activities/musical";
import { puzzleActivity } from "./activities/puzzle";
import { scenesActivity } from "./activities/scenes";
import { douleurActivity } from "./activities/douleur";

/**
 * Registre central des activités.
 * Ajouter une activité : créer son dossier + l'importer ici.
 * L'Accueil se régénère automatiquement.
 */
export const ACTIVITIES: ActivityDefinition[] = [
  sensoryActivity,   // 🫧 Bulles Magiques
  memoryActivity,    // 🃏 Les Paires
  musicalActivity,   // 🎵 Jeu Musical
  puzzleActivity,    // 🧩 Puzzle Photo
  scenesActivity,    // 🌿 Scènes Visuelles
  douleurActivity,   // 🤗 Comment je me sens ?
];
