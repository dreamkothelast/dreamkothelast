import { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "../../hooks/useAudio";
import type { ActivityProps } from "../../types";

// ── Données des comptines ────────────────────────────────────────────────────

interface Comptine {
  id: string;
  title: string;
  emoji: string;
  primary: string;   // couleur fond tuile
  secondary: string; // couleur label
  lines: string[];
  melody: number[];  // fréquences Hz à cycler en fond
}

const COMPTINES: Comptine[] = [
  {
    id: "frere-jacques",
    title: "Frère Jacques",
    emoji: "🔔",
    primary: "#E53935",
    secondary: "#B71C1C",
    lines: [
      "Frère Jacques, Frère Jacques,",
      "Dormez-vous ? Dormez-vous ?",
      "Sonnez les matines !",
      "Sonnez les matines !",
      "Din, din, don !  Din, din, don !",
    ],
    melody: [261.6, 293.7, 329.6, 261.6, 329.6, 392.0, 392.0, 261.6],
  },
  {
    id: "promenons-nous",
    title: "Promenons-nous dans les bois",
    emoji: "🐺",
    primary: "#388E3C",
    secondary: "#1B5E20",
    lines: [
      "Promenons-nous dans les bois,",
      "Pendant que le loup n'y est pas.",
      "Si le loup y était,",
      "Il nous mangerait !",
      "Mais comme il n'y est pas,",
      "Il nous mangera pas !",
    ],
    melody: [261.6, 329.6, 392.0, 440.0, 392.0, 329.6, 261.6, 261.6],
  },
  {
    id: "petit-navire",
    title: "Il était un petit navire",
    emoji: "⛵",
    primary: "#1565C0",
    secondary: "#0D47A1",
    lines: [
      "Il était un petit navire,",
      "Il était un petit navire,",
      "Qui n'avait ja, jamais navigué,",
      "Qui n'avait ja, jamais navigué,",
      "Ohé ! Ohé ! 🌊",
    ],
    melody: [329.6, 392.0, 440.0, 523.2, 440.0, 392.0, 329.6, 293.7],
  },
  {
    id: "ainsi-font",
    title: "Ainsi font les marionnettes",
    emoji: "🎭",
    primary: "#7B1FA2",
    secondary: "#4A148C",
    lines: [
      "Ainsi font, font, font,",
      "Les petites marionnettes,",
      "Ainsi font, font, font,",
      "Trois p'tits tours et puis s'en vont !",
      "Les mains font, font, font,",
      "Les bras font, font, font… ✨",
    ],
    melody: [392.0, 440.0, 523.2, 440.0, 392.0, 329.6, 293.7, 261.6],
  },
  {
    id: "furet",
    title: "Il court, il court le furet",
    emoji: "🐾",
    primary: "#E65100",
    secondary: "#BF360C",
    lines: [
      "Il court, il court le furet,",
      "Le furet du bois, mesdames !",
      "Il court, il court le furet,",
      "Le furet du bois joli.",
      "Il a passé par ici,",
      "Il repassera par là !",
    ],
    melody: [261.6, 329.6, 261.6, 392.0, 329.6, 261.6, 440.0, 392.0],
  },
];

// ── Durée d'affichage par ligne (ms) ─────────────────────────────────────────
const LINE_DURATION = 3000;
// ── Intervalle entre chaque note de fond (ms) ────────────────────────────────
const BEAT_MS = 420;

// ── Composant principal ───────────────────────────────────────────────────────
export function ComptinesActivity({ volume = 0.7, reducedMotion, onCelebrate }: ActivityProps) {
  const { playTone, resume } = useAudio(volume);

  const [view, setView] = useState<"list" | "playing">("list");
  const [current, setCurrent] = useState<Comptine | null>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const beatRef = useRef(0);           // index dans le tableau melody
  const musicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Musique de fond ───────────────────────────────────────────────────────
  const startMusic = useCallback((comptine: Comptine) => {
    if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
    beatRef.current = 0;
    musicIntervalRef.current = setInterval(() => {
      resume();
      const hz = comptine.melody[beatRef.current % comptine.melody.length];
      playTone(hz, 0.38, "sine", 0.55);
      beatRef.current += 1;
    }, BEAT_MS);
  }, [playTone, resume]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    stopMusic();
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
  }, [stopMusic]);

  // ── Avancement automatique des lignes ─────────────────────────────────────
  const scheduleAdvance = useCallback((comptine: Comptine, idx: number) => {
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    lineTimerRef.current = setTimeout(() => {
      const next = idx + 1;
      if (next >= comptine.lines.length) {
        stopMusic();
        setTimeout(onCelebrate, 600);
      } else {
        playTone(523.2, 0.18, "sine", 0.7);
        setLineIdx(next);
        scheduleAdvance(comptine, next);
      }
    }, LINE_DURATION);
  }, [stopMusic, onCelebrate, playTone]);

  // ── Démarrer une comptine ─────────────────────────────────────────────────
  const openComptine = useCallback((c: Comptine) => {
    resume();
    setCurrent(c);
    setLineIdx(0);
    setPaused(false);
    setView("playing");
    startMusic(c);
    scheduleAdvance(c, 0);
  }, [resume, startMusic, scheduleAdvance]);

  // ── Pause / Reprise ───────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (!current) return;
    if (paused) {
      setPaused(false);
      startMusic(current);
      scheduleAdvance(current, lineIdx);
    } else {
      setPaused(true);
      stopMusic();
      if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    }
  }, [paused, current, lineIdx, startMusic, scheduleAdvance, stopMusic]);

  // ── Ligne suivante (manuelle) ─────────────────────────────────────────────
  const nextLine = useCallback(() => {
    if (!current || paused) return;
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    const next = lineIdx + 1;
    if (next >= current.lines.length) {
      stopMusic();
      setTimeout(onCelebrate, 400);
    } else {
      playTone(523.2, 0.18, "sine", 0.7);
      setLineIdx(next);
      scheduleAdvance(current, next);
    }
  }, [current, paused, lineIdx, stopMusic, onCelebrate, playTone, scheduleAdvance]);

  // ── Retour à la liste ─────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    stopMusic();
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    setView("list");
    setCurrent(null);
  }, [stopMusic]);

  // ── Vue : liste des comptines ─────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-8 py-6 bg-gradient-to-b from-[#FFF1D6] to-[#FFF6E9]">
        <div className="text-center">
          <div className="text-7xl mb-2">🎵</div>
          <h2 className="font-masque font-bold text-brun text-4xl">Comptines</h2>
          <p className="font-masque text-brun/60 text-xl mt-1">Choisis une chanson 👇</p>
        </div>

        <div className="grid grid-cols-3 gap-5 w-full max-w-[1100px]">
          {COMPTINES.map((c) => (
            <button
              key={c.id}
              onClick={() => openComptine(c)}
              className={[
                "flex flex-col items-center justify-center gap-3",
                "min-h-[160px] rounded-[2rem] overflow-hidden",
                "shadow-[0_6px_20px_rgba(0,0,0,0.25)]",
                "cursor-pointer select-none",
                "transition-all duration-200 hover:scale-[1.04] active:scale-95",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
              ].join(" ")}
              style={{ backgroundColor: c.primary }}
            >
              <span className="text-6xl drop-shadow-lg" role="img">{c.emoji}</span>
              <span className="font-masque font-bold text-white text-xl leading-tight text-center px-4">
                {c.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Vue : lecture en cours ────────────────────────────────────────────────
  if (!current) return null;

  const progress = current.lines.map((_, i) => i <= lineIdx);

  return (
    <div
      className="flex flex-col w-full h-full select-none"
      style={{ background: `linear-gradient(160deg, ${current.primary}22 0%, ${current.primary}08 100%)` }}
    >
      {/* Barre de contrôles */}
      <div className="flex items-center justify-between px-8 py-4 gap-4">
        <button
          onClick={goBack}
          className="font-masque font-bold text-brun text-xl px-6 py-3 rounded-[1.5rem] bg-white/70 hover:bg-white active:scale-95 transition-all min-w-[120px] min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img">{current.emoji}</span>
          <span className="font-masque font-bold text-brun text-2xl">{current.title}</span>
        </div>

        <button
          onClick={togglePause}
          className="font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] min-w-[120px] min-h-[56px] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: current.primary }}
        >
          {paused ? "▶ Jouer" : "⏸ Pause"}
        </button>
      </div>

      {/* Zone principale : ligne en cours — tap pour avancer */}
      <button
        onClick={nextLine}
        disabled={paused}
        className={[
          "flex-1 flex flex-col items-center justify-center px-12 gap-8",
          "focus-visible:outline-none",
          paused ? "opacity-60" : "cursor-pointer",
        ].join(" ")}
        aria-label="Ligne suivante"
      >
        <p
          className={[
            "font-masque font-bold text-brun text-center leading-tight",
            "text-[clamp(2.5rem,6vw,5rem)]",
            reducedMotion ? "" : "animate-[slide-up_0.4s_cubic-bezier(0.34,1.56,0.64,1)]",
          ].join(" ")}
          key={lineIdx}
        >
          {current.lines[lineIdx]}
        </p>

        {!paused && (
          <p className="font-masque text-brun/40 text-xl">
            Touche pour passer à la suite →
          </p>
        )}
      </button>

      {/* Barre de progression (points) */}
      <div className="flex items-center justify-center gap-3 pb-8">
        {progress.map((done, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === lineIdx ? 24 : 14,
              height: i === lineIdx ? 24 : 14,
              backgroundColor: done ? current.primary : `${current.primary}40`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
