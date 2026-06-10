// Point d'entrée de l'engine — logique de jeu pure, zéro dépendance UI/DOM.
// La forme du GameState et endTurn() arrivent en Phase 1 (voir ARCHITECTURE.md).

export const ENGINE_VERSION = "0.1.0";

/** 1 tour = 1 trimestre. La partie démarre au T1 2026, tour 1. */
export const START_YEAR = 2026;
export const TURNS_PER_YEAR = 4;

/** Convertit un numéro de tour (1-indexé) en date affichable, ex. "T3 2027". */
export function turnToDate(turn: number): { year: number; quarter: number; label: string } {
  if (!Number.isInteger(turn) || turn < 1) {
    throw new RangeError(`turn doit être un entier >= 1, reçu : ${turn}`);
  }
  const zeroBased = turn - 1;
  const year = START_YEAR + Math.floor(zeroBased / TURNS_PER_YEAR);
  const quarter = (zeroBased % TURNS_PER_YEAR) + 1;
  return { year, quarter, label: `T${quarter} ${year}` };
}
