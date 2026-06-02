import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useAudio } from "../../hooks/useAudio";
import { PUZZLE_IMAGES, pickRandomImage } from "../../data/puzzleImages";
import type { ActivityProps, Difficulty } from "../../types";
import type { PuzzleImage } from "../../data/puzzleImages";

// Grille selon difficulté
const GRID: Record<Difficulty, { cols: number; rows: number }> = {
  "cause-effet": { cols: 2, rows: 2 },
  "facile":      { cols: 3, rows: 2 },
  "normal":      { cols: 3, rows: 3 },
};

// Taille de l'image puzzle (px) — adaptée selon le nombre de pièces
const PUZZLE_SIZE: Record<Difficulty, number> = {
  "cause-effet": 360,
  "facile":      390,
  "normal":      405,
};

const ENCOURAGEMENTS = [
  "Bravo ! 🎉", "Super ! ⭐", "Bien joué ! 👏",
  "Encore une ! 🌟", "Oui ! 🎵",
];

type Phase = "idle" | "preview" | "playing" | "solved" | "revealed";

interface PieceInfo {
  pieceIdx: number;   // position correcte dans la grille (row * cols + col)
  placed: boolean;    // cette pièce est posée au bon endroit
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Convertit un SVG string en data URL */
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface PieceProps {
  pieceIdx: number;
  cols: number;
  rows: number;
  imgUrl: string;
  size: number;
  selected: boolean;
  placed: boolean;
  reducedMotion: boolean;
  onClick: () => void;
}

/** Une pièce du puzzle — montre la bonne portion de l'image via background-position */
function PuzzlePiece({
  pieceIdx,
  cols,
  rows,
  imgUrl,
  size,
  selected,
  placed,
  reducedMotion,
  onClick,
}: PieceProps) {
  const col = pieceIdx % cols;
  const row = Math.floor(pieceIdx / cols);

  // background-position en % (formule CSS background-position)
  const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

  const pieceW = Math.floor(size / cols);
  const pieceH = Math.floor(size / rows);

  return (
    <button
      onClick={onClick}
      disabled={placed}
      aria-label={`Pièce ${pieceIdx + 1}`}
      aria-pressed={selected}
      className={[
        "overflow-hidden rounded-lg border-2 cursor-pointer",
        "transition-all select-none",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun",
        placed
          ? "opacity-0 pointer-events-none"
          : selected
          ? "border-soleil scale-105 shadow-[0_0_16px_4px_rgba(255,210,63,0.7)]"
          : "border-white/60 hover:border-white hover:scale-105 active:scale-95",
      ].join(" ")}
      style={{
        width: pieceW,
        height: pieceH,
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
        transition: reducedMotion ? "none" : undefined,
      }}
    />
  );
}

interface SlotProps {
  slotIdx: number;
  cols: number;
  rows: number;
  imgUrl: string;
  size: number;
  filledPieceIdx: number | null;  // quel pieceIdx est posé ici (-1 si vide)
  correct: boolean;
  selected: boolean;
  difficulty: Difficulty;
  reducedMotion: boolean;
  onClick: () => void;
}

/** Un emplacement vide dans la grille puzzle */
function PuzzleSlot({
  slotIdx,
  cols,
  rows,
  imgUrl,
  size,
  filledPieceIdx,
  correct,
  selected,
  reducedMotion,
  onClick,
}: SlotProps) {
  const col = slotIdx % cols;
  const row = Math.floor(slotIdx / cols);

  const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

  const pieceW = Math.floor(size / cols);
  const pieceH = Math.floor(size / rows);

  const isEmpty = filledPieceIdx === null;

  return (
    <button
      onClick={onClick}
      aria-label={`Emplacement ${slotIdx + 1}`}
      className={[
        "overflow-hidden rounded-lg border-2 cursor-pointer",
        "transition-all select-none",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun",
        correct
          ? "border-vert shadow-[0_0_12px_4px_rgba(143,217,75,0.6)]"
          : isEmpty
          ? "border-white/25 bg-white/10 hover:border-white/50"
          : selected
          ? "border-soleil"
          : "border-white/40 hover:border-white/70",
      ].join(" ")}
      style={{
        width: pieceW,
        height: pieceH,
        backgroundImage: !isEmpty ? `url(${imgUrl})` : undefined,
        backgroundSize: !isEmpty ? `${cols * 100}% ${rows * 100}%` : undefined,
        backgroundPosition: !isEmpty ? `${bgPosX}% ${bgPosY}%` : undefined,
        backgroundRepeat: "no-repeat",
        opacity: !isEmpty && !correct ? 0.5 : 1,
        transition: reducedMotion ? "none" : undefined,
      }}
    />
  );
}

export function PuzzleActivity({
  difficulty,
  reducedMotion,
  volume,
  onCelebrate,
}: ActivityProps) {
  const { playTone, playMatch, playSoft, playClick } = useAudio(volume ?? 0.7);

  const { cols, rows } = GRID[difficulty];
  const totalPieces = cols * rows;
  const puzzleSize = PUZZLE_SIZE[difficulty];

  const [phase, setPhase] = useState<Phase>("idle");
  const [currentImage, setCurrentImage] = useState<PuzzleImage>(() => pickRandomImage());
  const [trayOrder, setTrayOrder] = useState<number[]>([]);  // pieceIdx dans le bac
  const [slots, setSlots] = useState<(number | null)[]>([]);  // slot → pieceIdx posé
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null); // pièce sélectionnée dans le bac
  const [correctSlots, setCorrectSlots] = useState<boolean[]>([]);
  const [encouragement, setEncouragement] = useState("");
  const [encKey, setEncKey] = useState(0);
  const encTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const imgUrl = useMemo(() => svgToDataUrl(currentImage.svg), [currentImage]);

