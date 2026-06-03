import { useState, useCallback, useRef, useMemo } from "react";
import { useAudio } from "../../hooks/useAudio";
import { pickRandomImage } from "../../data/puzzleImages";
import { Icon } from "../../components/Icon";
import type { ActivityProps, Difficulty } from "../../types";
import type { PuzzleImage } from "../../data/puzzleImages";

const GRID: Record<Difficulty, { cols: number; rows: number }> = {
  "cause-effet": { cols: 2, rows: 2 },
  "facile":      { cols: 3, rows: 3 },
  "normal":      { cols: 4, rows: 4 },
};

const PUZZLE_SIZE = 600;
// All SVGs use viewBox="0 0 300 300"
const SVG_VB = 300;

const ENCOURAGEMENTS = [
  "Bravo !", "Super !", "Bien joué !",
  "Encore une !", "Oui !",
];

type Phase = "idle" | "preview" | "playing" | "solved" | "revealed";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Strip the outer <svg> wrapper — keep only inner elements for inline embed
function extractSvgInner(svg: string): string {
  return svg
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
}

// ── Pièce dans le bac ────────────────────────────────────────────────────────
interface PieceProps {
  pieceIdx: number;
  cols: number;
  rows: number;
  svgInner: string;
  traySize: number;
  selected: boolean;
  reducedMotion: boolean;
  onClick: () => void;
}

function TrayPiece({
  pieceIdx, cols, rows, svgInner, traySize,
  selected, reducedMotion, onClick,
}: PieceProps) {
  const col = pieceIdx % cols;
  const row = Math.floor(pieceIdx / cols);
  const vbW = SVG_VB / cols;
  const vbH = SVG_VB / rows;

  return (
    <button
      onClick={onClick}
      aria-label={`Pièce ${pieceIdx + 1}`}
      aria-pressed={selected}
      className={[
        "flex-shrink-0 rounded-xl border-4 cursor-pointer select-none overflow-hidden",
        "transition-all",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white",
        selected
          ? "border-yellow-300 scale-110 shadow-[0_0_20px_6px_rgba(255,220,50,0.8)] z-10"
          : "border-white/50 hover:border-white hover:scale-105 active:scale-95",
      ].join(" ")}
      style={{
        width: traySize,
        height: traySize,
        transition: reducedMotion ? "none" : undefined,
      }}
    >
      <svg
        width={traySize}
        height={traySize}
        viewBox={`${col * vbW} ${row * vbH} ${vbW} ${vbH}`}
        dangerouslySetInnerHTML={{ __html: svgInner }}
        aria-hidden
        style={{ display: "block", pointerEvents: "none" }}
      />
    </button>
  );
}

// ── Case dans la grille ───────────────────────────────────────────────────────
interface SlotProps {
  slotIdx: number;
  cols: number;
  rows: number;
  svgInner: string;
  pieceW: number;
  pieceH: number;
  filledPieceIdx: number | null;
  correct: boolean;
  reducedMotion: boolean;
  onClick: () => void;
}

