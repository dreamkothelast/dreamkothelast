import { useCallback } from "react";

// AudioContext partagé au niveau module : un seul contexte pour toute l'app.
// Évite la limite navigateur (~6 contextes) et toute course « resume après close »
// lors des navigations entre écrans. Jamais fermé tant que l'app vit.
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (sharedCtx) return sharedCtx;
  try {
    const Ctx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    sharedCtx = Ctx ? new Ctx() : null;
  } catch {
    sharedCtx = null;
  }
  return sharedCtx;
}

// Gamme pentatonique majeure de Do : douce à l'oreille, aucune dissonance possible
const PENTATONIC_HZ = [261.6, 293.7, 329.6, 392.0, 440.0, 523.2, 587.3, 659.3];

export function useAudio(volume = 0.7) {
  // Reprend le contexte suspendu (politique autoplay).
  // Protégé : ne fait rien si le contexte est fermé.
  const resume = useCallback(() => {
    const ctx = getCtx();
    if (ctx?.state === "suspended") {
      ctx.resume().catch(() => {
        /* contexte fermé ou indisponible : on ignore */
      });
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
      const ctx = getCtx();
      // Ne joue rien si le contexte est absent ou fermé
      if (!ctx || ctx.state === "closed") return;
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

  // Son positif d'appariement (memory, etc.) : tierce ascendante joyeuse
  const playMatch = useCallback(() => {
    playTone(523.2, 0.25, "sine");
    setTimeout(() => playTone(659.3, 0.3, "sine"), 140);
    setTimeout(() => playTone(784.0, 0.35, "sine", 1.1), 280);
  }, [playTone]);

  // Son doux et neutre quand deux cartes ne correspondent pas.
  // JAMAIS un buzzer : une note grave très douce, simple invitation à réessayer.
  const playSoft = useCallback(() => {
    playTone(293.7, 0.35, "sine", 0.5);
  }, [playTone]);

  // Son de retournement d'une carte (léger, feutré)
  const playFlip = useCallback(() => {
    playTone(440.0, 0.14, "triangle", 0.5);
  }, [playTone]);

  return {
    playTone, playBubble, playCelebration, playPreAlert,
    playClick, playMatch, playSoft, playFlip, resume,
  };
}
