/**
 * Synthèse vocale via OpenAI TTS API (voix neurale de haute qualité).
 * - Premier appel : télécharge l'audio depuis l'API, met en cache dans localStorage.
 * - Appels suivants : lecture directe depuis le cache (fonctionne hors-ligne).
 * - Fallback automatique si pas de clé ou si réseau indisponible.
 *
 * Clé API stockée sous la clé localStorage "mas-tablet-openai-key".
 */

import { useCallback, useRef } from "react";

const API_KEY_STORAGE = "mas-tablet-openai-key";
const CACHE_PREFIX    = "mas-tts-v1-";
const TTS_VOICE       = "nova";   // voix chaleureuse et naturelle, bon français
const TTS_MODEL       = "tts-1";

export interface OnlineTTSOptions {
  onEnd?:  () => void;
  speed?:  number; // 0.25–4.0, défaut 0.88
}

function getApiKey(): string {
  try { return localStorage.getItem(API_KEY_STORAGE) ?? ""; } catch { return ""; }
}

// Petit hash FNV-32 pour la clé de cache (pas besoin de crypto)
function fnv32(str: string): string {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function cacheKey(text: string): string {
  return CACHE_PREFIX + fnv32(TTS_VOICE + text);
}

function getCached(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function setCached(key: string, dataUrl: string): void {
  try {
    localStorage.setItem(key, dataUrl);
  } catch {
    // localStorage plein : purge les entrées TTS les plus anciennes
    try {
      const toDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) toDelete.push(k);
      }
      toDelete.slice(0, Math.ceil(toDelete.length / 2)).forEach(k =>
        localStorage.removeItem(k)
      );
      localStorage.setItem(key, dataUrl);
    } catch {}
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

export function useOnlineTTS(volume = 1) {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const abortRef  = useRef<AbortController | null>(null);

  /** Retourne true si une clé API est configurée */
  const isConfigured = useCallback((): boolean => {
    const k = getApiKey();
    return k.startsWith("sk-") || k.startsWith("sk-proj-");
  }, []);

  /**
   * Lit le texte via OpenAI TTS (ou depuis le cache).
   * Retourne true si la lecture a démarré, false si fallback nécessaire.
   */
  const speak = useCallback(async (
    text: string,
    opts: OnlineTTSOptions = {}
  ): Promise<boolean> => {
    const apiKey = getApiKey();
    if (!apiKey) return false;

    // Annule un éventuel téléchargement précédent
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const key = cacheKey(text);
    let dataUrl = getCached(key);

    if (!dataUrl) {
      try {
        const resp = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          signal: abortRef.current.signal,
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type":  "application/json",
          },
          body: JSON.stringify({
            model:           TTS_MODEL,
            input:           text,
            voice:           TTS_VOICE,
            speed:           opts.speed ?? 0.88,
            response_format: "mp3",
          }),
        });
        if (!resp.ok) return false;
        dataUrl = await blobToDataUrl(await resp.blob());
        setCached(key, dataUrl);
      } catch {
        // Réseau indisponible ou requête annulée → fallback
        return false;
      }
    }

    // Arrête l'audio précédent
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(dataUrl);
    audioRef.current   = audio;
    audio.volume       = Math.min(1, Math.max(0, volume));
    audio.playbackRate = 1.0;

    return new Promise<boolean>((resolve) => {
      audio.onended = () => { opts.onEnd?.(); resolve(true); };
      audio.onerror = () => { opts.onEnd?.(); resolve(false); };
      audio.play().catch(() => { opts.onEnd?.(); resolve(false); });
    });
  }, [volume]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, []);

  /** Supprime tout le cache TTS de localStorage */
  const clearCache = useCallback(() => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
  }, []);

  return { speak, stop, clearCache, isConfigured };
}

/** Utilitaires pour lire/écrire la clé API depuis n'importe quel composant */
export const OnlineTTSConfig = {
  getKey: (): string => {
    try { return localStorage.getItem(API_KEY_STORAGE) ?? ""; } catch { return ""; }
  },
  setKey: (key: string): void => {
    try {
      if (key.trim()) localStorage.setItem(API_KEY_STORAGE, key.trim());
      else localStorage.removeItem(API_KEY_STORAGE);
    } catch {}
  },
  getCacheCount: (): number => {
    try {
      let n = 0;
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i)?.startsWith(CACHE_PREFIX)) n++;
      }
      return n;
    } catch { return 0; }
  },
};
