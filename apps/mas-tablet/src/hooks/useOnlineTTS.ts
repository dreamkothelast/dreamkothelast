/**
 * Synthèse vocale en ligne avec cache hors-ligne.
 *
 * Deux fournisseurs supportés automatiquement selon la clé :
 *   • Token HuggingFace  (hf_...)  → GRATUIT — modèle facebook/mms-tts-fra
 *   • Clé OpenAI         (sk-...)  → Payant   — voix "nova" (tts-1)
 *
 * Dans les deux cas : cache localStorage (1 téléchargement = usage hors-ligne illimité).
 */

import { useCallback, useRef } from "react";

const API_KEY_STORAGE = "mas-tablet-openai-key";
const CACHE_PREFIX    = "mas-tts-v1-";

// ── Modèle HF pour le français ─────────────────────────────────────────────
const HF_MODEL_FR = "facebook/mms-tts-fra";

export interface OnlineTTSOptions {
  onEnd?:  () => void;
  speed?:  number;
}

// ── Stockage clé API ───────────────────────────────────────────────────────
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
  keyType: (key: string): "huggingface" | "openai" | "none" => {
    if (key.startsWith("hf_")) return "huggingface";
    if (key.startsWith("sk-") || key.startsWith("sk-proj-")) return "openai";
    return "none";
  },
};

// ── Utilitaires ────────────────────────────────────────────────────────────
function fnv32(str: string): string {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function cacheKey(text: string, provider: string): string {
  return CACHE_PREFIX + provider.slice(0, 2) + fnv32(text);
}

// Chemin du clip pré-généré (voix Piper) embarqué dans le paquet.
// Nommé par le hash FNV-32 du texte exact (généré par scripts/generate_voices.py).
export function bundledVoicePath(text: string): string {
  return `./audio/${fnv32(text)}.mp3`;
}

function getCached(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function setCached(key: string, dataUrl: string): void {
  try {
    localStorage.setItem(key, dataUrl);
  } catch {
    // Purge la moitié du cache TTS si localStorage est plein
    try {
      const toDel: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) toDel.push(k);
      }
      toDel.slice(0, Math.ceil(toDel.length / 2)).forEach(k => localStorage.removeItem(k));
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

// ── Appel HuggingFace (GRATUIT avec compte gratuit) ────────────────────────
async function fetchHF(text: string, token: string, signal: AbortSignal): Promise<Blob | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL_FR}`,
        {
          method: "POST",
          signal,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (resp.status === 503 && attempt === 0) {
        // Modèle en cours de chargement — on attend 8 s et on réessaie
        await new Promise(r => setTimeout(r, 8000));
        continue;
      }

      if (!resp.ok) return null;
      return await resp.blob();
    } catch {
      return null;
    }
  }
  return null;
}

// ── Appel OpenAI TTS ───────────────────────────────────────────────────────
async function fetchOpenAI(text: string, apiKey: string, speed: number, signal: AbortSignal): Promise<Blob | null> {
  try {
    const resp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova",
        speed,
        response_format: "mp3",
      }),
    });
    if (!resp.ok) return null;
    return await resp.blob();
  } catch {
    return null;
  }
}

// ── Hook principal ─────────────────────────────────────────────────────────
export function useOnlineTTS(volume = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isConfigured = useCallback((): boolean =>
    OnlineTTSConfig.keyType(OnlineTTSConfig.getKey()) !== "none"
  , []);

  /**
   * Joue le clip pré-généré (voix Piper naturelle) embarqué dans le paquet.
   * 100 % hors-ligne, aucun robot. Retourne false si le fichier est absent.
   */
  const playBundled = useCallback((
    text: string,
    opts: OnlineTTSOptions = {}
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      const audio = new Audio(bundledVoicePath(text));
      audioRef.current = audio;
      audio.volume = Math.min(1, Math.max(0, volume));

      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      audio.onended = () => { opts.onEnd?.(); done(true); };
      // Fichier manquant ou illisible → on laisse le fallback prendre le relais
      audio.onerror = () => done(false);
      audio.play().then(() => done(true)).catch(() => done(false));
      // Sécurité : si l'audio ne démarre pas en 1,5 s, on bascule
      setTimeout(() => done(false), 1500);
    });
  }, [volume]);

  const speak = useCallback(async (
    text: string,
    opts: OnlineTTSOptions = {}
  ): Promise<boolean> => {
    const key = OnlineTTSConfig.getKey();
    const type = OnlineTTSConfig.keyType(key);
    if (type === "none") return false;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const ck = cacheKey(text, type);
    let dataUrl = getCached(ck);

    if (!dataUrl) {
      const blob = type === "huggingface"
        ? await fetchHF(text, key, abortRef.current.signal)
        : await fetchOpenAI(text, key, opts.speed ?? 0.88, abortRef.current.signal);

      if (!blob) return false;

      try { dataUrl = await blobToDataUrl(blob); } catch { return false; }
      setCached(ck, dataUrl);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(dataUrl);
    audioRef.current = audio;
    audio.volume = Math.min(1, Math.max(0, volume));

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

  return { speak, playBundled, stop, clearCache, isConfigured };
}