function PuzzleSlot({
  slotIdx, cols, rows, svgInner, pieceW, pieceH,
  filledPieceIdx, correct, reducedMotion, onClick,
}: SlotProps) {
  const isEmpty = filledPieceIdx === null;
  const vbW = SVG_VB / cols;
  const vbH = SVG_VB / rows;
  const pieceCol = isEmpty ? 0 : filledPieceIdx % cols;
  const pieceRow = isEmpty ? 0 : Math.floor(filledPieceIdx / cols);

  return (
    <button
      onClick={onClick}
      aria-label={`Emplacement ${slotIdx + 1}${correct ? " — correct" : ""}`}
      className={[
        "rounded-xl border-4 cursor-pointer select-none overflow-hidden",
        "transition-all",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white",
        correct
          ? "border-green-400 shadow-[0_0_16px_4px_rgba(74,222,128,0.7)] cursor-default"
          : isEmpty
          ? "border-white/20 bg-white/10 hover:border-white/50 hover:bg-white/20"
          : "border-yellow-300/60 hover:border-white/70",
      ].join(" ")}
      style={{
        width: pieceW,
        height: pieceH,
        opacity: !isEmpty && !correct ? 0.65 : 1,
        transition: reducedMotion ? "none" : undefined,
      }}
    >
      {!isEmpty && (
        <svg
          width={pieceW}
          height={pieceH}
          viewBox={`${pieceCol * vbW} ${pieceRow * vbH} ${vbW} ${vbH}`}
          dangerouslySetInnerHTML={{ __html: svgInner }}
          aria-hidden
          style={{ display: "block", pointerEvents: "none" }}
        />
      )}
    </button>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export function PuzzleActivity({
  difficulty,
  reducedMotion,
  volume,
  onCelebrate,
}: ActivityProps) {
  const { playTone, playMatch, playSoft, playClick } = useAudio(volume ?? 0.7);

  const { cols, rows } = GRID[difficulty];
  const totalPieces = cols * rows;

  const pieceW = Math.floor(PUZZLE_SIZE / cols);
  const pieceH = Math.floor(PUZZLE_SIZE / rows);
  const trayPieceSize = Math.max(100, Math.floor(Math.min(pieceW, pieceH) * 0.75));

  const [phase, setPhase] = useState<Phase>("idle");
  const [currentImage, setCurrentImage] = useState<PuzzleImage>(() => pickRandomImage());
  const [trayOrder, setTrayOrder] = useState<number[]>([]);
  const [slots, setSlots] = useState<(number | null)[]>([]);
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);
  const [correctSlots, setCorrectSlots] = useState<boolean[]>([]);
  const [encouragement, setEncouragement] = useState("");
  const [encKey, setEncKey] = useState(0);
  const encTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inline SVG inner content — bypasses Edge data-URL restrictions
  const svgInner = useMemo(
    () => extractSvgInner(currentImage.svg),
    [currentImage]
  );

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
      setSlots(pieces.map((_, i) => i));
      setCorrectSlots(new Array(totalPieces).fill(false));
      setTrayOrder([]);
      setSelectedPieceIdx(null);
      setPhase("playing");
    } else {
      setTrayOrder(shuffle(pieces));
      setSlots(new Array(totalPieces).fill(null));
      setCorrectSlots(new Array(totalPieces).fill(false));
      setSelectedPieceIdx(null);
      setPhase("playing");
    }
  }, [difficulty, totalPieces]);

  const startGame = useCallback(() => {
    setPhase("preview");
    const img = pickRandomImage();
    setCurrentImage(img);
    setTimeout(() => initPuzzle(img), 2400);
  }, [initPuzzle]);

  const handleCauseEffetTap = useCallback((slotIdx: number) => {
    if (correctSlots[slotIdx]) return;
    playTone(329.6 + slotIdx * 55, 0.4, "sine", 0.8);
    showEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    setCorrectSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = true;
      if (next.every(Boolean)) {
        setTimeout(() => { playMatch(); setPhase("solved"); }, 600);
      }
      return next;
    });
  }, [correctSlots, playTone, playMatch, showEncouragement]);

  const handleTrayPieceClick = useCallback((pieceIdx: number) => {
    playClick();
    setSelectedPieceIdx((prev) => (prev === pieceIdx ? null : pieceIdx));
  }, [playClick]);

  const handleSlotClick = useCallback((slotIdx: number) => {
    if (correctSlots[slotIdx]) return;

    if (selectedPieceIdx === null) {
      const existingPiece = slots[slotIdx];
      if (existingPiece !== null) {
        playClick();
        setSlots((prev) => { const next = [...prev]; next[slotIdx] = null; return next; });
        setTrayOrder((prev) => [...prev, existingPiece]);
        setSelectedPieceIdx(existingPiece);
      }
      return;
    }

    const isCorrect = selectedPieceIdx === slotIdx;
    const existingPiece = slots[slotIdx];

    if (isCorrect) {
      playMatch();
      showEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
      setSlots((prev) => {
        const next = [...prev];
        if (existingPiece !== null && existingPiece !== selectedPieceIdx) {
          setTrayOrder((t) => [...t, existingPiece]);
        }
        next[slotIdx] = selectedPieceIdx;
        return next;
      });
      setCorrectSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = true;
        if (next.every(Boolean)) setTimeout(() => setPhase("solved"), 700);
        return next;
      });
      setTrayOrder((prev) => prev.filter((p) => p !== selectedPieceIdx));
      setSelectedPieceIdx(null);
    } else {
      playSoft();
      setSlots((prev) => {
        const next = [...prev];
        if (existingPiece !== null) setTrayOrder((t) => [...t, existingPiece]);
        next[slotIdx] = selectedPieceIdx;
        return next;
      });
      setTrayOrder((prev) => prev.filter((p) => p !== selectedPieceIdx));
      setSelectedPieceIdx(null);
    }
  }, [selectedPieceIdx, slots, correctSlots, playMatch, playSoft, playClick, showEncouragement]);

  const handleImageReveal = useCallback(() => {
    if (phase !== "solved") return;
    playMatch();
    setPhase("revealed");
    setTimeout(() => onCelebrate(), 2800);
  }, [phase, playMatch, onCelebrate]);

  const nextPuzzle = useCallback(() => {
    const nextImg = pickRandomImage(currentImage.id);
    setPhase("preview");
    setCurrentImage(nextImg);
    setTimeout(() => initPuzzle(nextImg), 2400);
  }, [currentImage.id, initPuzzle]);

  // ── Écran d'accueil ────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-10 select-none">
        <div className="text-center flex flex-col items-center">
          <Icon name="puzzle" size={110} className="mb-4" />
          <h2 className="font-masque font-bold text-brun text-3xl sm:text-5xl">Puzzle Photo</h2>
          <p className="font-masque text-brun/60 text-2xl mt-2">
            {difficulty === "cause-effet"
              ? "Découvre l'image cachée"
              : difficulty === "facile"
              ? `Assemble les ${totalPieces} pièces`
              : `Relève le défi — ${totalPieces} pièces !`}
          </p>
        </div>
        <button
          onClick={startGame}
          autoFocus
          className={[
            "font-masque font-bold text-white text-3xl px-16 py-8 rounded-[2rem]",
            "transition-all hover:scale-105 active:scale-95",
            "shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
            "focus-visible:ring-[6px] focus-visible:ring-brun focus-visible:outline-none",
          ].join(" ")}
          style={{ backgroundColor: "#1976D2" }}
        >
          Commencer
        </button>
      </div>
    );
  }

  // ── Preview ────────────────────────────────────────────────────────────────
  if (phase === "preview") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-8 select-none">
        <p className="font-masque font-bold text-brun text-4xl flex items-center gap-3">
          <Icon name="eye" size={40} /> Regarde bien…
        </p>
        <div
          className="rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
          style={{ width: PUZZLE_SIZE, height: PUZZLE_SIZE }}
        >
          <svg
            width={PUZZLE_SIZE}
            height={PUZZLE_SIZE}
            viewBox={`0 0 ${SVG_VB} ${SVG_VB}`}
            dangerouslySetInnerHTML={{ __html: svgInner }}
            aria-label="Image à reconstituer"
            style={{ display: "block" }}
          />
        </div>
        <p className="font-masque text-brun/50 text-xl">Souviens-toi de cette image…</p>
      </div>
    );
  }

  // ── Résolu / Révélé ────────────────────────────────────────────────────────
  if (phase === "solved" || phase === "revealed") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-8 select-none">
        {phase === "solved" && (
          <p className="font-masque font-bold text-brun text-3xl animate-bounce flex items-center gap-2 justify-center">
            Bravo ! Appuie sur l'image pour découvrir son nom <Icon name="hand" size={30} />
          </p>
        )}
        <button
          onClick={handleImageReveal}
          disabled={phase === "revealed"}
          className={[
            "rounded-3xl overflow-hidden",
            "shadow-[0_10px_40px_rgba(0,0,0,0.4)]",
            phase === "solved"
              ? "cursor-pointer hover:scale-[1.03] active:scale-95 transition-all animate-[celebration_0.6s_ease-out]"
              : "cursor-default",
          ].join(" ")}
          aria-label="Appuie pour découvrir le nom"
          style={{ width: PUZZLE_SIZE, height: PUZZLE_SIZE }}
        >
          <svg
            width={PUZZLE_SIZE}
            height={PUZZLE_SIZE}
            viewBox={`0 0 ${SVG_VB} ${SVG_VB}`}
            dangerouslySetInnerHTML={{ __html: svgInner }}
            aria-label={currentImage.label}
            style={{ display: "block" }}
          />
        </button>
        {phase === "revealed" && (
          <div
            className="font-masque font-bold text-brun text-4xl sm:text-7xl animate-[slide-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
            aria-live="polite"
          >
            {currentImage.label}
          </div>
        )}
        {phase === "solved" && (
          <button
            onClick={nextPuzzle}
            className="flex items-center gap-2 font-masque font-bold text-white text-xl px-10 py-4 rounded-[1.5rem] bg-[#1976D2] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            <Icon name="puzzle" size={26} /> Autre puzzle
          </button>
        )}
      </div>
    );
  }

  // ── Jeu en cours ───────────────────────────────────────────────────────────
  const solvedCount = correctSlots.filter(Boolean).length;
  const vbW = SVG_VB / cols;
  const vbH = SVG_VB / rows;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full gap-5 px-6 py-4 select-none">

      <p className="font-masque font-bold text-brun text-2xl text-center">
        {difficulty === "cause-effet"
          ? "Appuie sur chaque carreau pour révéler l'image !"
          : selectedPieceIdx !== null
          ? "Maintenant, pose la pièce dans la grille"
          : "Choisis une pièce en bas, puis place-la dans la grille"}
      </p>

      {/* ── Grille puzzle ── */}
      <div
        className="rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${pieceW}px)`,
          gridTemplateRows: `repeat(${rows}, ${pieceH}px)`,
          gap: 4,
          padding: 4,
          backgroundColor: "rgba(0,0,0,0.35)",
          width: PUZZLE_SIZE + 8,
          height: PUZZLE_SIZE + 8,
        }}
      >
        {Array.from({ length: totalPieces }).map((_, slotIdx) => {
          if (difficulty === "cause-effet") {
            const revealed = correctSlots[slotIdx];
            const col = slotIdx % cols;
            const row = Math.floor(slotIdx / cols);
            return (
              <button
                key={slotIdx}
                onClick={() => handleCauseEffetTap(slotIdx)}
                disabled={revealed}
                aria-label={`Carreau ${slotIdx + 1}${revealed ? " — révélé" : ""}`}
                className={[
                  "overflow-hidden rounded-xl border-3 transition-all select-none",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300",
                  revealed
                    ? "border-green-400/60 cursor-default"
                    : "border-white/30 cursor-pointer active:scale-95",
                ].join(" ")}
                style={
                  revealed
                    ? { transition: reducedMotion ? "none" : undefined }
                    : {
                        background: `hsl(${slotIdx * 60 + 200}, 65%, 45%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "clamp(2rem, 6vw, 3.5rem)",
                        transition: reducedMotion ? "none" : undefined,
                      }
                }
              >
                {revealed ? (
                  <svg
                    width={pieceW}
                    height={pieceH}
                    viewBox={`${col * vbW} ${row * vbH} ${vbW} ${vbH}`}
                    dangerouslySetInnerHTML={{ __html: svgInner }}
                    aria-hidden
                    style={{ display: "block", pointerEvents: "none" }}
                  />
                ) : (
                  <Icon name="question" size={Math.floor(Math.min(pieceW, pieceH) * 0.5)} className="text-white/90" />
                )}
              </button>
            );
          }

          const filledPiece = slots[slotIdx] ?? null;
          const isCorrect = correctSlots[slotIdx];
          return (
            <PuzzleSlot
              key={slotIdx}
              slotIdx={slotIdx}
              cols={cols}
              rows={rows}
              svgInner={svgInner}
              pieceW={pieceW}
              pieceH={pieceH}
              filledPieceIdx={filledPiece}
              correct={isCorrect}
              reducedMotion={reducedMotion}
              onClick={() => handleSlotClick(slotIdx)}
            />
          );
        })}
      </div>

      {/* ── Bac de pièces ── */}
      {difficulty !== "cause-effet" && (
        <div className="w-full flex flex-col items-center gap-2">
          <p className="font-masque text-brun/60 text-lg">
            {solvedCount === totalPieces
              ? "Toutes les pièces sont en place !"
              : `${solvedCount} / ${totalPieces} pièces placées`}
          </p>
          <div
            className="flex gap-3 overflow-x-auto pb-2 px-4 max-w-full"
            style={{ scrollbarWidth: "thin" }}
          >
            {trayOrder.map((pieceIdx) => (
              <TrayPiece
                key={pieceIdx}
                pieceIdx={pieceIdx}
                cols={cols}
                rows={rows}
                svgInner={svgInner}
                traySize={trayPieceSize}
                selected={selectedPieceIdx === pieceIdx}
                reducedMotion={reducedMotion}
                onClick={() => handleTrayPieceClick(pieceIdx)}
              />
            ))}
            {trayOrder.length === 0 && (
              <p className="font-masque text-brun/40 text-xl py-4 px-6">
                Toutes les pièces sont posées !
              </p>
            )}
          </div>
        </div>
      )}

      {encouragement && (
        <div
          key={encKey}
          className="pointer-events-none fixed inset-x-0 top-1/3 flex justify-center z-30"
        >
          <span
            className={[
              "font-masque font-bold text-corail text-4xl sm:text-6xl mas-text-shadow",
              reducedMotion ? "" : "animate-[celebration_0.5s_cubic-bezier(0.34,1.56,0.64,1)]",
            ].join(" ")}
          >
            {encouragement}
          </span>
        </div>
      )}
    </div>
  );
}
