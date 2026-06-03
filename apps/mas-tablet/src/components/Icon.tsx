import type { ReactNode } from "react";

/**
 * Bibliothèque d'icônes SVG « maison » — design soigné, doux et cohérent.
 *
 * Remplace TOUS les emojis de l'application : rendu identique sur chaque
 * machine (aucune dépendance à la police emoji de Windows), vectoriel donc
 * net à toute taille, et JAMAIS lu par la synthèse vocale.
 *
 * Style : formes pleines arrondies, palette chaleureuse, profondeur subtile.
 * viewBox commun 0 0 100 100.
 *
 * Deux familles :
 *   • icônes d'interface  → tracées en `currentColor` (héritent la couleur du texte)
 *   • illustrations       → couleurs fixes (animaux, objets, scènes…)
 */

// ── Interface (currentColor) ────────────────────────────────────────────────
// Tracé épais arrondi, lisible de loin.
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const UI: Record<string, ReactNode> = {
  home: (
    <>
      <path {...stroke} d="M18 48 L50 20 L82 48" />
      <path {...stroke} d="M28 44 V80 H72 V44" />
      <path {...stroke} d="M44 80 V60 H56 V80" />
    </>
  ),
  gear: (
    <>
      <circle cx="50" cy="50" r="13" {...stroke} />
      <path
        {...stroke}
        strokeWidth={7}
        d="M50 14 V26 M50 74 V86 M14 50 H26 M74 50 H86 M25 25 L34 34 M66 66 L75 75 M75 25 L66 34 M34 66 L25 75"
      />
    </>
  ),
  close: <path {...stroke} d="M28 28 L72 72 M72 28 L28 72" />,
  play: <path fill="currentColor" d="M32 24 L78 50 L32 76 Z" />,
  pause: (
    <>
      <rect x="30" y="26" width="14" height="48" rx="5" fill="currentColor" />
      <rect x="56" y="26" width="14" height="48" rx="5" fill="currentColor" />
    </>
  ),
  stop: <rect x="28" y="28" width="44" height="44" rx="8" fill="currentColor" />,
  "arrow-left": <path {...stroke} d="M62 24 L34 50 L62 76" />,
  "arrow-right": <path {...stroke} d="M38 24 L66 50 L38 76" />,
  check: <path {...stroke} d="M24 52 L42 70 L78 30" />,
  eye: (
    <>
      <path {...stroke} strokeWidth={7} d="M14 50 Q50 22 86 50 Q50 78 14 50 Z" />
      <circle cx="50" cy="50" r="11" fill="currentColor" />
    </>
  ),
  "eye-off": (
    <>
      <path {...stroke} strokeWidth={7} d="M18 54 Q50 26 82 54" />
      <path {...stroke} strokeWidth={7} d="M26 70 L74 30" />
    </>
  ),
  trash: (
    <>
      <path {...stroke} strokeWidth={7} d="M24 32 H76" />
      <path {...stroke} strokeWidth={7} d="M30 32 L34 78 H66 L70 32" />
      <path {...stroke} strokeWidth={7} d="M40 32 V24 H60 V32" />
    </>
  ),
  refresh: (
    <>
      <path {...stroke} strokeWidth={7} d="M76 38 A30 30 0 1 0 80 60" />
      <path fill="currentColor" d="M64 18 L84 30 L62 40 Z" />
    </>
  ),
  hand: (
    <path
      fill="currentColor"
      d="M44 80 V58 L34 50 a5 5 0 0 1 6-8 l8 6 V26 a5 5 0 0 1 10 0 v18 a5 5 0 0 1 9 0 v6 a5 5 0 0 1 9 0 v22 a14 14 0 0 1-14 14 H58 a14 14 0 0 1-14-14 Z"
    />
  ),
  question: (
    <>
      <path
        {...stroke}
        strokeWidth={9}
        d="M36 38 a14 14 0 1 1 22 11 c-6 4-8 7-8 13"
      />
      <circle cx="50" cy="74" r="5.5" fill="currentColor" />
    </>
  ),
  target: (
    <>
      <circle cx="50" cy="50" r="30" {...stroke} strokeWidth={7} />
      <circle cx="50" cy="50" r="15" {...stroke} strokeWidth={7} />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </>
  ),
  "volume-mute": (
    <>
      <path fill="currentColor" d="M22 40 H34 L50 26 V74 L34 60 H22 Z" />
      <path {...stroke} strokeWidth={7} d="M62 42 L80 58 M80 42 L62 58" />
    </>
  ),
  "volume-low": (
    <>
      <path fill="currentColor" d="M22 40 H34 L50 26 V74 L34 60 H22 Z" />
      <path {...stroke} strokeWidth={6} d="M62 42 Q70 50 62 58" />
    </>
  ),
  "volume-high": (
    <>
      <path fill="currentColor" d="M22 40 H34 L50 26 V74 L34 60 H22 Z" />
      <path {...stroke} strokeWidth={6} d="M60 40 Q70 50 60 60 M70 32 Q86 50 70 68" />
    </>
  ),
  megaphone: (
    <>
      <path fill="currentColor" d="M24 42 H40 L72 24 V76 L40 58 H24 Z" />
      <rect x="30" y="58" width="12" height="20" rx="3" fill="currentColor" />
    </>
  ),
  image: (
    <>
      <rect x="18" y="24" width="64" height="52" rx="8" {...stroke} strokeWidth={7} />
      <circle cx="36" cy="40" r="6" fill="currentColor" />
      <path {...stroke} strokeWidth={7} d="M24 70 L44 50 L60 64 L70 56 L78 64" />
    </>
  ),
  mic: (
    <>
      <rect x="40" y="18" width="20" height="40" rx="10" fill="currentColor" />
      <path {...stroke} strokeWidth={7} d="M30 50 a20 20 0 0 0 40 0" />
      <path {...stroke} strokeWidth={7} d="M50 70 V82 M38 82 H62" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="50" cy="24" r="8" fill="currentColor" />
      <path {...stroke} strokeWidth={7} d="M26 40 H74 M50 40 V64 M50 64 L38 82 M50 64 L62 82" />
    </>
  ),
  palette: (
    <>
      <path
        fill="currentColor"
        d="M50 18 C28 18 14 34 14 52 c0 16 14 26 28 26 6 0 8-4 8-8 0-6 4-8 9-8 h6 c10 0 21-7 21-22 C86 34 72 18 50 18 Z"
      />
      <circle cx="34" cy="42" r="5" fill="#fff" />
      <circle cx="50" cy="34" r="5" fill="#fff" />
      <circle cx="66" cy="42" r="5" fill="#fff" />
    </>
  ),
  clock: (
    <>
      <circle cx="50" cy="50" r="32" {...stroke} strokeWidth={7} />
      <path {...stroke} strokeWidth={7} d="M50 30 V50 L66 60" />
    </>
  ),
  dot: <circle cx="50" cy="50" r="26" fill="currentColor" />,
  pencil: (
    <>
      <path {...stroke} strokeWidth={7} d="M62 18 L82 38 L36 84 H16 V64 Z" />
      <path {...stroke} strokeWidth={7} d="M56 24 L76 44" />
    </>
  ),
  // Note de musique monochrome (hérite la couleur du texte) — pour les pads colorés
  note: (
    <path
      fill="currentColor"
      d="M44 22 L74 16 V58 a10 10 0 1 1-8-10 V30 L52 33 V70 a10 10 0 1 1-8-10 Z"
    />
  ),
};

