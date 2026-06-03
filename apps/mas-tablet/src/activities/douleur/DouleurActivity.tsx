import { useState, useCallback } from "react";
import { useAudio } from "../../hooks/useAudio";
import type { ActivityProps } from "../../types";

// ── 6 niveaux de douleur — visages SVG inline ───────────────────────────────

interface PainLevel {
  level: number;
  label: string;
  sublabel: string;
  bg: string;        // couleur du visage
  ring: string;      // couleur de la bordure sélectionnée
  noteHz: number;
  face: React.ReactNode;
}

// Visages SVG simples et expressifs (100×100 viewBox)
function Face0() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#4CAF50"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#2E7D32" strokeWidth="3"/>
      {/* Yeux heureux — arcs */}
      <path d="M30 40 Q37 30 44 40" stroke="#1B5E20" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M56 40 Q63 30 70 40" stroke="#1B5E20" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Joues */}
      <ellipse cx="27" cy="60" rx="9" ry="6" fill="#FF8A80" opacity="0.5"/>
      <ellipse cx="73" cy="60" rx="9" ry="6" fill="#FF8A80" opacity="0.5"/>
      {/* Grand sourire */}
      <path d="M25 60 Q50 82 75 60" stroke="#1B5E20" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Face1() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#8BC34A"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#558B2F" strokeWidth="3"/>
      <ellipse cx="36" cy="42" rx="7" ry="8" fill="#33691E"/>
      <ellipse cx="64" cy="42" rx="7" ry="8" fill="#33691E"/>
      <ellipse cx="36" cy="42" rx="3.5" ry="5" fill="#111"/>
      <ellipse cx="64" cy="42" rx="3.5" ry="5" fill="#111"/>
      <ellipse cx="27" cy="60" rx="9" ry="6" fill="#FF8A80" opacity="0.45"/>
      <ellipse cx="73" cy="60" rx="9" ry="6" fill="#FF8A80" opacity="0.45"/>
      <path d="M30 63 Q50 76 70 63" stroke="#33691E" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Face2() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#FFC107"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#F57F17" strokeWidth="3"/>
      <ellipse cx="36" cy="42" rx="7" ry="8" fill="#E65100"/>
      <ellipse cx="64" cy="42" rx="7" ry="8" fill="#E65100"/>
      <ellipse cx="36" cy="42" rx="3.5" ry="5" fill="#111"/>
      <ellipse cx="64" cy="42" rx="3.5" ry="5" fill="#111"/>
      {/* Bouche neutre */}
      <line x1="33" y1="68" x2="67" y2="68" stroke="#E65100" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

function Face3() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#FF9800"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#E65100" strokeWidth="3"/>
      <ellipse cx="36" cy="42" rx="7" ry="8" fill="#BF360C"/>
      <ellipse cx="64" cy="42" rx="7" ry="8" fill="#BF360C"/>
      <ellipse cx="36" cy="42" rx="3.5" ry="5" fill="#111"/>
      <ellipse cx="64" cy="42" rx="3.5" ry="5" fill="#111"/>
      {/* Sourcils froncés */}
      <line x1="28" y1="30" x2="44" y2="35" stroke="#BF360C" strokeWidth="3" strokeLinecap="round"/>
      <line x1="56" y1="35" x2="72" y2="30" stroke="#BF360C" strokeWidth="3" strokeLinecap="round"/>
      {/* Bouche légèrement courbée */}
      <path d="M32 70 Q50 62 68 70" stroke="#BF360C" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Face4() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#F44336"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#B71C1C" strokeWidth="3"/>
      {/* Yeux plissés */}
      <path d="M28 40 L44 46" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <path d="M44 40 L28 46" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <path d="M56 40 L72 46" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <path d="M72 40 L56 46" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      {/* Sourcils */}
      <path d="M26 32 L44 38" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <path d="M56 38 L74 32" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      {/* Grimace */}
      <path d="M28 72 Q50 56 72 72" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Larmes */}
      <path d="M34 48 Q31 58 34 66" stroke="#90CAF9" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M66 48 Q69 58 66 66" stroke="#90CAF9" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Face5() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#B71C1C"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#7F0000" strokeWidth="3"/>
      {/* Yeux X */}
      <path d="M28 36 L44 50" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M44 36 L28 50" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M56 36 L72 50" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M72 36 L56 50" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Sourcils plissés fort */}
      <path d="M24 28 L46 38" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M54 38 L76 28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Bouche tordue */}
      <path d="M26 75 Q50 56 74 75" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Grosses larmes */}
      <ellipse cx="34" cy="60" rx="5" ry="9" fill="#64B5F6" opacity="0.9"/>
      <ellipse cx="66" cy="60" rx="5" ry="9" fill="#64B5F6" opacity="0.9"/>
    </svg>
  );
}

