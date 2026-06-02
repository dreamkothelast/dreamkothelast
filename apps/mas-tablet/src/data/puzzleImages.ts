/**
 * Images pour le Puzzle Photo.
 * Toutes les images sont des SVG inline (100 % hors-ligne).
 *
 * Pour remplacer par de vraies photos :
 *   1. Placer les images dans public/assets/images/puzzle/
 *   2. Remplacer le champ `svg` par `src: "/assets/images/puzzle/nom.jpg"`
 *   3. Adapter le rendu dans PuzzleActivity.tsx (img src au lieu de SVG inline)
 */

export interface PuzzleImage {
  id: string;
  label: string;           // Nom affiché / lu quand le puzzle est résolu
  category: "animaux" | "nature" | "aliments" | "objets";
  svg: string;             // SVG inline (viewBox="0 0 300 300")
}

// ── SVGs inline — illustrations simples et colorées ────────────────────────

const chatSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#FFF8DC"/>
  <circle cx="150" cy="168" r="108" fill="#F4A460"/>
  <polygon points="55,88 88,28 122,90" fill="#F4A460"/>
  <polygon points="178,90 212,28 245,88" fill="#F4A460"/>
  <polygon points="65,82 88,42 112,86" fill="#FFB6C1"/>
  <polygon points="188,86 212,42 235,82" fill="#FFB6C1"/>
  <ellipse cx="112" cy="158" rx="20" ry="24" fill="#228B22"/>
  <ellipse cx="188" cy="158" rx="20" ry="24" fill="#228B22"/>
  <ellipse cx="112" cy="158" rx="10" ry="16" fill="#111"/>
  <ellipse cx="188" cy="158" rx="10" ry="16" fill="#111"/>
  <ellipse cx="108" cy="152" rx="4" ry="4" fill="#fff" opacity="0.7"/>
  <ellipse cx="184" cy="152" rx="4" ry="4" fill="#fff" opacity="0.7"/>
  <polygon points="150,187 141,202 159,202" fill="#FF69B4"/>
  <path d="M141 202 Q128 218 116 214" stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M159 202 Q172 218 184 214" stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <line x1="52" y1="192" x2="128" y2="188" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="52" y1="202" x2="128" y2="200" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="172" y1="188" x2="248" y2="192" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="172" y1="200" x2="248" y2="202" stroke="#8B4513" stroke-width="1.5"/>
</svg>`;

const tournesolSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#87CEEB"/>
  <rect x="140" y="180" width="20" height="110" rx="6" fill="#228B22"/>
  <rect x="88" y="210" width="14" height="65" rx="5" fill="#228B22" transform="rotate(-30 95 210)"/>
  <ellipse cx="102" cy="248" rx="28" ry="14" fill="#2E8B22" transform="rotate(-30 102 248)"/>
  <ellipse cx="198" cy="248" rx="28" ry="14" fill="#2E8B22" transform="rotate(30 198 248)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(22.5 150 120)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(45 150 120)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(67.5 150 120)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(90 150 120)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(112.5 150 120)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(135 150 120)"/>
  <ellipse cx="150" cy="26" rx="18" ry="28" fill="#FFD700" transform="rotate(157.5 150 120)"/>
  <circle cx="150" cy="120" r="48" fill="#8B4513"/>
  <circle cx="150" cy="120" r="36" fill="#6B3410"/>
  <circle cx="138" cy="108" r="5" fill="#D2691E" opacity="0.6"/>
  <circle cx="155" cy="106" r="5" fill="#D2691E" opacity="0.6"/>
  <circle cx="166" cy="115" r="5" fill="#D2691E" opacity="0.6"/>
  <circle cx="163" cy="130" r="5" fill="#D2691E" opacity="0.6"/>
  <circle cx="148" cy="136" r="5" fill="#D2691E" opacity="0.6"/>
  <circle cx="133" cy="128" r="5" fill="#D2691E" opacity="0.6"/>
  <circle cx="135" cy="116" r="5" fill="#D2691E" opacity="0.6"/>
</svg>`;

const maisonSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#87CEEB"/>
  <rect x="0" y="240" width="300" height="60" fill="#8FBC8F"/>
  <rect x="42" y="150" width="216" height="110" fill="#F0E68C"/>
  <rect x="42" y="150" width="216" height="8" fill="#DDD580"/>
  <polygon points="150,50 36,158 264,158" fill="#CD5C5C"/>
  <polygon points="150,50 36,158 264,158" fill="#C0392B"/>
  <rect x="116" y="196" width="68" height="64" rx="4" fill="#8B4513"/>
  <ellipse cx="150" cy="228" rx="5" ry="5" fill="#FFD700"/>
  <rect x="66" y="166" width="52" height="46" rx="4" fill="#ADD8E6"/>
  <rect x="66" y="166" width="52" height="46" rx="4" fill="none" stroke="#6FA8D8" stroke-width="3"/>
  <line x1="92" y1="166" x2="92" y2="212" stroke="#6FA8D8" stroke-width="2"/>
  <line x1="66" y1="189" x2="118" y2="189" stroke="#6FA8D8" stroke-width="2"/>
  <rect x="182" y="166" width="52" height="46" rx="4" fill="#ADD8E6"/>
  <rect x="182" y="166" width="52" height="46" rx="4" fill="none" stroke="#6FA8D8" stroke-width="3"/>
  <line x1="208" y1="166" x2="208" y2="212" stroke="#6FA8D8" stroke-width="2"/>
  <line x1="182" y1="189" x2="234" y2="189" stroke="#6FA8D8" stroke-width="2"/>
  <circle cx="228" cy="86" r="24" fill="#FFD700" opacity="0.9"/>
  <line x1="228" y1="54" x2="228" y2="48" stroke="#FFD700" stroke-width="3"/>
  <line x1="228" y1="118" x2="228" y2="124" stroke="#FFD700" stroke-width="3"/>
  <line x1="196" y1="86" x2="190" y2="86" stroke="#FFD700" stroke-width="3"/>
  <line x1="260" y1="86" x2="266" y2="86" stroke="#FFD700" stroke-width="3"/>
</svg>`;

const pommeSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#F0FFF0"/>
  <path d="M148 56 Q160 30 172 56" stroke="#228B22" stroke-width="4" fill="none"/>
  <rect x="146" y="52" width="8" height="30" rx="3" fill="#228B22"/>
  <ellipse cx="118" cy="44" rx="22" ry="12" fill="#228B22" transform="rotate(-25 118 44)"/>
  <path d="M 150 80 Q 60 70 50 160 Q 42 230 100 265 Q 150 285 150 285 Q 150 285 200 265 Q 258 230 250 160 Q 240 70 150 80 Z" fill="#E8232A"/>
  <path d="M 150 80 Q 90 78 80 110 Q 70 145 75 180 Q 82 220 100 250 Q 125 270 150 275" fill="#D41F25" opacity="0.4"/>
  <ellipse cx="110" cy="140" rx="18" ry="30" fill="#fff" opacity="0.25" transform="rotate(-20 110 140)"/>
  <path d="M 88 196 Q 118 210 148 198" stroke="#C01820" stroke-width="2" fill="none" opacity="0.5"/>
</svg>`;

const chienSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#FFF8DC"/>
  <ellipse cx="74" cy="120" rx="28" ry="55" fill="#C8A265" transform="rotate(15 74 120)"/>
  <ellipse cx="226" cy="120" rx="28" ry="55" fill="#C8A265" transform="rotate(-15 226 120)"/>
  <circle cx="150" cy="168" r="108" fill="#D2A679"/>
  <circle cx="150" cy="164" r="78" fill="#E8C99A"/>
  <ellipse cx="120" cy="155" rx="18" ry="20" fill="#6B3A2A"/>
  <ellipse cx="180" cy="155" rx="18" ry="20" fill="#6B3A2A"/>
  <ellipse cx="120" cy="155" rx="9" ry="13" fill="#111"/>
  <ellipse cx="180" cy="155" rx="9" ry="13" fill="#111"/>
  <ellipse cx="116" cy="150" rx="3.5" ry="3.5" fill="#fff" opacity="0.7"/>
  <ellipse cx="176" cy="150" rx="3.5" ry="3.5" fill="#fff" opacity="0.7"/>
  <ellipse cx="150" cy="188" rx="22" ry="16" fill="#C06060"/>
  <path d="M130 196 Q150 215 170 196" fill="#FF8080"/>
  <ellipse cx="150" cy="182" rx="12" ry="8" fill="#1a1a1a"/>
  <line x1="55" y1="188" x2="126" y2="186" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="55" y1="198" x2="126" y2="196" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="174" y1="186" x2="245" y2="188" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="174" y1="196" x2="245" y2="198" stroke="#8B4513" stroke-width="1.5"/>
</svg>`;

const papillonSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#E8F4FD"/>
  <ellipse cx="88" cy="118" rx="72" ry="88" fill="#FF6B35" transform="rotate(-20 88 118)"/>
  <ellipse cx="212" cy="118" rx="72" ry="88" fill="#FF6B35" transform="rotate(20 212 118)"/>
  <ellipse cx="82" cy="196" rx="56" ry="62" fill="#FFB347" transform="rotate(15 82 196)"/>
  <ellipse cx="218" cy="196" rx="56" ry="62" fill="#FFB347" transform="rotate(-15 218 196)"/>
  <ellipse cx="88" cy="118" rx="48" ry="62" fill="#FF8C42" opacity="0.5" transform="rotate(-20 88 118)"/>
  <ellipse cx="212" cy="118" rx="48" ry="62" fill="#FF8C42" opacity="0.5" transform="rotate(20 212 118)"/>
  <circle cx="80" cy="105" r="16" fill="#2E1503" opacity="0.8"/>
  <circle cx="220" cy="105" r="16" fill="#2E1503" opacity="0.8"/>
  <circle cx="80" cy="192" r="12" fill="#2E1503" opacity="0.8"/>
  <circle cx="220" cy="192" r="12" fill="#2E1503" opacity="0.8"/>
  <ellipse cx="150" cy="150" rx="10" ry="85" fill="#2E1503"/>
  <path d="M 140 80 Q 120 50 148 38" stroke="#2E1503" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M 160 80 Q 180 50 152 38" stroke="#2E1503" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="140" cy="78" r="5" fill="#2E1503"/>
  <circle cx="160" cy="78" r="5" fill="#2E1503"/>
</svg>`;

const soleilSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cielGrad" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#4A90D9"/>
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="url(#cielGrad)"/>
  <rect x="0" y="240" width="300" height="60" fill="#7CCC6C"/>
  <circle cx="150" cy="130" r="68" fill="#FFD700"/>
  <circle cx="150" cy="130" r="52" fill="#FFEC4F"/>
  <rect x="146" y="30" width="8" height="44" rx="4" fill="#FFD700"/>
  <rect x="146" y="196" width="8" height="44" rx="4" fill="#FFD700"/>
  <rect x="30" y="126" width="44" height="8" rx="4" fill="#FFD700"/>
  <rect x="196" y="126" width="44" height="8" rx="4" fill="#FFD700"/>
  <rect x="82" y="62" width="8" height="44" rx="4" fill="#FFD700" transform="rotate(45 86 84)"/>
  <rect x="82" y="62" width="8" height="44" rx="4" fill="#FFD700" transform="rotate(-45 214 84)"/>
  <rect x="82" y="62" width="8" height="44" rx="4" fill="#FFD700" transform="rotate(45 86 196)"/>
  <rect x="82" y="62" width="8" height="44" rx="4" fill="#FFD700" transform="rotate(-45 214 196)"/>
  <ellipse cx="128" cy="114" rx="12" ry="12" fill="#B8860B" opacity="0.5"/>
  <ellipse cx="168" cy="114" rx="12" ry="12" fill="#B8860B" opacity="0.5"/>
  <path d="M 126 148 Q 150 168 174 148" stroke="#B8860B" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

const poissonSVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="merGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#4FC3F7"/>
      <stop offset="100%" stop-color="#0277BD"/>
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="url(#merGrad)"/>
  <ellipse cx="44" cy="44" rx="12" ry="12" fill="#80D8FF" opacity="0.4"/>
  <ellipse cx="256" cy="72" rx="8" ry="8" fill="#80D8FF" opacity="0.4"/>
  <ellipse cx="80" cy="240" rx="10" ry="10" fill="#80D8FF" opacity="0.3"/>
  <ellipse cx="220" cy="256" rx="14" ry="14" fill="#80D8FF" opacity="0.3"/>
  <path d="M 238 150 Q 280 110 280 150 Q 280 190 238 150 Z" fill="#FF6B35"/>
  <ellipse cx="145" cy="150" rx="100" ry="65" fill="#FF8C42"/>
  <path d="M 145 86 Q 185 70 200 90 Q 185 110 145 100 Z" fill="#FFB347"/>
  <path d="M 145 214 Q 185 230 200 210 Q 185 190 145 200 Z" fill="#FFB347"/>
  <ellipse cx="80" cy="140" rx="18" ry="22" fill="#fff"/>
  <ellipse cx="80" cy="140" rx="11" ry="14" fill="#1A237E"/>
  <ellipse cx="76" cy="136" rx="4" ry="4" fill="#fff" opacity="0.7"/>
  <path d="M 145 135 Q 165 130 185 138 Q 165 148 145 143" fill="#FF7043" opacity="0.5"/>
  <path d="M 55 148 Q 72 142 86 150 Q 72 162 55 155 Z" fill="#E64A19"/>
</svg>`;

// ── Registre des images ──────────────────────────────────────────────────────

export const PUZZLE_IMAGES: PuzzleImage[] = [
  { id: "chat",       label: "Chat",        category: "animaux",  svg: chatSVG },
  { id: "chien",      label: "Chien",       category: "animaux",  svg: chienSVG },
  { id: "papillon",   label: "Papillon",    category: "animaux",  svg: papillonSVG },
  { id: "poisson",    label: "Poisson",     category: "animaux",  svg: poissonSVG },
  { id: "tournesol",  label: "Tournesol",   category: "nature",   svg: tournesolSVG },
  { id: "soleil",     label: "Soleil",      category: "nature",   svg: soleilSVG },
  { id: "maison",     label: "Maison",      category: "objets",   svg: maisonSVG },
  { id: "pomme",      label: "Pomme",       category: "aliments", svg: pommeSVG },
];

/** Retourne une image aléatoire (différente de l'id exclu) */
export function pickRandomImage(excludeId?: string): PuzzleImage {
  const pool = excludeId
    ? PUZZLE_IMAGES.filter((img) => img.id !== excludeId)
    : PUZZLE_IMAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}
