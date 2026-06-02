import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAudio } from "../../hooks/useAudio";
import { pickItems, shuffle, type ImageItem } from "../../data/imageSets";
import type { ActivityProps, ImageTheme } from "../../types";

// Mappe le contrat ActivityProps (theme requis) avec les helpers de ce fichier.

// Petite mascotte simplifiée pour le dos des cartes — cohérence affective.
// Le même visage souriant accueille l'enfant/adulte sur chaque carte cachée.
function CardBackFace() {
  return (
    <svg viewBox="0 0 100 100" className="w-1/2 h-1/2" aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill="#FFE88C" stroke="#4A3B2F" strokeWidth="4" />
      <circle cx="40" cy="46" r="5" fill="#4A3B2F" />
      <circle cx="60" cy="46" r="5" fill="#4A3B2F" />
      <ellipse cx="32" cy="56" rx="6" ry="4" fill="#FF7A6B" opacity="0.5" />
      <ellipse cx="68" cy="56" rx="6" ry="4" fill="#FF7A6B" opacity="0.5" />
      <path d="M 38 60 Q 50 70 62 60" stroke="#4A3B2F" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Encouragements doux affichés à chaque réussite (renforcement positif).
const ENCOURAGEMENTS = ["Bravo !", "Super !", "Bien joué !", "Génial !", "Magnifique !", "Oui !"];

// Configuration de grille selon la difficulté.
function gridConfig(difficulty: ActivityProps["difficulty"]) {
  switch (difficulty) {
    case "cause-effet":
      // Mode cause à effet : 4 cartes, aucune notion de paire, chaque carte est une récompense.
      return { cols: 2, rows: 2, pairs: 2, causeEffet: true };
    case "facile":
      return { cols: 3, rows: 2, pairs: 3, causeEffet: false };
    case "normal":
    default:
      return { cols: 4, rows: 4, pairs: 8, causeEffet: false };
  }
}

interface Card {
  key: number;        // identité unique de l'emplacement
  itemId: string;     // identifiant de l'image (les paires partagent le même)
  emoji: string;
  label: string;
  flipped: boolean;   // face visible
  matched: boolean;   // appariée (reste visible, halo vert)
}

// Construit le paquet de cartes mélangé.
function buildDeck(theme: ImageTheme, cfg: ReturnType<typeof gridConfig>): Card[] {
  let items: ImageItem[];
  if (cfg.causeEffet) {
    // Cause-effet : 4 images distinctes (pas besoin de paires)
    items = pickItems(theme, cfg.cols * cfg.rows);
  } else {
    // Mode paires : on prend `pairs` images, on les double
    const base = pickItems(theme, cfg.pairs);
    items = shuffle([...base, ...base]);
  }
  return items.map((it, i) => ({
    key: i,
    itemId: it.id,
    emoji: it.emoji,
    label: it.label,
    flipped: false,
    matched: false,
  }));
}

/**
 * Jeu Les Paires (Memory) — accessible, sans échec, sans score compétitif.
 *
 * • Cause-effet : chaque carte touchée se retourne et récompense (pas de paires).
 * • Facile / Normal : vraies paires, avec temps d'observation au départ.
 *   Erreur = son doux + on rejoue. Réussite = son joyeux + halo + encouragement.
 * • Fin = écran de célébration (onCelebrate).
 *
 * Accessibilité : chaque carte est un bouton focusable et ordonné (tabIndex),
 * activable au clavier/contacteur (Espace/Entrée), focus très visible.
 */
export function MemoryActivity({
  difficulty,
  intensity,
  reducedMotion,
  theme,
  volume = 0.7,
  onCelebrate,
}: ActivityProps) {
  const cfg = useMemo(() => gridConfig(difficulty), [difficulty]);
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(theme, cfg));

  // "preview" = observation initiale, "play" = jouable
  const [phase, setPhase] = useState<"preview" | "play">("preview");
  const [picks, setPicks] = useState<number[]>([]);   // indices retournés en attente
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const toastCounter = useRef(0);

  const { playMatch, playSoft, playFlip, resume } = useAudio(volume);

  // Durée d'animation selon réglages
  const flipDur = reducedMotion ? 0 : intensity === "vif" ? 320 : 480;

  // Durée d'observation initiale (plus longue en facile, courte/absente en cause-effet)
  const previewMs = reducedMotion ? 600 : cfg.causeEffet ? 0 : difficulty === "facile" ? 2600 : 2200;

  // Phase d'observation : montrer toutes les cartes puis les retourner.
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

  // Affiche un encouragement flottant
  const showToast = useCallback((text: string) => {
    toastCounter.current += 1;
    setToast({ text, key: toastCounter.current });
  }, []);

  // Effacement automatique du toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1200);
    return () => clearTimeout(t);
  }, [toast]);

  // Vérifie la fin de partie (toutes cartes appariées/révélées) → célébration
  const checkWin = useCallback(
    (next: Card[]) => {
      const done = cfg.causeEffet
        ? next.every((c) => c.flipped)
        : next.every((c) => c.matched);
      if (done) {
        // Petit délai pour savourer la dernière réussite avant la célébration
        setTimeout(() => onCelebrate(), 900);
      }
    },
    [cfg.causeEffet, onCelebrate]
  );

  // ── Gestion du clic sur une carte ───────────────────────────
  const handleCardClick = useCallback(
    (index: number) => {
      resume();
      if (phase !== "play" || locked) return;
      const card = deck[index];
      if (card.flipped || card.matched) return;

      // ─ Mode cause à effet : chaque carte est une récompense ─
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

      // ─ Mode paires ─
      playFlip();
      const flippedDeck = deck.map((c, i) => (i === index ? { ...c, flipped: true } : c));
      setDeck(flippedDeck);
      const nextPicks = [...picks, index];

      if (nextPicks.length < 2) {
        setPicks(nextPicks);
        return;
      }

      // Deux cartes retournées : on évalue
      setLocked(true);
      const [a, b] = nextPicks;
      const isMatch = flippedDeck[a].itemId === flippedDeck[b].itemId;

      if (isMatch) {
        // Réussite : son joyeux + encouragement + halo, les cartes restent
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
        // Pas de correspondance : son doux, on retourne en douceur (aucune pénalité)
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

  // Taille de carte responsive selon la grille : plus la grille est petite,
  // plus les cartes sont grandes (généreux pour les niveaux les plus simples).
  const gapClass = cfg.cols >= 4 ? "gap-4" : "gap-8";
  const cardSize =
    cfg.cols <= 2
      ? "clamp(140px, 26vw, 260px)"
      : cfg.cols === 3
      ? "clamp(110px, 20vw, 200px)"
      : "clamp(80px, 15vw, 160px)";

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center w-full h-full px-6 py-4 bg-gradient-to-b from-[#FFF1D6] to-[#FFF6E9]">
      {/* Consigne / phase d'observation */}
      <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-10">
        <p className="font-masque text-brun/60 text-2xl select-none text-center">
          {phase === "preview"
            ? "👀 Regarde bien les images…"
            : cfg.causeEffet
            ? "👆 Touche les cartes pour les retourner"
            : "🧩 Retrouve les paires identiques"}
        </p>
      </div>

      {/* Grille de cartes */}
      <div
        className={`grid ${gapClass} place-items-center`}
        style={{
          gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))`,
          // Largeur max pour garder de grandes cartes lisibles
          maxWidth: cfg.cols >= 4 ? "min(90vw, 900px)" : "min(80vw, 680px)",
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
              aria-label={
                showFace ? card.label : `Carte ${i + 1}, cachée`
              }
              style={{ width: cardSize }}
              className={[
                "mas-flip-card relative select-none cursor-pointer aspect-square",
                "rounded-mas-xl transition-transform duration-200",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun focus-visible:ring-offset-2 focus-visible:ring-offset-creme",
                card.matched ? "scale-[1.02]" : "hover:scale-[1.04] active:scale-95",
              ].join(" ")}
            >
              <div
                className={`mas-flip-inner ${showFace ? "is-flipped" : ""}`}
                style={{ ["--flip-dur" as string]: `${flipDur}ms` }}
              >
                {/* Dos de la carte (visage souriant) */}
                <div
                  className={[
                    "mas-flip-face rounded-mas-xl border-4 border-ciel-fonce shadow-tuile",
                    "bg-gradient-to-br from-ciel-clair to-ciel",
                  ].join(" ")}
                >
                  <CardBackFace />
                </div>

                {/* Face avant (image) */}
                <div
                  className={[
                    "mas-flip-face mas-flip-face--back rounded-mas-xl border-4 shadow-tuile",
                    card.matched
                      ? "bg-vert-clair border-vert"
                      : "bg-creme border-soleil",
                  ].join(" ")}
                >
                  <span className="text-[clamp(2.5rem,9vw,5rem)] leading-none" role="img" aria-hidden="true">
                    {card.emoji}
                  </span>

                  {/* Halo / étincelle de réussite */}
                  {card.matched && !reducedMotion && (
                    <span className="absolute -top-2 -right-2 text-3xl motion-safe:animate-[wiggle_0.6s_ease-in-out]" aria-hidden>
                      ✨
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Encouragement flottant */}
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
