import { describe, expect, it } from "vitest";
import { ENGINE_VERSION, turnToDate } from "../src/engine";

// Test fumée : vérifie que l'engine s'importe et s'exécute en pur Node (sans DOM).
describe("engine smoke", () => {
  it("expose une version", () => {
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("convertit les tours en trimestres (1 tour = 1 trimestre, départ T1 2026)", () => {
    expect(turnToDate(1)).toEqual({ year: 2026, quarter: 1, label: "T1 2026" });
    expect(turnToDate(4)).toEqual({ year: 2026, quarter: 4, label: "T4 2026" });
    expect(turnToDate(5)).toEqual({ year: 2027, quarter: 1, label: "T1 2027" });
    expect(turnToDate(120)).toEqual({ year: 2055, quarter: 4, label: "T4 2055" });
    expect(turnToDate(97).year).toBe(2050);
  });

  it("rejette les tours invalides", () => {
    expect(() => turnToDate(0)).toThrow(RangeError);
    expect(() => turnToDate(1.5)).toThrow(RangeError);
  });
});