// ── Illustrations colorées ──────────────────────────────────────────────────

// Petite étoile réutilisable
const starShape = (
  <path
    fill="#FFC93C"
    stroke="#F4A100"
    strokeWidth="3"
    strokeLinejoin="round"
    d="M50 14 L60 40 L88 42 L66 60 L73 88 L50 72 L27 88 L34 60 L12 42 L40 40 Z"
  />
);

const ILLUS: Record<string, ReactNode> = {
  // ── Décor / félicitations ──────────────────────────────────────────────
  star: starShape,
  sparkle: (
    <path
      fill="#FFD23F"
      stroke="#F4A100"
      strokeWidth="3"
      strokeLinejoin="round"
      d="M50 16 C54 38 62 46 84 50 C62 54 54 62 50 84 C46 62 38 54 16 50 C38 46 46 38 50 16 Z"
    />
  ),
  heart: (
    <path
      fill="#FF6B81"
      stroke="#E63E5C"
      strokeWidth="3"
      d="M50 80 C18 58 20 32 38 30 c10-1 12 8 12 8 s2-9 12-8 c18 2 20 28-12 50 Z"
    />
  ),
  party: (
    <>
      <path fill="#FFB23F" stroke="#E6892A" strokeWidth="3" strokeLinejoin="round" d="M20 84 L40 36 L70 66 Z" />
      <circle cx="68" cy="24" r="6" fill="#FF6B81" />
      <circle cx="82" cy="46" r="5" fill="#5BC0EB" />
      <circle cx="40" cy="20" r="5" fill="#8FD94B" />
      <rect x="74" y="62" width="8" height="8" rx="2" fill="#FFC93C" transform="rotate(20 78 66)" />
    </>
  ),

  // ── Activités ───────────────────────────────────────────────────────────
  bubbles: (
    <>
      <circle cx="40" cy="56" r="24" fill="#7FD4FF" stroke="#3FA9E0" strokeWidth="3" />
      <circle cx="70" cy="36" r="14" fill="#A8E4FF" stroke="#3FA9E0" strokeWidth="3" />
      <circle cx="72" cy="68" r="9" fill="#CBF0FF" stroke="#3FA9E0" strokeWidth="3" />
      <ellipse cx="33" cy="48" rx="6" ry="4" fill="#fff" opacity="0.85" />
    </>
  ),
  cards: (
    <>
      <rect x="20" y="26" width="36" height="50" rx="6" fill="#FF8FA3" stroke="#D94F68" strokeWidth="3" transform="rotate(-10 38 51)" />
      <rect x="44" y="24" width="36" height="50" rx="6" fill="#5BC0EB" stroke="#2F8FBF" strokeWidth="3" transform="rotate(8 62 49)" />
      <circle cx="62" cy="49" r="9" fill="#fff" opacity="0.85" />
    </>
  ),
  "music-note": (
    <>
      <path fill="#9B6BD6" stroke="#6E3FA8" strokeWidth="3" d="M44 22 L74 16 V60 a10 10 0 1 1-8-10 V30 L52 34 V70 a10 10 0 1 1-8-10 Z" />
    </>
  ),
  puzzle: (
    <>
      <path
        fill="#8FD94B"
        stroke="#5FA000"
        d="M28 28 h18 a6 6 0 0 1 12 0 h18 v18 a6 6 0 0 1 0 12 v18 H58 a6 6 0 0 0-12 0 H28 V58 a6 6 0 0 0 0-12 Z"
      />
      <path
        fill="none"
        stroke="#4E8C00"
        strokeWidth="3"
        d="M28 28 h18 a6 6 0 0 1 12 0 h18 v18 a6 6 0 0 1 0 12 v18 H58 a6 6 0 0 0-12 0 H28 V58 a6 6 0 0 0 0-12 Z"
      />
    </>
  ),
  "scene-nature": (
    <>
      <circle cx="68" cy="32" r="12" fill="#FFD23F" />
      <path fill="#5FAE4B" stroke="#3F7A2E" strokeWidth="3" d="M30 78 L46 40 L62 78 Z" />
      <path fill="#6FBF55" stroke="#3F7A2E" strokeWidth="3" d="M18 80 L32 48 L46 80 Z" />
      <rect x="42" y="72" width="6" height="10" fill="#7A4A2A" />
    </>
  ),
  "feeling-hug": (
    <>
      <circle cx="50" cy="46" r="26" fill="#FFD23F" stroke="#E6A700" strokeWidth="3" />
      <circle cx="40" cy="44" r="4" fill="#5A3B1E" />
      <circle cx="60" cy="44" r="4" fill="#5A3B1E" />
      <path fill="none" stroke="#5A3B1E" strokeWidth="4" strokeLinecap="round" d="M38 56 Q50 66 62 56" />
      <ellipse cx="30" cy="52" rx="6" ry="4" fill="#FF9AA2" opacity="0.7" />
      <ellipse cx="70" cy="52" rx="6" ry="4" fill="#FF9AA2" opacity="0.7" />
    </>
  ),
  camera: (
    <>
      <rect x="16" y="34" width="68" height="46" rx="8" fill="#5B6B82" stroke="#3A4658" strokeWidth="3" />
      <path fill="#5B6B82" stroke="#3A4658" strokeWidth="3" d="M38 34 L44 24 H56 L62 34 Z" />
      <circle cx="50" cy="57" r="15" fill="#9FB4CC" stroke="#3A4658" strokeWidth="3" />
      <circle cx="50" cy="57" r="7" fill="#3A4658" />
      <circle cx="73" cy="44" r="3" fill="#FFD23F" />
    </>
  ),
  book: (
    <>
      <path fill="#FF8A5B" stroke="#D9602E" strokeWidth="3" d="M50 28 C40 22 26 22 18 26 V76 C26 72 40 72 50 78 Z" />
      <path fill="#FFB07C" stroke="#D9602E" strokeWidth="3" d="M50 28 C60 22 74 22 82 26 V76 C74 72 60 72 50 78 Z" />
      <path fill="none" stroke="#D9602E" strokeWidth="2.5" d="M50 30 V78" />
    </>
  ),

  // ── Animaux ───────────────────────────────────────────────────────────
  dog: (
    <>
      <ellipse cx="50" cy="56" rx="28" ry="24" fill="#C68A4E" stroke="#8A5A2B" strokeWidth="3" />
      <path fill="#8A5A2B" d="M22 36 q-8 18 6 26 q-2-18-6-26 Z" />
      <path fill="#8A5A2B" d="M78 36 q8 18-6 26 q2-18 6-26 Z" />
      <circle cx="40" cy="52" r="4" fill="#3A2A1A" />
      <circle cx="60" cy="52" r="4" fill="#3A2A1A" />
      <ellipse cx="50" cy="64" rx="7" ry="5" fill="#3A2A1A" />
      <path fill="none" stroke="#3A2A1A" strokeWidth="3" strokeLinecap="round" d="M50 69 V74" />
    </>
  ),
  cat: (
    <>
      <path fill="#9AA7B2" stroke="#5E6B78" strokeWidth="3" d="M26 40 L20 18 L42 34 Z" />
      <path fill="#9AA7B2" stroke="#5E6B78" strokeWidth="3" d="M74 40 L80 18 L58 34 Z" />
      <ellipse cx="50" cy="58" rx="27" ry="23" fill="#AEB9C4" stroke="#5E6B78" strokeWidth="3" />
      <circle cx="40" cy="54" r="4" fill="#2E3A45" />
      <circle cx="60" cy="54" r="4" fill="#2E3A45" />
      <path fill="#FF9AA2" d="M46 62 h8 l-4 5 Z" />
      <path stroke="#5E6B78" strokeWidth="2.5" strokeLinecap="round" d="M28 60 H40 M28 66 H40 M60 60 H72 M60 66 H72" />
    </>
  ),
  rabbit: (
    <>
      <ellipse cx="38" cy="30" rx="7" ry="20" fill="#F4E2E8" stroke="#C9A0AE" strokeWidth="3" />
      <ellipse cx="62" cy="30" rx="7" ry="20" fill="#F4E2E8" stroke="#C9A0AE" strokeWidth="3" />
      <ellipse cx="38" cy="30" rx="3" ry="12" fill="#FF9AA2" />
      <ellipse cx="62" cy="30" rx="3" ry="12" fill="#FF9AA2" />
      <ellipse cx="50" cy="62" rx="24" ry="22" fill="#F8EEF1" stroke="#C9A0AE" strokeWidth="3" />
      <circle cx="42" cy="60" r="3.5" fill="#3A2A30" />
      <circle cx="58" cy="60" r="3.5" fill="#3A2A30" />
      <path fill="#FF9AA2" d="M47 68 h6 l-3 4 Z" />
    </>
  ),
  frog: (
    <>
      <ellipse cx="50" cy="62" rx="30" ry="22" fill="#7AC74F" stroke="#4E8C2E" strokeWidth="3" />
      <circle cx="34" cy="38" r="12" fill="#8FD94B" stroke="#4E8C2E" strokeWidth="3" />
      <circle cx="66" cy="38" r="12" fill="#8FD94B" stroke="#4E8C2E" strokeWidth="3" />
      <circle cx="34" cy="38" r="5" fill="#2E3A1A" />
      <circle cx="66" cy="38" r="5" fill="#2E3A1A" />
      <path fill="none" stroke="#2E5A1A" strokeWidth="3.5" strokeLinecap="round" d="M36 66 Q50 76 64 66" />
    </>
  ),
  lion: (
    <>
      <circle cx="50" cy="52" r="34" fill="#E8A23C" stroke="#B5701A" strokeWidth="3" />
      <circle cx="50" cy="54" r="23" fill="#F6C36B" stroke="#B5701A" strokeWidth="3" />
      <circle cx="42" cy="50" r="4" fill="#3A2A1A" />
      <circle cx="58" cy="50" r="4" fill="#3A2A1A" />
      <ellipse cx="50" cy="60" rx="5" ry="4" fill="#3A2A1A" />
      <path fill="none" stroke="#3A2A1A" strokeWidth="3" strokeLinecap="round" d="M50 64 Q44 70 38 66 M50 64 Q56 70 62 66" />
    </>
  ),
  elephant: (
    <>
      <ellipse cx="46" cy="52" rx="30" ry="26" fill="#A7B0BC" stroke="#6E7886" strokeWidth="3" />
      <path fill="#A7B0BC" stroke="#6E7886" strokeWidth="3" d="M40 64 q-6 14-2 22 q8 0 8-10" />
      <ellipse cx="22" cy="46" rx="12" ry="16" fill="#B7C0CC" stroke="#6E7886" strokeWidth="3" />
      <circle cx="52" cy="46" r="4" fill="#2E3A45" />
    </>
  ),
  penguin: (
    <>
      <ellipse cx="50" cy="54" rx="24" ry="30" fill="#2E3A45" stroke="#1A2129" strokeWidth="3" />
      <ellipse cx="50" cy="60" rx="15" ry="22" fill="#F5F7FA" />
      <circle cx="42" cy="44" r="3.5" fill="#2E3A45" />
      <circle cx="58" cy="44" r="3.5" fill="#2E3A45" />
      <path fill="#FFA22E" d="M45 50 h10 l-5 7 Z" />
      <path fill="#FFA22E" d="M38 82 l10 2 -8 4 Z M62 82 l-10 2 8 4 Z" />
    </>
  ),
  turtle: (
    <>
      <ellipse cx="50" cy="54" rx="30" ry="22" fill="#6FAE4B" />
      <path fill="#5A8C3A" stroke="#3F6A28" strokeWidth="3" d="M22 54 a28 22 0 0 1 56 0 Z" />
      <path fill="none" stroke="#3F6A28" strokeWidth="2.5" d="M50 32 V76 M28 50 L72 50 M34 64 L66 64" />
      <circle cx="80" cy="50" r="9" fill="#7AC74F" stroke="#3F6A28" strokeWidth="3" />
      <circle cx="82" cy="48" r="2.5" fill="#2E3A1A" />
    </>
  ),
  wolf: (
    <>
      <path fill="#8A95A3" stroke="#5A6472" strokeWidth="3" d="M24 34 L28 14 L42 30 Z" />
      <path fill="#8A95A3" stroke="#5A6472" strokeWidth="3" d="M76 34 L72 14 L58 30 Z" />
      <ellipse cx="50" cy="56" rx="26" ry="24" fill="#9AA5B3" stroke="#5A6472" strokeWidth="3" />
      <path fill="#C4CDD8" d="M50 60 L36 50 q14-6 28 0 Z" />
      <circle cx="40" cy="50" r="3.5" fill="#2E3A45" />
      <circle cx="60" cy="50" r="3.5" fill="#2E3A45" />
      <ellipse cx="50" cy="66" rx="4" ry="3" fill="#2E3A45" />
    </>
  ),
  bird: (
    <>
      <ellipse cx="48" cy="54" rx="24" ry="22" fill="#5BC0EB" stroke="#2F8FBF" strokeWidth="3" />
      <circle cx="58" cy="44" r="4" fill="#23323F" />
      <path fill="#FFA22E" d="M70 46 l14 4 -14 6 Z" />
      <path fill="#3FA0CF" stroke="#2F8FBF" strokeWidth="2.5" d="M30 54 q-16 4-20 16 q22 2 28-10 Z" />
      <path fill="#A8E4FF" d="M40 64 q8 8 18 6 q-8 8-20 2 Z" />
    </>
  ),
  bear: (
    <>
      <circle cx="30" cy="34" r="11" fill="#9A6B43" stroke="#6E4423" strokeWidth="3" />
      <circle cx="70" cy="34" r="11" fill="#9A6B43" stroke="#6E4423" strokeWidth="3" />
      <circle cx="50" cy="54" r="30" fill="#B5824F" stroke="#6E4423" strokeWidth="3" />
      <ellipse cx="50" cy="62" rx="13" ry="10" fill="#E6C89A" />
      <circle cx="40" cy="50" r="4" fill="#3A2A1A" />
      <circle cx="60" cy="50" r="4" fill="#3A2A1A" />
      <ellipse cx="50" cy="59" rx="5" ry="4" fill="#3A2A1A" />
    </>
  ),
  dolphin: (
    <>
      <path fill="#5B9BD5" stroke="#2F6BA8" strokeWidth="3" d="M14 64 C20 40 48 30 74 36 C70 28 78 24 86 26 C82 34 86 38 82 46 C90 60 70 80 44 78 C30 78 18 74 14 64 Z" />
      <circle cx="40" cy="50" r="3.5" fill="#23323F" />
      <path fill="#8FC2EA" d="M40 70 q12 8 26 2 q-10 10-26 4 Z" />
    </>
  ),
  fish: (
    <>
      <ellipse cx="46" cy="52" rx="26" ry="18" fill="#FF9F4A" stroke="#E0701A" strokeWidth="3" />
      <path fill="#FFC07A" stroke="#E0701A" strokeWidth="3" d="M72 52 L90 38 V66 Z" />
      <circle cx="34" cy="48" r="4" fill="#3A2A1A" />
      <path fill="none" stroke="#E0701A" strokeWidth="2.5" d="M50 40 Q56 52 50 64 M62 42 Q66 52 62 62" />
    </>
  ),
  bee: (
    <>
      <ellipse cx="50" cy="56" rx="22" ry="18" fill="#FFC93C" stroke="#C98A00" strokeWidth="3" />
      <path stroke="#3A2A1A" strokeWidth="6" d="M44 42 V70 M56 42 V70" />
      <ellipse cx="34" cy="42" rx="12" ry="7" fill="#CFEBFF" stroke="#8FC2EA" strokeWidth="2.5" transform="rotate(-20 34 42)" />
      <ellipse cx="66" cy="42" rx="12" ry="7" fill="#CFEBFF" stroke="#8FC2EA" strokeWidth="2.5" transform="rotate(20 66 42)" />
      <circle cx="30" cy="58" r="3.5" fill="#3A2A1A" />
    </>
  ),
  butterfly: (
    <>
      <ellipse cx="34" cy="38" rx="16" ry="14" fill="#FF8FB1" stroke="#D9547E" strokeWidth="3" />
      <ellipse cx="66" cy="38" rx="16" ry="14" fill="#FF8FB1" stroke="#D9547E" strokeWidth="3" />
      <ellipse cx="36" cy="64" rx="13" ry="12" fill="#FFC07A" stroke="#D9547E" strokeWidth="3" />
      <ellipse cx="64" cy="64" rx="13" ry="12" fill="#FFC07A" stroke="#D9547E" strokeWidth="3" />
      <rect x="47" y="32" width="6" height="40" rx="3" fill="#5A3B1E" />
      <path stroke="#5A3B1E" strokeWidth="3" strokeLinecap="round" d="M50 32 L42 20 M50 32 L58 20" />
    </>
  ),
  ladybug: (
    <>
      <circle cx="50" cy="54" r="28" fill="#E53935" stroke="#A81818" strokeWidth="3" />
      <path fill="#2A1010" d="M50 26 a28 28 0 0 0 0 56 Z" opacity="0.25" />
      <path stroke="#2A1010" strokeWidth="4" d="M50 28 V82" />
      <circle cx="38" cy="46" r="5" fill="#2A1010" />
      <circle cx="62" cy="46" r="5" fill="#2A1010" />
      <circle cx="36" cy="64" r="5" fill="#2A1010" />
      <circle cx="64" cy="64" r="5" fill="#2A1010" />
      <path fill="#2A1010" d="M36 30 a16 12 0 0 1 28 0 Z" />
    </>
  ),

  // ── Nature / météo ──────────────────────────────────────────────────────
  tree: (
    <>
      <circle cx="50" cy="42" r="26" fill="#6FBF55" stroke="#3F7A2E" strokeWidth="3" />
      <rect x="44" y="60" width="12" height="24" rx="4" fill="#7A4A2A" stroke="#553118" strokeWidth="3" />
    </>
  ),
  pine: (
    <>
      <path fill="#4E9C3A" stroke="#2F6A22" strokeWidth="3" d="M50 14 L70 44 H30 Z" />
      <path fill="#5FAE4B" stroke="#2F6A22" strokeWidth="3" d="M50 32 L74 66 H26 Z" />
      <rect x="45" y="64" width="10" height="18" rx="3" fill="#7A4A2A" />
    </>
  ),
  flower: (
    <>
      <circle cx="50" cy="30" r="11" fill="#FF8FB1" />
      <circle cx="70" cy="44" r="11" fill="#FFB23F" />
      <circle cx="62" cy="66" r="11" fill="#FF6B81" />
      <circle cx="38" cy="66" r="11" fill="#C46BD6" />
      <circle cx="30" cy="44" r="11" fill="#5BC0EB" />
      <circle cx="50" cy="48" r="11" fill="#FFD23F" stroke="#E6A700" strokeWidth="2.5" />
    </>
  ),
  leaf: (
    <>
      <path fill="#6FBF55" stroke="#3F7A2E" strokeWidth="3" d="M22 78 C20 40 50 18 80 22 C84 56 56 80 22 78 Z" />
      <path fill="none" stroke="#3F7A2E" strokeWidth="3" strokeLinecap="round" d="M28 74 Q54 48 76 28 M50 56 L66 44 M44 66 L58 56" />
    </>
  ),
  wave: (
    <>
      <path fill="#5BC0EB" stroke="#2F8FBF" strokeWidth="3" d="M14 60 C30 40 40 70 56 54 C68 42 74 58 86 50 V82 H14 Z" />
      <path fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" d="M22 64 C34 52 42 70 56 60" />
    </>
  ),
  drop: (
    <path fill="#5BC0EB" stroke="#2F8FBF" strokeWidth="3" d="M50 16 C66 42 74 54 74 64 a24 24 0 0 1-48 0 C26 54 34 42 50 16 Z" />
  ),
  sun: (
    <>
      <circle cx="50" cy="50" r="20" fill="#FFD23F" stroke="#E6A700" strokeWidth="3" />
      <path stroke="#FFB23F" strokeWidth="7" strokeLinecap="round" d="M50 10 V22 M50 78 V90 M10 50 H22 M78 50 H90 M22 22 L30 30 M70 70 L78 78 M78 22 L70 30 M30 70 L22 78" />
    </>
  ),
  sunset: (
    <>
      <path fill="#FFD23F" d="M30 60 a20 20 0 0 1 40 0 Z" />
      <path stroke="#FFB23F" strokeWidth="6" strokeLinecap="round" d="M50 28 V40 M22 44 L30 50 M78 44 L70 50 M14 60 H24 M76 60 H86" />
      <path stroke="#5BC0EB" strokeWidth="6" strokeLinecap="round" d="M14 72 H86" />
    </>
  ),
  moon: (
    <path fill="#FFE07A" stroke="#E6B800" strokeWidth="3" d="M62 18 a34 34 0 1 0 20 56 A28 28 0 0 1 62 18 Z" />
  ),
  cloud: (
    <path fill="#EAF2FA" stroke="#B6C8DC" strokeWidth="3" d="M30 70 a18 18 0 0 1 2-36 a20 20 0 0 1 38 6 a15 15 0 0 1-2 30 Z" />
  ),
  rainbow: (
    <>
      <path fill="none" stroke="#FF6B81" strokeWidth="7" d="M16 74 a34 34 0 0 1 68 0" />
      <path fill="none" stroke="#FFB23F" strokeWidth="7" d="M25 74 a25 25 0 0 1 50 0" />
      <path fill="none" stroke="#5BC0EB" strokeWidth="7" d="M34 74 a16 16 0 0 1 32 0" />
    </>
  ),
  umbrella: (
    <>
      <path fill="#FF6B81" stroke="#D94F68" strokeWidth="3" d="M50 18 a36 36 0 0 1 36 36 H14 A36 36 0 0 1 50 18 Z" />
      <path fill="none" stroke="#5A3B1E" strokeWidth="5" strokeLinecap="round" d="M50 54 V78 a8 8 0 0 1-14 5" />
    </>
  ),
  sprout: (
    <>
      <path fill="none" stroke="#4E8C2E" strokeWidth="5" strokeLinecap="round" d="M50 80 V44" />
      <path fill="#7AC74F" stroke="#4E8C2E" strokeWidth="3" d="M50 52 C36 52 26 42 26 30 C42 30 50 40 50 52 Z" />
      <path fill="#8FD94B" stroke="#4E8C2E" strokeWidth="3" d="M50 48 C64 48 74 38 74 26 C58 26 50 36 50 48 Z" />
    </>
  ),
  cabbage: (
    <>
      <circle cx="50" cy="54" r="28" fill="#8FD94B" stroke="#4E8C2E" strokeWidth="3" />
      <path fill="#B6E88A" d="M50 26 C66 30 72 44 66 60 C58 74 40 74 34 60 C28 44 36 30 50 26 Z" />
      <path fill="none" stroke="#4E8C2E" strokeWidth="2.5" d="M50 30 V74 M36 44 Q50 54 64 44 M36 62 Q50 70 64 62" />
    </>
  ),

  // ── Nourriture ──────────────────────────────────────────────────────────
  apple: (
    <>
      <path fill="#E53935" stroke="#A81818" strokeWidth="3" d="M50 32 C40 24 22 28 22 50 c0 22 14 34 28 34 s28-12 28-34 C78 28 60 24 50 32 Z" />
      <path fill="none" stroke="#7A4A2A" strokeWidth="4" strokeLinecap="round" d="M50 32 V20" />
      <path fill="#6FBF55" d="M52 22 q14-8 20 2 q-14 6-20-2 Z" />
    </>
  ),
  banana: (
    <path fill="#FFD23F" stroke="#D9A400" strokeWidth="3" d="M22 36 C26 60 44 78 76 74 l6-10 C54 70 38 54 34 34 Z" />
  ),
  strawberry: (
    <>
      <path fill="#E53935" stroke="#A81818" strokeWidth="3" d="M50 36 C30 36 26 50 32 64 C38 78 50 84 50 84 s12-6 18-20 C74 50 70 36 50 36 Z" />
      <path fill="#6FBF55" stroke="#3F7A2E" strokeWidth="2.5" d="M50 36 L40 24 M50 36 L50 22 M50 36 L60 24" />
      <circle cx="44" cy="54" r="2" fill="#FFE07A" />
      <circle cx="56" cy="54" r="2" fill="#FFE07A" />
      <circle cx="50" cy="66" r="2" fill="#FFE07A" />
    </>
  ),
  pizza: (
    <>
      <path fill="#FFD23F" stroke="#D9A400" strokeWidth="3" d="M50 18 L82 78 H18 Z" />
      <path fill="#E0701A" d="M50 26 L74 72 H26 Z" opacity="0.25" />
      <circle cx="44" cy="52" r="5" fill="#E53935" />
      <circle cx="58" cy="48" r="5" fill="#E53935" />
      <circle cx="50" cy="66" r="5" fill="#E53935" />
    </>
  ),
  carrot: (
    <>
      <path fill="#FF9F4A" stroke="#E0701A" strokeWidth="3" d="M30 44 L62 76 C70 84 84 70 76 62 Z" />
      <path fill="#6FBF55" stroke="#3F7A2E" strokeWidth="2.5" d="M30 44 L18 28 M30 44 L26 22 M30 44 L42 26" />
    </>
  ),
  cheese: (
    <>
      <path fill="#FFD23F" stroke="#D9A400" strokeWidth="3" d="M18 64 L74 32 C84 38 86 52 82 62 Z" />
      <circle cx="42" cy="54" r="4" fill="#E0A400" />
      <circle cx="62" cy="50" r="3.5" fill="#E0A400" />
      <circle cx="54" cy="60" r="3" fill="#E0A400" />
    </>
  ),
  cookie: (
    <>
      <circle cx="50" cy="52" r="30" fill="#D9A45B" stroke="#A5722E" strokeWidth="3" />
      <circle cx="40" cy="44" r="4" fill="#5A3B1E" />
      <circle cx="60" cy="48" r="4" fill="#5A3B1E" />
      <circle cx="52" cy="62" r="4" fill="#5A3B1E" />
      <circle cx="38" cy="62" r="3" fill="#5A3B1E" />
      <circle cx="64" cy="62" r="3" fill="#5A3B1E" />
    </>
  ),
  icecream: (
    <>
      <path fill="#E0B07A" stroke="#A5722E" strokeWidth="3" d="M38 50 L62 50 L50 86 Z" />
      <circle cx="42" cy="40" r="13" fill="#FF8FB1" stroke="#D9547E" strokeWidth="3" />
      <circle cx="58" cy="40" r="13" fill="#A8E4FF" stroke="#3FA9E0" strokeWidth="3" />
      <circle cx="50" cy="30" r="13" fill="#FFD23F" stroke="#D9A400" strokeWidth="3" />
    </>
  ),
  honey: (
    <>
      <rect x="32" y="40" width="36" height="40" rx="6" fill="#FFC93C" stroke="#C98A00" strokeWidth="3" />
      <rect x="36" y="28" width="28" height="14" rx="4" fill="#E0A400" stroke="#C98A00" strokeWidth="3" />
      <path fill="#fff" opacity="0.85" d="M40 50 h20 v18 h-20 Z" />
      <path fill="none" stroke="#C98A00" strokeWidth="2" d="M40 58 h20 M50 50 v18" />
    </>
  ),

  // ── Objets ──────────────────────────────────────────────────────────────
  car: (
    <>
      <path fill="#FF6B81" stroke="#D94F68" strokeWidth="3" d="M16 62 L24 44 C26 38 30 36 36 36 H64 C70 36 74 38 76 44 L84 62 V70 H16 Z" />
      <rect x="34" y="40" width="32" height="16" rx="4" fill="#CFEBFF" />
      <circle cx="32" cy="70" r="9" fill="#2E3A45" />
      <circle cx="68" cy="70" r="9" fill="#2E3A45" />
    </>
  ),
  ball: (
    <>
      <circle cx="50" cy="52" r="30" fill="#fff" stroke="#2E3A45" strokeWidth="3" />
      <path fill="#2E3A45" d="M50 38 l11 8 -4 13 h-14 l-4-13 Z" />
      <path fill="none" stroke="#2E3A45" strokeWidth="2.5" d="M50 22 V38 M61 46 L76 40 M57 59 L66 74 M43 59 L34 74 M39 46 L24 40" />
    </>
  ),
  balloon: (
    <>
      <ellipse cx="50" cy="42" rx="24" ry="28" fill="#FF6B81" stroke="#D94F68" strokeWidth="3" />
      <path fill="#FF6B81" stroke="#D94F68" strokeWidth="3" d="M46 68 h8 l-4 6 Z" />
      <path fill="none" stroke="#8A95A3" strokeWidth="2.5" d="M50 74 q6 8-2 14" />
      <ellipse cx="42" cy="34" rx="6" ry="9" fill="#fff" opacity="0.45" />
    </>
  ),
  teddy: (
    <>
      <circle cx="28" cy="32" r="10" fill="#B5824F" stroke="#6E4423" strokeWidth="3" />
      <circle cx="72" cy="32" r="10" fill="#B5824F" stroke="#6E4423" strokeWidth="3" />
      <circle cx="50" cy="52" r="28" fill="#C68A4E" stroke="#6E4423" strokeWidth="3" />
      <ellipse cx="50" cy="60" rx="12" ry="9" fill="#E6C89A" />
      <circle cx="41" cy="48" r="3.5" fill="#3A2A1A" />
      <circle cx="59" cy="48" r="3.5" fill="#3A2A1A" />
      <circle cx="50" cy="56" r="3" fill="#3A2A1A" />
    </>
  ),
  key: (
    <>
      <circle cx="34" cy="40" r="16" fill="none" stroke="#E0A400" strokeWidth="8" />
      <path stroke="#E0A400" strokeWidth="8" strokeLinecap="round" d="M44 50 L74 80 M64 70 L72 62 M74 80 L82 72" />
    </>
  ),
  bell: (
    <>
      <path fill="#FFC93C" stroke="#C98A00" strokeWidth="3" d="M50 20 C36 20 32 34 32 48 C32 62 24 66 24 72 H76 C76 66 68 62 68 48 C68 34 64 20 50 20 Z" />
      <circle cx="50" cy="18" r="5" fill="#C98A00" />
      <circle cx="50" cy="78" r="6" fill="#C98A00" />
    </>
  ),
  bridge: (
    <>
      <path fill="none" stroke="#C0392B" strokeWidth="7" strokeLinecap="round" d="M14 64 C14 40 86 40 86 64" />
      <path stroke="#C0392B" strokeWidth="6" d="M14 64 V80 M86 64 V80 M50 47 V80 M32 53 V80 M68 53 V80" />
      <path stroke="#5BC0EB" strokeWidth="5" strokeLinecap="round" d="M10 84 H90" />
    </>
  ),
  sailboat: (
    <>
      <path stroke="#7A4A2A" strokeWidth="4" strokeLinecap="round" d="M50 16 V62" />
      <path fill="#FF6B81" stroke="#D94F68" strokeWidth="3" d="M50 20 L74 56 H50 Z" />
      <path fill="#FFD23F" stroke="#D9A400" strokeWidth="3" d="M46 24 L26 56 H46 Z" />
      <path fill="#8A5A2B" stroke="#553118" strokeWidth="3" d="M20 64 H80 L70 80 H30 Z" />
      <path stroke="#5BC0EB" strokeWidth="5" strokeLinecap="round" d="M12 86 H88" />
    </>
  ),
  rowboat: (
    <>
      <path fill="#C68A4E" stroke="#8A5A2B" strokeWidth="3" d="M16 54 H84 L72 76 H28 Z" />
      <path fill="none" stroke="#8A5A2B" strokeWidth="3" d="M30 60 H70" />
      <path stroke="#7A4A2A" strokeWidth="5" strokeLinecap="round" d="M58 56 L84 30" />
      <path stroke="#5BC0EB" strokeWidth="5" strokeLinecap="round" d="M10 84 H90" />
    </>
  ),
  anchor: (
    <>
      <circle cx="50" cy="24" r="8" fill="none" stroke="#5B6B82" strokeWidth="6" />
      <path stroke="#5B6B82" strokeWidth="6" strokeLinecap="round" d="M50 32 V76 M34 48 H66" />
      <path fill="none" stroke="#5B6B82" strokeWidth="6" strokeLinecap="round" d="M24 56 C24 76 40 80 50 80 C60 80 76 76 76 56" />
    </>
  ),

  // ── Instruments ─────────────────────────────────────────────────────────
  guitar: (
    <>
      <circle cx="42" cy="62" r="22" fill="#C68A4E" stroke="#8A5A2B" strokeWidth="3" />
      <circle cx="42" cy="62" r="7" fill="#5A3B1E" />
      <rect x="56" y="20" width="12" height="42" rx="4" fill="#8A5A2B" transform="rotate(40 62 41)" />
      <rect x="68" y="14" width="14" height="12" rx="3" fill="#5A3B1E" transform="rotate(40 75 20)" />
    </>
  ),
  drum: (
    <>
      <ellipse cx="50" cy="40" rx="30" ry="12" fill="#EAF2FA" stroke="#5B6B82" strokeWidth="3" />
      <path fill="#C0392B" stroke="#922B21" strokeWidth="3" d="M20 40 V64 a30 12 0 0 0 60 0 V40" />
      <path stroke="#FFD23F" strokeWidth="3" d="M22 46 L78 58 M22 58 L78 46" />
      <path stroke="#7A4A2A" strokeWidth="4" strokeLinecap="round" d="M40 36 L24 14 M60 36 L76 14" />
      <circle cx="24" cy="14" r="5" fill="#7A4A2A" />
      <circle cx="76" cy="14" r="5" fill="#7A4A2A" />
    </>
  ),
  piano: (
    <>
      <rect x="18" y="34" width="64" height="44" rx="6" fill="#2E3A45" stroke="#1A2129" strokeWidth="3" />
      <rect x="22" y="50" width="56" height="24" fill="#fff" />
      <path fill="#2E3A45" d="M30 50 h6 v15 h-6 Z M42 50 h6 v15 h-6 Z M54 50 h6 v15 h-6 Z M66 50 h6 v15 h-6 Z" />
      <path stroke="#B6C8DC" strokeWidth="1.5" d="M34 50 V74 M46 50 V74 M58 50 V74 M70 50 V74" />
    </>
  ),
  trumpet: (
    <>
      <path fill="#FFC93C" stroke="#C98A00" strokeWidth="3" d="M14 50 H64 L84 36 V64 L64 50 H14 a6 6 0 0 0 0-0 Z" />
      <rect x="14" y="44" width="10" height="14" rx="3" fill="#E0A400" />
      <path stroke="#C98A00" strokeWidth="5" d="M40 44 V36 M52 44 V36" />
    </>
  ),
  violin: (
    <>
      <path fill="#A5722E" stroke="#6E4423" strokeWidth="3" d="M44 52 C28 52 28 78 44 78 C50 78 52 70 52 64 C52 58 60 58 60 48 C60 40 56 30 50 30 C44 30 44 42 44 52 Z" />
      <rect x="46" y="10" width="8" height="30" rx="3" fill="#5A3B1E" transform="rotate(8 50 25)" />
      <path stroke="#3A2A1A" strokeWidth="1.5" d="M48 16 L48 60 M52 16 L52 60" />
    </>
  ),
  sax: (
    <>
      <path fill="none" stroke="#FFC93C" strokeWidth="10" strokeLinecap="round" d="M48 16 V46 C48 66 64 72 76 64" />
      <path fill="#FFC93C" stroke="#C98A00" strokeWidth="3" d="M70 58 L88 70 L74 82 Z" />
      <circle cx="48" cy="30" r="3" fill="#C98A00" />
      <circle cx="50" cy="42" r="3" fill="#C98A00" />
    </>
  ),
  maracas: (
    <>
      <circle cx="34" cy="34" r="16" fill="#FF8FB1" stroke="#D9547E" strokeWidth="3" />
      <rect x="40" y="44" width="9" height="30" rx="4" fill="#8A5A2B" transform="rotate(35 44 59)" />
      <circle cx="68" cy="40" r="16" fill="#5BC0EB" stroke="#2F8FBF" strokeWidth="3" />
      <rect x="58" y="50" width="9" height="30" rx="4" fill="#8A5A2B" transform="rotate(-35 62 65)" />
      <circle cx="30" cy="30" r="3" fill="#fff" opacity="0.7" />
    </>
  ),

  // ── Visages / ressenti ──────────────────────────────────────────────────
  smile: (
    <>
      <circle cx="50" cy="50" r="34" fill="#FFD23F" stroke="#E6A700" strokeWidth="3" />
      <circle cx="38" cy="44" r="4.5" fill="#5A3B1E" />
      <circle cx="62" cy="44" r="4.5" fill="#5A3B1E" />
      <path fill="none" stroke="#5A3B1E" strokeWidth="5" strokeLinecap="round" d="M34 58 Q50 74 66 58" />
    </>
  ),
  sleepy: (
    <>
      <circle cx="50" cy="50" r="34" fill="#FFD23F" stroke="#E6A700" strokeWidth="3" />
      <path fill="none" stroke="#5A3B1E" strokeWidth="4" strokeLinecap="round" d="M32 46 Q38 42 44 46 M56 46 Q62 42 68 46" />
      <ellipse cx="50" cy="62" rx="6" ry="8" fill="#5A3B1E" />
      <path fill="none" stroke="#5A3B1E" strokeWidth="3.5" strokeLinecap="round" d="M70 24 h12 l-12 12 h12" />
    </>
  ),
};

const GLYPHS: Record<string, ReactNode> = { ...UI, ...ILLUS };

export type IconName = keyof typeof GLYPHS;

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

/**
 * Affiche une icône SVG nommée. Aucune dépendance à la police emoji système.
 * Si `title` est fourni → annoncé aux lecteurs d'écran ; sinon purement décoratif.
 */
export function Icon({ name, size = 64, className = "", title, style }: IconProps) {
  const glyph = GLYPHS[name] ?? GLYPHS.star;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  );
}

/** Vérifie l'existence d'une icône (utile pour les données dynamiques). */
export function hasIcon(name: string): boolean {
  return name in GLYPHS;
}
