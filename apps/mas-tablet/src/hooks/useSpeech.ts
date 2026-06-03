import { useCallback, useEffect, useRef, useState } from "react";
import { stripEmojis } from "./useOnlineTTS";

/**
 * Synthèse vocale 100 % hors-ligne via l'API Web Speech (SpeechSynthesis).
 *
 * Utilise les voix françaises DÉJÀ installées sur Windows
 * (Microsoft Hortense, Julie, Paul…). Aucun appel réseau, fonctionne en file://.
 *
 * - parler() : lit un texte, avec rythme/hauteur réglables
 * - chanter() : lit avec une intonation plus chantante (hauteur variable)
 * - stop() : interrompt immédiatement
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

// Voix neurales Edge les plus douces/chaleureuses pour le français,
// par ordre de préférence (gratuites, naturelles, idéales pour enfants).
const PREFERRED_NEURAL = [
  "Denise",    // femme, chaleureuse — la meilleure pour raconter
  "Vivienne",  // femme, expressive
  "Eloise",    // voix enfantine douce
  "Josephine",
  "Brigitte",
  "Celeste",
  "Remy",      // homme doux
  "Henri",     // homme
];

// Choisit la meilleure voix française disponible.
// Priorité : 1) voix neurale Edge préférée (Denise…) 2) toute voix neurale
//            3) voix fr-FR hors-ligne  4) toute voix française
function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const isFr = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith("fr");
  const isNeural = (v: SpeechSynthesisVoice) =>
    v.name.includes("Online (Natural)") || v.name.toLowerCase().includes("neural");

  // 1) Voix neurale préférée par nom
  for (const name of PREFERRED_NEURAL) {
    const match = voices.find((v) => isFr(v) && isNeural(v) && v.name.includes(name));
    if (match) return match;
  }

  // 2) N'importe quelle voix neurale française
  const anyNeural = voices.find((v) => isFr(v) && isNeural(v));
  if (anyNeural) return anyNeural;

  // 3) Voix fr-FR hors-ligne (Hortense, Julie, Paul…)
  const frFR = voices.find((v) => v.lang === "fr-FR");
  if (frFR) return frFR;

  // 4) Toute voix française, sinon défaut
  const fr = voices.find(isFr);
  if (fr) return fr;

  return voices.find((v) => v.default) ?? voices[0];
}

// Indique si la voix choisie est une voix neurale (haute qualité)
export function isNeuralVoice(v: SpeechSynthesisVoice | null): boolean {
  if (!v) return false;
  return v.name.includes("Online (Natural)") || v.name.toLowerCase().includes("neural");
}

export interface SpeakOptions {
  rate?: number;   // vitesse 0.1–10 (défaut 1)
  pitch?: number;  // hauteur 0–2 (défaut 1)
  volume?: number; // 0–1
  onEnd?: () => void;
}

export function useSpeech(volume = 1) {
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setAvailable(false);
      return;
    }
    setAvailable(true);

    const load = () => {
      const voices = refreshVoices();
      if (voices.length > 0) {
        voiceRef.current = pickFrenchVoice(voices);
        setReady(true);
      }
    };

    load();
    // Les voix peuvent se charger de façon asynchrone
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Lecture simple d'un texte
  const parler = useCallback(
    (text: string, opts: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        opts.onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(stripEmojis(text));
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang ?? "fr-FR";
      u.rate = opts.rate ?? 0.95;
      u.pitch = opts.pitch ?? 1;
      u.volume = opts.volume ?? volume;
      if (opts.onEnd) {
        u.onend = () => opts.onEnd?.();
        u.onerror = () => opts.onEnd?.();
      }
      window.speechSynthesis.speak(u);
    },
    [volume]
  );

  // Lecture "chantée" : découpe le texte en mots et fait varier la hauteur
  // selon une mélodie (donne une intonation montante/descendante agréable).
  const chanter = useCallback(
    (text: string, melodyPitches: number[], opts: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        opts.onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();

      const words = text.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        opts.onEnd?.();
        return;
      }

      words.forEach((word, i) => {
        const u = new SpeechSynthesisUtterance(word);
        if (voiceRef.current) u.voice = voiceRef.current;
        u.lang = voiceRef.current?.lang ?? "fr-FR";
        // Rythme légèrement ralenti pour un effet plus mélodique
        u.rate = opts.rate ?? 0.85;
        // Hauteur issue de la mélodie (cycle sur les notes)
        u.pitch = melodyPitches[i % melodyPitches.length];
        u.volume = opts.volume ?? volume;
        // onEnd seulement sur le dernier mot
        if (i === words.length - 1 && opts.onEnd) {
          u.onend = () => opts.onEnd?.();
          u.onerror = () => opts.onEnd?.();
        }
        window.speechSynthesis.speak(u);
      });
    },
    [volume]
  );

  return { available, ready, parler, chanter, stop, voice: voiceRef };
}

// Convertit une fréquence (Hz) en hauteur SpeechSynthesis (0–2).
// 261 Hz (Do) ≈ 0.8, 660 Hz (Mi aigu) ≈ 1.4 — plage douce et chantante.
export function hzToPitch(hz: number): number {
  const minHz = 261.6, maxHz = 659.3;
  const t = Math.max(0, Math.min(1, (hz - minHz) / (maxHz - minHz)));
  return 0.8 + t * 0.7; // 0.8 → 1.5
}