const PAIN_LEVELS: PainLevel[] = [
  { level: 0, label: "Pas de douleur",    sublabel: "Aucune douleur",        bg: "#4CAF50", ring: "#2E7D32", noteHz: 523.2, face: <Face0 /> },
  { level: 1, label: "Très légère",       sublabel: "À peine perceptible",    bg: "#8BC34A", ring: "#558B2F", noteHz: 493.9, face: <Face1 /> },
  { level: 2, label: "Légère",            sublabel: "Gêne légère",            bg: "#FFC107", ring: "#F57F17", noteHz: 440.0, face: <Face2 /> },
  { level: 3, label: "Modérée",           sublabel: "Douleur présente",       bg: "#FF9800", ring: "#E65100", noteHz: 392.0, face: <Face3 /> },
  { level: 4, label: "Forte",             sublabel: "Très inconfortable",     bg: "#F44336", ring: "#B71C1C", noteHz: 329.6, face: <Face4 /> },
  { level: 5, label: "Insupportable",     sublabel: "Douleur maximale",       bg: "#B71C1C", ring: "#7F0000", noteHz: 261.6, face: <Face5 /> },
];

// ── Composant ───────────────────────────────────────────────────────────────

export function DouleurActivity({ volume = 0.7 }: ActivityProps) {
  const { playTone, resume } = useAudio(volume);
  const [selected, setSelected] = useState<number | null>(null);
  const [encKey, setEncKey] = useState(0);

  const handleSelect = useCallback(
    (level: number) => {
      resume();
      const cfg = PAIN_LEVELS[level];
      playTone(cfg.noteHz, 0.5, "sine", 0.8);
      setSelected(level);
      setEncKey((k) => k + 1);
    },
    [playTone, resume]
  );

  const selectedCfg = selected !== null ? PAIN_LEVELS[selected] : null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-8 py-6 select-none">
      {/* Titre */}
      <div className="text-center">
        <h2 className="font-masque font-bold text-brun text-4xl">Comment tu te sens ?</h2>
        <p className="font-masque text-brun/60 text-xl mt-1">
          Appuie sur le visage qui te ressemble le mieux
        </p>
      </div>

      {/* Grille 3×2 de visages */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-[860px]">
        {PAIN_LEVELS.map((pl) => {
          const isSelected = selected === pl.level;
          return (
            <button
              key={pl.level}
              onClick={() => handleSelect(pl.level)}
              aria-label={`Niveau ${pl.level} — ${pl.label}`}
              aria-pressed={isSelected}
              className={[
                "flex flex-col items-center gap-3 p-5 rounded-[2rem]",
                "cursor-pointer select-none transition-all duration-200",
                "shadow-[0_6px_20px_rgba(0,0,0,0.25)]",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
                isSelected
                  ? "scale-110 shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
                  : "hover:scale-105 active:scale-95",
              ].join(" ")}
              style={{
                backgroundColor: isSelected ? pl.bg : pl.bg + "CC",
                boxShadow: isSelected
                  ? `0 0 0 5px ${pl.ring}, 0 12px 36px rgba(0,0,0,0.4)`
                  : undefined,
              }}
            >
              {/* Visage */}
              <div className="w-20 h-20">{pl.face}</div>
              {/* Numéro */}
              <span className="font-masque font-bold text-white text-3xl sm:text-5xl leading-none drop-shadow-md">
                {pl.level}
              </span>
              {/* Label */}
              <span className="font-masque font-bold text-white text-base text-center leading-tight drop-shadow-sm">
                {pl.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Résultat sélectionné */}
      {selectedCfg && (
        <div
          key={encKey}
          className="flex flex-col items-center gap-2 animate-[slide-up_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
        >
          <div
            className="font-masque font-bold text-white text-3xl px-10 py-4 rounded-2xl shadow-lg"
            style={{ backgroundColor: selectedCfg.bg }}
          >
            Niveau {selectedCfg.level} — {selectedCfg.label}
          </div>
          <p className="font-masque text-brun/50 text-lg">{selectedCfg.sublabel}</p>
        </div>
      )}

      {/* Bouton reset discret pour accompagnant */}
      {selected !== null && (
        <button
          onClick={() => setSelected(null)}
          className="font-masque text-brun/30 text-base hover:text-brun/60 transition-colors"
          aria-label="Réinitialiser la sélection"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
