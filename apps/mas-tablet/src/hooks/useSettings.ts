import { useState, useCallback } from "react";
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  volume: 0.7,
  intensity: "doux",
  timerDuration: 10,
  difficulty: "cause-effet",
  reducedMotion: false,
  theme: "animaux",
};

const STORAGE_KEY = "mas-tablet-settings";

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // localStorage indisponible : on utilise les réglages par défaut
  }
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Pas grave si localStorage échoue
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