  const showEncouragement = useCallback((msg: string) => {
    if (encTimerRef.current) clearTimeout(encTimerRef.current);
    setEncKey((k) => k + 1);
    setEncouragement(msg);
    encTimerRef.current = setTimeout(() => setEncouragement(""), 1800);
  }, []);

  const initPuzzle = useCallback((img: PuzzleImage) => {
    setCurrentImage(img);
    const pieces = Array.from({ length: totalPieces }, (_, i) => i);

    if (difficulty === "cause-effet") {
      // Cause-effet : les pièces sont dans la grille, mais retournées (cachées)
      // Tapper une pièce la révèle à sa bonne place
      setSlots(pieces.map((_, i) => i));      // slots déjà "remplis"
      setCorrectSlots(new Array(totalPieces).fill(false));
      setTrayOrder([]);
      setSelectedPieceIdx(null);
      setPhase("playing");
    } else {
      // Facile / Normal : pièces mélangées dans le bac
      setTrayOrder(shuffle(pieces));
      setSlots(new Array(totalPieces).fill(null));
      setCorrectSlots(new Array(totalPieces).fill(false));
      setSelectedPieceIdx(null);
      setPhase("playing");
    }
  }, [difficulty, totalPieces]);

  // Démarrer avec une preview 2 s
  const startGame = useCallback(() => {
    setPhase("preview");
    const img = pickRandomImage();
    setCurrentImage(img);
    setTimeout(() => initPuzzle(img), 2200);
  }, [initPuzzle]);

