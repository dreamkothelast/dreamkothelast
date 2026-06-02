import type { ActivityDefinition } from "./types";
import { sensoryActivity } from "./activities/sensory";
import { memoryActivity } from "./activities/memory";

/**
 * Registre central des activités.
 *
 * Pour ajouter une 5e activité :
 *   1. Créer src/activities/mon-jeu/index.ts (exporter un ActivityDefinition)
 *   2. Importer ici et ajouter à ACTIVITIES
 *   → L'Accueil se régénère automatiquement, aucun autre fichier à modifier.
 *
 * Phase 1  : Bulles Magiques (sensoriel)
 * Phase 2+ : Memory, Jeu Musical, Jeu d'Écoute
 */
export const ACTIVITIES: ActivityDefinition[] = [
  sensoryActivity,
  memoryActivity,
  // Phase 3 : musicalActivity,
  // Phase 4 : listeningActivity,
];
