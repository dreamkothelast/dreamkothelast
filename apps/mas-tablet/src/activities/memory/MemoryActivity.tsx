import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAudio } from "../../hooks/useAudio";
import { pickItems, shuffle, type ImageItem } from "../../data/imageSets";
import { Icon } from "../../components/Icon";
import type { ActivityProps, ImageTheme } from "../../types";
import type { Difficulty } from "../../types";

// Dos de carte coloré et reconnaissable — gradient bleu-violet + étoiles
function CardBackFace() {
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden text-white"
      style={{
        background: "linear-gradient(135deg, #1565C0 0%, #6A1B9A 100%)",
      }}
    >
      {/* Étoiles aux coins */}
      <Icon name="star" size={20} className="absolute top-[10%] left-[10%] opacity-80" />
      <Icon name="star" size={20} className="absolute top-[10%] right-[10%] opacity-80" />
      <Icon name="star" size={20} className="absolute bottom-[10%] left-[10%] opacity-80" />
      <Icon name="star" size={20} className="absolute bottom-[10%] right-[10%] opacity-80" />
      {/* Centre */}
      <Icon
        name="question"
        size={64}
        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
      />
    </div>
  );
}

const ENCOURAGEMENTS = ["Bravo !", "Super !", "Bien joué !", "Génial !", "Magnifique !", "Oui !"];

function gridConfig(difficulty: Difficulty) {
  switch (difficulty) {
    case "cause-effet":
      return { cols: 2, rows: 2, pairs: 2, causeEffet: true };
    case "facile":
      return { cols: 3, rows: 2, pairs: 3, causeEffet: false };
    case "normal":
    default:
      return { cols: 4, rows: 4, pairs: 8, causeEffet: false };
  }
}

const DIFF_LABELS: { key: Difficulty; label: string; icon: string }[] = [
  { key: "cause-effet", label: "Découverte", icon: "hand" },
  { key: "facile",      label: "Facile",     icon: "star" },
  { key: "normal",      label: "Normal",     icon: "target" },
];

interface Card {
  key: number;
  itemId: string;
  icon: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(theme: ImageTheme, cfg: ReturnType<typeof gridConfig>): Card[] {
  let items: ImageItem[];
  if (cfg.causeEffet) {
    items = pickItems(theme, cfg.cols * cfg.rows);
  } else {
    const base = pickItems(theme, cfg.pairs);
    items = shuffle([...base, ...base]);
  }
  return items.map((it, i) => ({
    key: i,
    itemId: it.id,
    icon: it.icon,
    label: it.label,
    flipped: false,
    matched: false,
  }));
}

export function MemoryActivity({
  difficulty,
  intensity,
  reducedMotion,
  theme,
  volume = 0.7,
  onCelebrate,
}: ActivityProps) {
  // Difficulté locale — peut être changée en-jeu sans quitter l'activité
  const [localDiff, setLocalDiff] = useState<Difficulty>(difficulty);

  const cfg = useMemo(() => gridConfig(localDiff), [localDiff]);
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(theme, gridConfig(localDiff)));

  const [phase, setPhase] = useState<"preview" | "play">("preview");
  const [picks, setPicks] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const toastCounter = useRef(0);

  const { playMatch, playSoft, playFlip, resume } = useAudio(volume);

  const flipDur = reducedMotion ? 0 : intensity === "vif" ? 320 : 480;
  const previewMs = reducedMotion ? 600 : cfg.causeEffet ? 0 : localDiff === "facile" ? 2600 : 2200;

  // Reconstruction du jeu quand la difficulté locale change
  const startWithDifficulty = useCallback((diff: Difficulty) => {
    const newCfg = gridConfig(diff);
    const newDeck = buildDeck(theme, newCfg);
    setLocalDiff(diff);
    setDeck(newDeck);
    setPicks([]);
    setLocked(false);
    setToast(null);

    if (newCfg.causeEffet) {
      setPhase("play");
    } else {
      setPhase("preview");
      const previewDur = reducedMotion ? 600 : diff === "facile" ? 2600 : 2200;
      // Montre les cartes puis les cache
      setDeck(newDeck.map((c) => ({ ...c, flipped: true })));
      const t = setTimeout(() => {
        setDeck(newDeck.map((c) => ({ ...c, flipped: false })));
        setPhase("play");
      }, previewDur);
      return () => clearTimeout(t);
    }
  }, [theme, reducedMotion]);