  // ── Cause-effet : tap sur un slot caché → révèle la pièce ─────────────────
  const handleCauseEffetTap = useCallback(
    (slotIdx: number) => {
      if (correctSlots[slotIdx]) return; // déjà révélée

      playTone(329.6 + slotIdx * 32, 0.4, "sine", 1);
      showEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

      setCorrectSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = true;
        const allDone = next.every(Boolean);
        if (allDone) {
          setTimeout(() => setPhase("solved"), 600);
          playMatch();
        }
        return next;
      });
    },
    [correctSlots, playTone, playMatch, showEncouragement]
  );

  // ── Facile / Normal : sélection + placement ────────────────────────────────
  const handleTrayPieceClick = useCallback((pieceIdx: number) => {
    playClick();
    setSelectedPieceIdx((prev) => (prev === pieceIdx ? null : pieceIdx));
  }, [playClick]);

  const handleSlotClick = useCallback(
    (slotIdx: number) => {
      if (correctSlots[slotIdx]) return; // slot déjà correct, on ne bouge plus

      if (selectedPieceIdx === null) {
        // Rien sélectionné : si le slot a une pièce, on la re-prend
        const existingPiece = slots[slotIdx];
        if (existingPiece !== null) {
          playClick();
          setSlots((prev) => {
            const next = [...prev];
            next[slotIdx] = null;
            return next;
          });
          setTrayOrder((prev) => [...prev, existingPiece]);
          setSelectedPieceIdx(existingPiece);
        }
        return;
      }

      const isCorrect = selectedPieceIdx === slotIdx;
      const existingPiece = slots[slotIdx];

      if (isCorrect) {
        // Bonne position ! ✅
        playMatch();
        showEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

        setSlots((prev) => {
          const next = [...prev];
          // Si le slot avait déjà une pièce (incorrecte), elle retourne dans le bac
          if (existingPiece !== null && existingPiece !== selectedPieceIdx) {
            setTrayOrder((t) => [...t, existingPiece]);
          }
          next[slotIdx] = selectedPieceIdx;
          return next;
        });
        setCorrectSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = true;
          const allDone = next.every(Boolean);
          if (allDone) setTimeout(() => setPhase("solved"), 700);
          return next;
        });
        setTrayOrder((prev) => prev.filter((p) => p !== selectedPieceIdx));
        setSelectedPieceIdx(null);
      } else {
        // Mauvaise position — son doux, pièce reste sélectionnée
        playSoft();
        // On pose quand même la pièce (incorrecte, visuellement grayed out)
        // pour que l'utilisateur puisse visualiser sa progression
        setSlots((prev) => {
          const next = [...prev];
          if (existingPiece !== null) {
            // Remettre l'ancienne pièce dans le bac
            setTrayOrder((t) => [...t, existingPiece]);
          }
          next[slotIdx] = selectedPieceIdx;
          return next;
        });
        setTrayOrder((prev) => prev.filter((p) => p !== selectedPieceIdx));
        setSelectedPieceIdx(null);
      }
    },
    [selectedPieceIdx, slots, correctSlots, playMatch, playSoft, playClick, showEncouragement]
  );

  // ── Révéler le nom ─────────────────────────────────────────────────────────
  const handleImageReveal = useCallback(() => {
    if (phase !== "solved") return;
    playMatch();
    setPhase("revealed");
    setTimeout(() => onCelebrate(), 2500);
  }, [phase, playMatch, onCelebrate]);

  // ── Rejouer avec une autre image ──────────────────────────────────────────
  const nextPuzzle = useCallback(() => {
    const nextImg = pickRandomImage(currentImage.id);
    setPhase("preview");
    setCurrentImage(nextImg);
    setTimeout(() => initPuzzle(nextImg), 2200);
  }, [currentImage.id, initPuzzle]);

  // Accès clavier : Tab pour naviguer, Espace/Entrée déjà gérés par button

  // ── Rendu ──────────────────────────────────────────────────────────────────

  // Idle
  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-10 select-none">
        <h2 className="font-masque font-bold text-brun text-4xl">🧩 Puzzle Photo</h2>
        <button
          onClick={startGame}
          autoFocus
          className={[
            "font-masque font-bold text-white text-3xl px-16 py-8 rounded-[2rem]",
            "transition-all hover:scale-105 active:scale-95",
            "shadow-[0_6px_20px_rgba(0,0,0,0.3)]",
            "focus-visible:ring-[6px] focus-visible:ring-brun focus-visible:outline-none",
          ].join(" ")}
          style={{ backgroundColor: "#1976D2" }}
        >
          Commencer 🧩
        </button>
      </div>
    );
  }

  // Preview
  if (phase === "preview") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-8 select-none">
        <p className="font-masque font-bold text-brun text-3xl">Regarde bien... 👀</p>
        <div
          className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          style={{ width: puzzleSize, height: puzzleSize }}
        >
          <img
            src={imgUrl}
            alt="Image à reconstituer"
            width={puzzleSize}
            height={puzzleSize}
            style={{ display: "block" }}
          />
        </div>
        <p className="font-masque text-brun/50 text-xl">
          Souviens-toi de l'image…
        </p>
      </div>
    );
  }

  // Résolu → affiche l'image complète et invite à taper
  if (phase === "solved" || phase === "revealed") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-8 select-none">
        <p className="font-masque font-bold text-brun text-3xl">
          {phase === "revealed" ? "" : "Bravo ! Appuie sur l'image 👆"}
        </p>

        {/* Image complète — tap pour révéler le nom */}
        <button
          onClick={handleImageReveal}
          disabled={phase === "revealed"}
          className={[
            "rounded-2xl overflow-hidden",
            "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
            phase === "solved"
              ? "cursor-pointer hover:scale-[1.02] active:scale-95 transition-all animate-[celebration_0.6s_ease-out]"
              : "cursor-default",
          ].join(" ")}
          aria-label="Appuie pour découvrir le nom"
          style={{ width: puzzleSize, height: puzzleSize }}
        >
          <img
            src={imgUrl}
            alt={currentImage.label}
            width={puzzleSize}
            height={puzzleSize}
            style={{ display: "block" }}
          />
        </button>

        {/* Nom révélé */}
        {phase === "revealed" && (
          <div
            className="font-masque font-bold text-brun text-6xl animate-[slide-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
            aria-live="polite"
          >
            {currentImage.label}
          </div>
        )}
      </div>
    );
  }

  // ── Phase de jeu ───────────────────────────────────────────────────────────
  const placedInTray = new Set(trayOrder);
  const solvedCount = correctSlots.filter(Boolean).length;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full px-8 py-6 gap-6 select-none">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="font-masque font-bold text-brun text-3xl">🧩 Puzzle Photo</h2>
        <p className="font-masque text-brun/60 text-xl mt-1">
          {difficulty === "cause-effet"
            ? "Appuie sur chaque pièce pour la révéler ! 👆"
            : selectedPieceIdx !== null
            ? "Maintenant choisis un emplacement 🎯"
            : "Choisis une pièce dans le bac 👇"}
        </p>
      </div>

      {/* Grille puzzle */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.3)]"
        style={{ width: puzzleSize, height: puzzleSize }}
      >
        {/* Image de fond semi-transparente (guide visuel) */}
        <img
          src={imgUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none select-none"
        />

        {/* Grille de cases */}
        <div
          className="relative z-10"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: "100%",
            height: "100%",
            gap: 3,
            padding: 3,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        >
          {Array.from({ length: totalPieces }).map((_, slotIdx) => {
            if (difficulty === "cause-effet") {
              // Cause-effet : case cachée (grise) ou révélée (image)
              const revealed = correctSlots[slotIdx];
              const pieceIdx = slotIdx; // chaque case = sa pièce correcte
              const col = slotIdx % cols;
              const row = Math.floor(slotIdx / cols);
              const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
              const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

              return (
                <button
                  key={slotIdx}
                  onClick={() => handleCauseEffetTap(slotIdx)}
                  disabled={revealed}
                  aria-label={`Case ${slotIdx + 1}${revealed ? " révélée" : ""}`}
                  className={[
                    "overflow-hidden rounded-md border-2 transition-all select-none",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun",
                    revealed
                      ? "border-vert/50 cursor-default"
                      : "border-white/40 bg-brun/30 cursor-pointer hover:bg-brun/40 active:scale-95",
                  ].join(" ")}
                  style={
                    revealed
                      ? {
                          backgroundImage: `url(${imgUrl})`,
                          backgroundSize: `${cols * 100}% ${rows * 100}%`,
                          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                          backgroundRepeat: "no-repeat",
                          transition: reducedMotion ? "none" : undefined,
                        }
                      : { transition: reducedMotion ? "none" : undefined }
                  }
                >
                  {!revealed && (
                    <span className="text-3xl" role="img" aria-hidden>❓</span>
                  )}
                </button>
              );
            }

            // Facile / Normal — slot
            const filledPiece = slots[slotIdx] ?? null;
            const isCorrect = correctSlots[slotIdx];

            return (
              <PuzzleSlot
                key={slotIdx}
                slotIdx={slotIdx}
                cols={cols}
                rows={rows}
                imgUrl={imgUrl}
                size={puzzleSize}
                filledPieceIdx={filledPiece}
                correct={isCorrect}
                selected={false}
                difficulty={difficulty}
                reducedMotion={reducedMotion}
                onClick={() => handleSlotClick(slotIdx)}
              />
            );
          })}
        </div>
      </div>

      {/* Bac de pièces (facile/normal uniquement) */}
      {difficulty !== "cause-effet" && (
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="font-masque text-brun/50 text-sm">
            {solvedCount}/{totalPieces} pièces placées
          </p>
          <div
            className="flex flex-wrap justify-center gap-3 p-3 rounded-2xl"
            style={{ backgroundColor: "rgba(74,59,47,0.08)" }}
          >
            {trayOrder.map((pieceIdx) => (
              <PuzzlePiece
                key={pieceIdx}
                pieceIdx={pieceIdx}
                cols={cols}
                rows={rows}
                imgUrl={imgUrl}
                size={puzzleSize}
                selected={selectedPieceIdx === pieceIdx}
                placed={!placedInTray.has(pieceIdx)}
                reducedMotion={reducedMotion}
                onClick={() => handleTrayPieceClick(pieceIdx)}
              />
            ))}
            {trayOrder.length === 0 && (
              <p className="font-masque text-brun/40 text-lg py-2 px-4">
                Toutes les pièces sont posées !
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toast d'encouragement */}
      {encouragement && (
        <div
          key={encKey}
          className="font-masque font-bold text-brun text-3xl animate-[slide-up_0.4s_cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
        >
          {encouragement}
        </div>
      )}
    </div>
  );
}
