import type { ActivityDefinition } from "./types";
import { sensoryActivity } from "./activities/sensory";
import { memoryActivity } from "./activities/memory";
import { musicalActivity } from "./activities/musical";

/**
 * Registre central des activités.
 *
 * Pour ajouter une 5e activité :
 *   1. Créer src/activities/mon-jeu/index.ts (exporter un ActivityDefinition)
 *   2. Importer ici et ajouter à ACTIVITIES
 *   → L'Accueil se régénère automatiquement, aucun autre fichier à modifier.
 *
 * Phase 1 : Bulles Magiques (sensoriel)
 * Phase 2 : Les Paires (memory)
 * Phase 3 : Jeu Musical (Simon)
 * Phase 4 : Jeu d'Écoute (roadmap)
 */
export const ACTIVITIES: ActivityDefinition[] = [
  sensoryActivity,
  memoryActivity,
  musicalActivity,
  // Phase 4 : listeningActivity,
];
