import type { ActivityDefinition } from "./types";
import { sensoryActivity } from "./activities/sensory";
import { memoryActivity } from "./activities/memory";
import { musicalActivity } from "./activities/musical";
import { puzzleActivity } from "./activities/puzzle";

/**
 * Registre central des activités.
 * Ajouter une activité : créer son dossier + l'importer ici.
 * L'Accueil se régénère automatiquement.
 *
 * Phase 1 : Bulles Magiques (sensoriel)
 * Phase 2 : Les Paires (memory)
 * Phase 3 : Jeu Musical (Simon)
 * Phase 4 : Puzzle Photo
 */
export const ACTIVITIES: ActivityDefinition[] = [
  sensoryActivity,
  memoryActivity,
  musicalActivity,
  puzzleActivity,
];
