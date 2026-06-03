import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAudio } from "../../hooks/useAudio";
import { useSpeech } from "../../hooks/useSpeech";
import { useOnlineTTS, stripEmojis } from "../../hooks/useOnlineTTS";
import { Icon } from "../../components/Icon";
import voiceContent from "../../data/voiceContent.json";
import type { ActivityProps } from "../../types";

interface Comptine {
  id: string;
  title: string;
  icon: string;
  primary: string;
  secondary: string;
  lines: string[];
  melody: number[]; // Hz values cycled as background notes
}

// Source unique partagée avec le générateur de voix (scripts/generate_voices.py)
const COMPTINES: Comptine[] = voiceContent.comptines;

// ms per beat (word advance interval)
const BEAT_MS = 480;

export function ComptinesActivity({ volume = 0.7, reducedMotion, onCelebrate }: ActivityProps) {
  const { playTone, playKick, playHihat, playChord, resume } = useAudio(volume);
  const { available, parler, stop: stopSpeech } = useSpeech(Math.min(1, volume + 0.2));
  const { speak: onlineSpeak, playBundled, stop: onlineStop, isConfigured } = useOnlineTTS(Math.min(1, volume + 0.2));

  const [view, setView] = useState<"list" | "playing">("list");
  const [current, setCurrent] = useState<Comptine | null>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [wordIdx, setWordIdx] = useState(-1);

  const beatRef = useRef(0);
  const musicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Words for current line — strip emojis so they don't appear as karaoke tokens
  const currentWords = useMemo(
    () => (current ? stripEmojis(current.lines[lineIdx]).split(/\s+/).filter(Boolean) : []),
    [current, lineIdx]
  );

  // ── Moteur musical enrichi ────────────────────────────────────────────────
  const startMusic = useCallback((comptine: Comptine) => {
    if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
    beatRef.current = 0;
    musicIntervalRef.current = setInterval(() => {
      resume();
      const beat = beatRef.current;
      const hz = comptine.melody[beat % comptine.melody.length];

      // Mélodie : double oscillateur légèrement détunné → effet chorus/chaleur
      playTone(hz, 0.42, "triangle", 1.9);
      playTone(hz * 1.006, 0.42, "triangle", 0.95); // +10 cents de désynchro

      // Basse sur chaque temps
      playTone(hz / 2, 0.46, "sine", 1.5);

      // Accord majeur tenu toutes les 4 notes (harmonie)
      if (beat % 4 === 0) {
        playChord(hz, (BEAT_MS * 3.8) / 1000, 1.6);
      }

      // Rythmique : kick sur 1+3, hi-hat sur 2+4
      if (beat % 4 === 0 || beat % 4 === 2) {
        playKick(0.9);
      } else {
        playHihat(1.0);
      }

      beatRef.current += 1;
    }, BEAT_MS);
  }, [playTone, playKick, playHihat, playChord, resume]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  // ── Karaoke word highlight ────────────────────────────────────────────────
  const stopWordHighlight = useCallback(() => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    setWordIdx(-1);
  }, []);

  const startWordHighlight = useCallback((lineText: string) => {
    stopWordHighlight();
    const words = stripEmojis(lineText).split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    setWordIdx(0);
    let i = 1;
    wordTimerRef.current = setInterval(() => {
      if (i >= words.length) {
        clearInterval(wordTimerRef.current!);
        wordTimerRef.current = null;
        setWordIdx(-1);
      } else {
        setWordIdx(i++);
      }
    }, BEAT_MS);
  }, [stopWordHighlight]);

  const stopVoice = useCallback(() => {
    onlineStop();
    stopSpeech();
  }, [onlineStop, stopSpeech]);

  useEffect(() => () => {
    stopMusic();
    stopVoice();
    stopWordHighlight();
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
  }, [stopMusic, stopVoice, stopWordHighlight]);

  // Advance to next line or finish
  const goToNext = useCallback((comptine: Comptine, idx: number) => {
    const next = idx + 1;
    if (next >= comptine.lines.length) {
      stopMusic();
      stopVoice();
      stopWordHighlight();
      setTimeout(onCelebrate, 600);
    } else {
      setLineIdx(next);
    }
  }, [stopMusic, stopVoice, stopWordHighlight, onCelebrate]);

  // Narre la ligne + démarre le karaoké.
  // Priorité : 1) clip Piper embarqué (naturel, hors-ligne) 2) voix IA en ligne
  //            3) voix Windows  4) minuteur seul
  const performLine = useCallback((comptine: Comptine, idx: number) => {
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    startWordHighlight(comptine.lines[idx]);

    const text = comptine.lines[idx];
    const onEnd = () => {
      lineTimerRef.current = setTimeout(() => goToNext(comptine, idx), 550);
    };
    const timerFallback = () => {
      const wc = stripEmojis(text).split(/\s+/).filter(Boolean).length;
      lineTimerRef.current = setTimeout(() => goToNext(comptine, idx), Math.max(3000, wc * BEAT_MS + 600));
    };
    const voiceFallback = () => {
      if (isConfigured()) {
        onlineSpeak(text, { onEnd, speed: 0.88 }).then(ok => {
          if (!ok) { available ? parler(text, { rate: 0.78, onEnd }) : timerFallback(); }
        });
      } else if (available) {
        parler(text, { rate: 0.78, onEnd });
      } else {
        timerFallback();
      }
    };

    // 1) Clip pré-généré Piper — voix française naturelle, embarquée
    playBundled(text, { onEnd }).then(ok => { if (!ok) voiceFallback(); });
  }, [available, parler, onlineSpeak, playBundled, isConfigured, goToNext, startWordHighlight]);

  // Trigger performLine when line changes while playing
  useEffect(() => {
    if (view !== "playing" || !current || paused) return;
    performLine(current, lineIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, current, lineIdx, paused]);

  // ── Open a comptine ───────────────────────────────────────────────────────
  const openComptine = useCallback((c: Comptine) => {
    resume();
    setCurrent(c);
    setLineIdx(0);
    setPaused(false);
    setView("playing");
    startMusic(c);
  }, [resume, startMusic]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (!current) return;
    if (paused) {
      setPaused(false);
      startMusic(current);
      performLine(current, lineIdx);
    } else {
      setPaused(true);
      stopMusic();
      stopVoice();
      stopWordHighlight();
      if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    }
  }, [paused, current, lineIdx, startMusic, performLine, stopMusic, stopVoice, stopWordHighlight]);

  // ── Next line (manual tap) ────────────────────────────────────────────────
  const nextLine = useCallback(() => {
    if (!current || paused) return;
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    stopVoice();
    stopWordHighlight();
    goToNext(current, lineIdx);
  }, [current, paused, lineIdx, stopVoice, stopWordHighlight, goToNext]);

  // ── Back to list ──────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    stopMusic();
    stopVoice();
    stopWordHighlight();
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    setView("list");
    setCurrent(null);
  }, [stopMusic, stopVoice, stopWordHighlight]);

  // ── List view ─────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div
        className="flex flex-col items-center justify-start w-full h-full gap-6 px-8 py-6 overflow-y-auto"
        style={{
          background: "linear-gradient(160deg, #1a237e 0%, #283593 40%, #3949ab 100%)",
        }}
      >
        <div className="text-center pt-2 flex flex-col items-center">
          <Icon name="music-note" size={64} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow-lg" />
          <h2 className="font-masque font-bold text-white text-2xl sm:text-4xl drop-shadow-lg">Comptines</h2>
          <p className="font-masque text-white/70 text-base sm:text-xl mt-1 text-center px-4">
            {available
              ? "La voix chante avec toi ! Choisis une chanson"
              : "Choisis une chanson — chante avec nous !"}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-[1300px] pb-4">
          {COMPTINES.map((c) => (
            <button
              key={c.id}
              onClick={() => openComptine(c)}
              className={[
                "flex flex-col items-center justify-center gap-2",
                "min-h-[110px] sm:min-h-[150px] rounded-[1.4rem] sm:rounded-[1.8rem] overflow-hidden relative",
                "shadow-[0_6px_20px_rgba(0,0,0,0.4)]",
                "cursor-pointer select-none",
                "transition-all duration-200 hover:scale-[1.05] active:scale-95",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-white",
              ].join(" ")}
              style={{ backgroundColor: c.primary }}
            >
              {/* Shine overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)",
                  borderRadius: "inherit",
                }}
              />
              <Icon name={c.icon} size={68} className="w-12 h-12 sm:w-[68px] sm:h-[68px] relative drop-shadow-lg" />
              <span className="relative font-masque font-bold text-white text-sm sm:text-lg leading-tight text-center px-2 sm:px-3">
                {c.title}
              </span>
            </button>
          ))}
        </div>

        {!available && (
          <p className="font-masque text-white/50 text-base text-center max-w-[640px] pb-4">
            Pour activer la voix, ajoutez une voix française dans Windows
            (Paramètres → Heure et langue → Voix → Ajouter : Français France).
          </p>
        )}
      </div>
    );
  }

  // ── Playing view ──────────────────────────────────────────────────────────
  if (!current) return null;

  const progress = current.lines.map((_, i) => i <= lineIdx);

  return (
    <div
      className="flex flex-col w-full h-full select-none"
      style={{
        background: `linear-gradient(160deg, ${current.primary}30 0%, ${current.primary}10 100%)`,
      }}
    >
      {/* Controls bar */}
      <div className="flex items-center justify-between px-8 py-4 gap-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 font-masque font-bold text-brun text-xl px-6 py-3 rounded-[1.5rem] bg-white/70 hover:bg-white active:scale-95 transition-all min-w-[120px] min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
        >
          <Icon name="arrow-left" size={26} /> Retour
        </button>

        <div className="flex items-center gap-3">
          <Icon name={current.icon} size={40} />
          <span className="font-masque font-bold text-brun text-2xl">{current.title}</span>
        </div>

        <button
          onClick={togglePause}
          className="flex items-center justify-center gap-2 font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] min-w-[120px] min-h-[56px] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: current.primary }}
        >
          <Icon name={paused ? "play" : "pause"} size={24} /> {paused ? "Jouer" : "Pause"}
        </button>
      </div>

      {/* Main area: tap to advance */}
      <button
        onClick={nextLine}
        disabled={paused}
        className={[
          "flex-1 flex flex-col items-center justify-center px-12 gap-6",
          "focus-visible:outline-none",
          paused ? "opacity-60" : "cursor-pointer",
        ].join(" ")}
        aria-label="Ligne suivante"
      >
        {/* Karaoke word display */}
        <p
          className="font-masque font-bold text-brun text-center leading-relaxed text-[clamp(2.8rem,6vw,5.5rem)]"
          key={lineIdx}
        >
          {currentWords.map((word, i) => (
            <span
              key={i}
              className="inline-block"
              style={
                i === wordIdx
                  ? {
                      color: "#FFD700",
                      textShadow: "0 0 28px rgba(255,215,0,0.9), 0 2px 6px rgba(0,0,0,0.3)",
                      transform: "scale(1.1)",
                      transition: reducedMotion ? "none" : "transform 0.15s ease, color 0.15s ease",
                    }
                  : {
                      transition: reducedMotion ? "none" : "color 0.15s ease",
                    }
              }
            >
              {word}
              {i < currentWords.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

        {/* Musical note decorations */}
        {!paused && (
          <div className="flex items-center gap-4 opacity-70">
            {[0, 1, 2].map((i) => (
              <Icon
                key={i}
                name="music-note"
                size={i === 1 ? 42 : 32}
                style={{
                  animation: reducedMotion ? "none" : `float ${1.2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {!paused && (
          <p className="font-masque text-brun/40 text-xl flex items-center gap-2">
            Touche pour passer à la suite <Icon name="arrow-right" size={22} />
          </p>
        )}
      </button>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3 pb-8">
        {progress.map((done, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === lineIdx ? 26 : 14,
              height: i === lineIdx ? 26 : 14,
              backgroundColor: done ? current.primary : `${current.primary}40`,
              boxShadow: i === lineIdx ? `0 0 12px ${current.primary}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
