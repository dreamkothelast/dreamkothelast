import { useCallback } from "react";

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

const PENTATONIC_HZ = [261.6, 293.7, 329.6, 392.0, 440.0, 523.2, 587.3, 659.3];

export function useAudio(volume = 0.7) {
  const resume = useCallback(() => {
    const ctx = getCtx();
    if (ctx?.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, []);

  // Note douce avec enveloppe ADSR
  const playTone = useCallback(
    (hz = 440, duration = 0.45, type: OscillatorType = "sine", gain = 1) => {
      const ctx = getCtx();
      if (!ctx || ctx.state === "closed") return;
      resume();
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
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

  // Kick drum : sine avec descente de fréquence rapide (thump grave)
  const playKick = useCallback((gain = 1) => {
    const ctx = getCtx();
    if (!ctx || ctx.state === "closed") return;
    resume();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(ctx.destination);
    osc.type = "sine";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.22);
    const peak = volume * gain * 0.55;
    env.gain.setValueAtTime(peak, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.start(t);
    osc.stop(t + 0.32);
  }, [volume, resume]);

  // Hi-hat : deux courtes impulsions hautes fréquences (clic métallique)
  const playHihat = useCallback((gain = 1) => {
    playTone(7200, 0.035, "square", gain * 0.13);
    playTone(10200, 0.028, "square", gain * 0.09);
  }, [playTone]);

  // Accord majeur (fondamentale + tierce majeure + quinte juste)
  const playChord = useCallback((rootHz: number, duration = 0.4, gain = 1) => {
    const maj3 = rootHz * Math.pow(2, 4 / 12);
    const p5   = rootHz * Math.pow(2, 7 / 12);
    playTone(rootHz, duration, "triangle", gain * 0.55);
    playTone(maj3,   duration, "triangle", gain * 0.42);
    playTone(p5,     duration, "triangle", gain * 0.38);
  }, [playTone]);

  const playBubble = useCallback(() => {
    const hz = PENTATONIC_HZ[Math.floor(Math.random() * PENTATONIC_HZ.length)];
    playTone(hz, 0.5, "sine");
  }, [playTone]);

  const playCelebration = useCallback(() => {
    const notes = [261.6, 329.6, 392.0, 523.2, 659.3];
    notes.forEach((hz, i) => {
      setTimeout(() => playTone(hz, 0.5, "sine", 1.2), i * 130);
    });
  }, [playTone]);

  const playPreAlert = useCallback(() => {
    playTone(523.2, 0.3, "sine", 0.8);
    setTimeout(() => playTone(659.3, 0.35, "sine", 0.8), 380);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(392.0, 0.18, "sine", 0.7);
  }, [playTone]);

  const playMatch = useCallback(() => {
    playTone(523.2, 0.25, "sine");
    setTimeout(() => playTone(659.3, 0.3, "sine"), 140);
    setTimeout(() => playTone(784.0, 0.35, "sine", 1.1), 280);
  }, [playTone]);

  const playSoft = useCallback(() => {
    playTone(293.7, 0.35, "sine", 0.5);
  }, [playTone]);

  const playFlip = useCallback(() => {
    playTone(440.0, 0.14, "triangle", 0.5);
  }, [playTone]);

  return {
    playTone, playBubble, playCelebration, playPreAlert,
    playClick, playMatch, playSoft, playFlip,
    playKick, playHihat, playChord, resume,
  };
}
