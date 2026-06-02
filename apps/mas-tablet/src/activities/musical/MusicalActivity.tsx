import { useState, useEffect, useCallback, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import type { ActivityProps, Difficulty } from "../../types";

// 4 pads — notes de la gamme pentatonique (do, mi, sol, la)
const PADS = [
  { id: 0, colorLight: "#EF5350", colorDark: "#B71C1C", label: "Do",  hz: 261.6 },
  { id: 1, colorLight: "#42A5F5", colorDark: "#1565C0", label: "Mi",  hz: 329.6 },
  { id: 2, colorLight: "#FFCA28", colorDark: "#F57F17", label: "Sol", hz: 392.0 },
  { id: 3, colorLight: "#66BB6A", colorDark: "#2E7D32", label: "La",  hz: 440.0 },
] as const;

const ENCOURAGEMENTS = [
  "Bravo ! 🎉", "Super ! ⭐", "Bien joué ! 👏",
  "Génial ! 🌟", "Magnifique ! 🎶", "Oui ! 🎵",
];

// Longueur maximale de séquence par difficulté
const MAX_LEN: Record<Difficulty, number> = {
  "cause-effet": 0,
  "facile": 5,
  "normal": 8,
};

// Longueur de départ
const START_LEN: Record<Difficulty, number> = {
  "cause-effet": 0,
  "facile": 2,
  "normal": 3,
};

// Taps cause-effet avant célébration
const CAUSE_EFFET_TARGET = 8;

type GamePhase = "idle" | "watch" | "play";

export function MusicalActivity({
  difficulty,
  reducedMotion,
  volume,
  onCelebrate,
}: ActivityProps) {
  const { playTone, playMatch, playSoft } = useAudio(volume ?? 0.7);

  const [gamePhase, setGamePhase] = useState<GamePhase>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [encouragement, setEncouragement] = useState("");
  const [causeEffetTaps, setCauseEffetTaps] = useState(0);

  // Refs pour valeurs mutables utilisées dans des callbacks asynchrones
  const seqRef = useRef<number[]>([]);
  const posRef = useRef(0);
  const busyRef = useRef(false);
  const encTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { seqRef.current = sequence; }, [sequence]);

  const showEncouragement = useCallback((msg: string) => {
    if (encTimerRef.current) clearTimeout(encTimerRef.current);
    setEncouragement(msg);
    encTimerRef.current = setTimeout(() => setEncouragement(""), 1600);
  }, []);

  const playPadNote = useCallback(
    (padId: number, dur = 0.5) => {
      playTone(PADS[padId].hz, dur, "sine", 1.1);
    },
    [playTone]
  );

  const lightPad = useCallback((padId: number, ms: number) => {
    setActivePad(padId);
    setTimeout(() => setActivePad(null), ms);
  }, []);

  // Lit la séquence avec animation, puis passe en phase "play"
  const runSequence = useCallback(
    async (seq: number[]) => {
      busyRef.current = true;
      setGamePhase("watch");
      posRef.current = 0;

      await new Promise((r) => setTimeout(r, 700));

      const stepMs = reducedMotion ? 380 : 780;
      const lightMs = reducedMotion ? 220 : 580;

      for (const padId of seq) {
        playPadNote(padId);
        lightPad(padId, lightMs);
        await new Promise((r) => setTimeout(r, stepMs));
      }

      await new Promise((r) => setTimeout(r, 350));
      posRef.current = 0;
      setGamePhase("play");
      busyRef.current = false;
    },
    [playPadNote, lightPad, reducedMotion]
  );

  const startGame = useCallback(() => {
    if (difficulty === "cause-effet") {
      setGamePhase("play");
      setCauseEffetTaps(0);
      return;
    }
    const len = START_LEN[difficulty];
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
    setSequence(seq);
    seqRef.current = seq;
    runSequence(seq);
  }, [difficulty, runSequence]);

  const handlePadTap = useCallback(
    (padId: number) => {
      if (busyRef.current) return;
      if (gamePhase === "idle" || gamePhase === "watch") return;

      // ── Cause-effet : n'importe quel pad = récompense ──
      if (difficulty === "cause-effet") {
        playPadNote(padId);
        lightPad(padId, 520);
        showEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
        setCauseEffetTaps((n) => {
          const next = n + 1;
          if (next >= CAUSE_EFFET_TARGET) setTimeout(() => onCelebrate(), 900);
          return next;
        });
        return;
      }

      // ── Mode séquence ──
      const seq = seqRef.current;
      const pos = posRef.current;
      const expected = seq[pos];

      playPadNote(padId, 0.4);

      if (padId === expected) {
        lightPad(padId, 450);
        const nextPos = pos + 1;
        posRef.current = nextPos;

        if (nextPos >= seq.length) {
          // Séquence complète !
          busyRef.current = true;
          playMatch();
          showEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

          if (seq.length >= MAX_LEN[difficulty]) {
            // Jeu terminé → célébration
            setTimeout(() => onCelebrate(), 1400);
            return;
          }

          // Ajoute une note et rejoue
          const newPad = Math.floor(Math.random() * 4);
          const nextSeq = [...seq, newPad];
          setSequence(nextSeq);
          seqRef.current = nextSeq;
          setTimeout(() => runSequence(nextSeq), 1400);
        }
        // sinon : tap correct, on attend le suivant
      } else {
        // Mauvais pad — son doux, puis rejoue la séquence
        busyRef.current = true;
        lightPad(padId, 260);
        playSoft();
        setTimeout(() => runSequence(seq), 1000);
      }
    },
    [
      gamePhase, difficulty,
      playPadNote, lightPad, playMatch, playSoft,
      showEncouragement, onCelebrate, runSequence,
    ]
  );

  // Accès clavier / contacteur : touches 1-4 → pads 0-3
  useEffect(() => {
    if (gamePhase === "idle") return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
      const id = map[e.key];
      if (id !== undefined) handlePadTap(id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gamePhase, handlePadTap]);

  // ── Texte d'instruction ──
  const instruction =
    gamePhase === "idle" ? "" :
    difficulty === "cause-effet" ? "Appuie sur n'importe quelle touche ! 🎵" :
    gamePhase === "watch" ? "Regarde bien... 👀" :
    "À ton tour ! 👆";

  const maxLen = difficulty !== "cause-effet" ? MAX_LEN[difficulty] : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-8 py-6 select-none">
      {/* Titre + instruction */}
      <div className="text-center">
        <h2 className="font-masque font-bold text-brun text-4xl">🎵 Jeu Musical</h2>
        {gamePhase !== "idle" && (
          <p className="font-masque text-brun/70 text-2xl mt-2 min-h-[2rem]">
            {instruction}
          </p>
        )}
      </div>

      {/* Bouton démarrage ou grille de pads */}
      {gamePhase === "idle" ? (
        <button
          onClick={startGame}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={[
            "font-masque font-bold text-white text-3xl px-16 py-8 rounded-[2rem]",
            "transition-all hover:scale-105 active:scale-95",
            "shadow-[0_6px_20px_rgba(0,0,0,0.3)]",
            "focus-visible:ring-[6px] focus-visible:ring-brun focus-visible:outline-none",
          ].join(" ")}
          style={{ backgroundColor: "#7B1FA2" }}
        >
          Commencer 🎶
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-6 w-full max-w-[680px]">
          {PADS.map((pad) => {
            const lit = activePad === pad.id;
            const disabled = gamePhase === "watch";
            return (
              <button
                key={pad.id}
                onClick={() => handlePadTap(pad.id)}
                disabled={disabled}
                className={[
                  "flex flex-col items-center justify-center gap-3",
                  "aspect-square rounded-[2rem] min-h-[180px]",
                  "font-masque font-bold text-white text-3xl",
                  "select-none cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
                  disabled ? "cursor-default" : "active:scale-95 hover:brightness-110",
                  "transition-all",
                ].join(" ")}
                style={{
                  backgroundColor: lit ? pad.colorLight : pad.colorDark,
                  boxShadow: lit
                    ? `0 0 48px 12px ${pad.colorLight}99, 0 6px 16px rgba(0,0,0,0.35)`
                    : "0 6px 16px rgba(0,0,0,0.35)",
                  transform: lit ? "scale(1.08)" : "scale(1)",
                  transition: reducedMotion ? "none" : "all 0.15s ease",
                }}
                aria-label={pad.label}
                aria-pressed={lit}
              >
                <span className="text-5xl leading-none select-none">♪</span>
                <span>{pad.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Toast d'encouragement */}
      {encouragement && (
        <div
          key={encouragement + Date.now()}
          className="font-masque font-bold text-brun text-3xl animate-[slide-up_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
        >
          {encouragement}
        </div>
      )}

      {/* Points de progression — séquence */}
      {gamePhase !== "idle" && difficulty !== "cause-effet" && (
        <div className="flex gap-3 items-center">
          {Array.from({ length: maxLen }).map((_, i) => (
            <div
              key={i}
              className={[
                "rounded-full transition-all duration-300",
                i < sequence.length
                  ? "w-5 h-5 bg-brun scale-110"
                  : "w-4 h-4 bg-brun/25",
              ].join(" ")}
            />
          ))}
        </div>
      )}

      {/* Compteur cause-effet */}
      {gamePhase !== "idle" && difficulty === "cause-effet" && (
        <div className="flex gap-2 items-center">
          {Array.from({ length: CAUSE_EFFET_TARGET }).map((_, i) => (
            <div
              key={i}
              className={[
                "rounded-full transition-all duration-300",
                i < causeEffetTaps
                  ? "w-5 h-5 bg-brun scale-110"
                  : "w-4 h-4 bg-brun/25",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
