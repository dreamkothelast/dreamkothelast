import { useRef, useCallback, useEffect } from "react";

// Crée un AudioContext si disponible (Web Audio API, 100% offline)
function createCtx(): AudioContext | null {
  try {
    const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    return Ctx ? new Ctx() : null;
  } catch {
    return null;
  }
}

// Gamme pentatonique majeure de Do : douce à l'oreille, aucune dissonance possible
const PENTATONIC_HZ = [261.6, 293.7, 329.6, 392.0, 440.0, 523.2, 587.3, 659.3];

export function useAudio(volume = 0.7) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    ctxRef.current = createCtx();
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  // Reprend le contexte suspendu (politique autoplay)
  const resume = useCallback(() => {
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume();
    }
  }, []);

  // Note douce avec enveloppe ADSR légère
  const playTone = useCallback(
    (
      hz = 440,
      duration = 0.45,
      type: OscillatorType = "sine",
      gain = 1
    ) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      resume();

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(hz, ctx.currentTime);

      // Volume plafonné à 30 % pour rester apaisant
      const peak = volume * gain * 0.3;
      env.gain.setValueAtTime(0, ctx.currentTime);
      env.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.05);
      env.gain.setValueAtTime(peak, ctx.currentTime + duration * 0.55);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [volume, resume]
  );

  // Son de bulle sensorielle : note aléatoire de la gamme pentatonique
  const playBubble = useCallback(() => {
    const hz = PENTATONIC_HZ[Math.floor(Math.random() * PENTATONIC_HZ.length)];
    playTone(hz, 0.5, "sine");
  }, [playTone]);

  // Arpège ascendant pour la célébration
  const playCelebration = useCallback(() => {
    const notes = [261.6, 329.6, 392.0, 523.2, 659.3];
    notes.forEach((hz, i) => {
      setTimeout(() => playTone(hz, 0.5, "sine", 1.2), i * 130);
    });
  }, [playTone]);

  // Alerte douce de fin de minuteur (1 min restante)
  const playPreAlert = useCallback(() => {
    playTone(523.2, 0.3, "sine", 0.8);
    setTimeout(() => playTone(659.3, 0.35, "sine", 0.8), 380);
  }, [playTone]);

  // Son léger pour les boutons de navigation
  const playClick = useCallback(() => {
    playTone(392.0, 0.18, "sine", 0.7);
  }, [playTone]);

  // Son positif d'appariement (memory, etc.)
  const playMatch = useCallback(() => {
    playTone(523.2, 0.25, "sine");
    setTimeout(() => playTone(659.3, 0.3, "sine"), 140);
  }, [playTone]);

  return { playTone, playBubble, playCelebration, playPreAlert, playClick, playMatch, resume };
}