  // Phase d'observation initiale au premier rendu
  useEffect(() => {
    if (cfg.causeEffet || previewMs === 0) {
      setPhase("play");
      return;
    }
    setPhase("preview");
    setDeck((d) => d.map((c) => ({ ...c, flipped: true })));
    const t = setTimeout(() => {
      setDeck((d) => d.map((c) => ({ ...c, flipped: false })));
      setPhase("play");
    }, previewMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((text: string) => {
    toastCounter.current += 1;
    setToast({ text, key: toastCounter.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1200);
    return () => clearTimeout(t);
  }, [toast]);

  const checkWin = useCallback(
    (next: Card[]) => {
      const done = cfg.causeEffet
        ? next.every((c) => c.flipped)
        : next.every((c) => c.matched);
      if (done) setTimeout(() => onCelebrate(), 900);
    },
    [cfg.causeEffet, onCelebrate]
  );

  const handleCardClick = useCallback(
    (index: number) => {
      resume();
      if (phase !== "play" || locked) return;
      const card = deck[index];
      if (card.flipped || card.matched) return;

      if (cfg.causeEffet) {
        playMatch();
        showToast(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
        const next = deck.map((c, i) =>
          i === index ? { ...c, flipped: true, matched: true } : c
        );
        setDeck(next);
        checkWin(next);
        return;
      }

      playFlip();
      const flippedDeck = deck.map((c, i) => (i === index ? { ...c, flipped: true } : c));
      setDeck(flippedDeck);
      const nextPicks = [...picks, index];

      if (nextPicks.length < 2) {
        setPicks(nextPicks);
        return;
      }

      setLocked(true);
      const [a, b] = nextPicks;
      const isMatch = flippedDeck[a].itemId === flippedDeck[b].itemId;

      if (isMatch) {
        setTimeout(() => {
          playMatch();
          showToast(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
          const matched = flippedDeck.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          );
          setDeck(matched);
          setPicks([]);
          setLocked(false);
          checkWin(matched);
        }, 350);
      } else {
        setTimeout(() => {
          playSoft();
          setTimeout(() => {
            setDeck((d) =>
              d.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))
            );
            setPicks([]);
            setLocked(false);
          }, 700);
        }, 350);
      }
    },
    [phase, locked, deck, picks, cfg.causeEffet, playMatch, playFlip, playSoft, resume, showToast, checkWin]
  );

  const gapClass = cfg.cols >= 4 ? "gap-4" : "gap-6";
  const cardSize =
    cfg.cols <= 2
      ? "clamp(150px, 28vw, 280px)"
      : cfg.cols === 3
      ? "clamp(120px, 20vw, 220px)"
      : "clamp(90px, 15vw, 170px)";

  return (
    <div className="relative flex-1 flex flex-col items-center w-full h-full px-6 pb-6 pt-3 bg-gradient-to-b from-[#FFF1D6] to-[#FFF6E9]">

      {/* Sélecteur de difficulté en haut */}
      <div className="flex gap-3 mb-4 z-10">
        {DIFF_LABELS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => startWithDifficulty(key)}
            className={[
              "flex items-center gap-2 font-masque font-bold text-base px-5 py-3 rounded-[1.5rem]",
              "min-h-[52px] select-none cursor-pointer",
              "transition-all duration-200 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun",
              localDiff === key
                ? "bg-brun text-creme shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-[1.04]"
                : "bg-creme/80 text-brun/70 border-2 border-brun/20 hover:bg-creme",
            ].join(" ")}
            aria-pressed={localDiff === key}
          >
            <Icon name={icon} size={22} /> {label}
          </button>
        ))}
      </div>

      {/* Consigne */}
      <div className="mb-4 pointer-events-none z-10">
        <p className="font-masque text-brun/60 text-xl select-none text-center">
          {phase === "preview"
            ? "Regarde bien les images…"
            : cfg.causeEffet
            ? "Touche les cartes pour les retourner"
            : "Retrouve les paires identiques"}
        </p>
      </div>

      {/* Grille de cartes — centrée, occupe l'espace disponible */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          className={`grid ${gapClass} place-items-center`}
          style={{
            gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))`,
            maxWidth: cfg.cols >= 4 ? "min(90vw, 920px)" : "min(80vw, 720px)",
          }}
          role="grid"
          aria-label="Cartes du jeu Les Paires"
        >
          {deck.map((card, i) => {
            const showFace = card.flipped || card.matched;
            return (
              <button
                key={card.key}
                role="gridcell"
                tabIndex={i + 1}
                onClick={() => handleCardClick(i)}
                disabled={card.matched && !cfg.causeEffet}
                aria-label={showFace ? card.label : `Carte ${i + 1}, cachée`}
                style={{ width: cardSize }}
                className={[
                  "mas-flip-card relative select-none cursor-pointer aspect-square",
                  "rounded-[1.5rem] transition-transform duration-200",
                  "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun focus-visible:ring-offset-2 focus-visible:ring-offset-creme",
                  card.matched ? "scale-[1.02]" : "hover:scale-[1.05] active:scale-95",
                ].join(" ")}
              >
                <div
                  className={`mas-flip-inner ${showFace ? "is-flipped" : ""}`}
                  style={{ ["--flip-dur" as string]: `${flipDur}ms` }}
                >
                  {/* Dos de carte */}
                  <div
                    className={[
                      "mas-flip-face rounded-[1.5rem] overflow-hidden",
                      "border-4 border-[#1565C0]/60 shadow-tuile",
                    ].join(" ")}
                  >
                    <CardBackFace />
                  </div>

                  {/* Face avant */}
                  <div
                    className={[
                      "mas-flip-face mas-flip-face--back rounded-[1.5rem] border-4 shadow-tuile",
                      "flex flex-col items-center justify-center gap-2",
                      card.matched
                        ? "bg-vert-clair border-vert"
                        : "bg-creme border-soleil",
                    ].join(" ")}
                  >
                    <Icon
                      name={card.icon}
                      title={card.label}
                      style={{ width: "clamp(2.8rem,11vw,6rem)", height: "auto" }}
                    />
                    <span className="font-masque font-bold text-brun text-[clamp(0.75rem,1.8vw,1.1rem)] leading-tight px-2 text-center">
                      {card.label}
                    </span>

                    {card.matched && !reducedMotion && (
                      <Icon
                        name="sparkle"
                        size={32}
                        className="absolute -top-2 -right-2 motion-safe:animate-[wiggle_0.6s_ease-in-out]"
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast d'encouragement */}
      {toast && (
        <div
          key={toast.key}
          className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center z-20"
          aria-live="polite"
        >
          <span
            className={[
              "font-masque font-bold text-corail text-6xl mas-text-shadow",
              reducedMotion ? "" : "animate-[celebration_0.6s_cubic-bezier(0.34,1.56,0.64,1)]",
            ].join(" ")}
          >
            {toast.text}
          </span>
        </div>
      )}
    </div>
  );
}
