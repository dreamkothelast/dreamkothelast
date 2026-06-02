import type { ImageTheme } from "../types";

/**
 * Jeux d'images par thème — placeholders emoji.
 *
 * À remplacer par les vrais assets (voir src/assets/images/README.md) :
 * remplacer `emoji` par `src: "/assets/images/animaux/chat.svg"` et adapter
 * le rendu des cartes. Le `label` sert au futur retour audio (jeu d'écoute)
 * et à l'accessibilité (aria-label).
 *
 * Chaque thème fournit au moins 8 éléments (nécessaire pour le niveau 4×4).
 * `sound` pointe vers le fichier audio du jeu d'écoute (Phase 4), optionnel ici.
 */
export interface ImageItem {
  id: string;
  emoji: string;
  label: string;        // nom français, lu/affiché
  sound?: string;       // chemin audio optionnel (Phase 4)
}

export const IMAGE_SETS: Record<ImageTheme, ImageItem[]> = {
  animaux: [
    { id: "chien", emoji: "🐶", label: "Le chien", sound: "/assets/sounds/animaux/chien.mp3" },
    { id: "chat", emoji: "🐱", label: "Le chat", sound: "/assets/sounds/animaux/chat.mp3" },
    { id: "lapin", emoji: "🐰", label: "Le lapin" },
    { id: "grenouille", emoji: "🐸", label: "La grenouille" },
    { id: "lion", emoji: "🦁", label: "Le lion" },
    { id: "elephant", emoji: "🐘", label: "L'éléphant" },
    { id: "pingouin", emoji: "🐧", label: "Le pingouin" },
    { id: "tortue", emoji: "🐢", label: "La tortue" },
  ],
  objets: [
    { id: "voiture", emoji: "🚗", label: "La voiture" },
    { id: "livre", emoji: "📚", label: "Le livre" },
    { id: "ballon", emoji: "⚽", label: "Le ballon" },
    { id: "balon-baudruche", emoji: "🎈", label: "Le ballon de baudruche" },
    { id: "ours", emoji: "🧸", label: "L'ours en peluche" },
    { id: "parapluie", emoji: "☂️", label: "Le parapluie" },
    { id: "cle", emoji: "🔑", label: "La clé" },
    { id: "horloge", emoji: "⏰", label: "Le réveil" },
  ],
  nourriture: [
    { id: "pomme", emoji: "🍎", label: "La pomme" },
    { id: "banane", emoji: "🍌", label: "La banane" },
    { id: "fraise", emoji: "🍓", label: "La fraise" },
    { id: "pizza", emoji: "🍕", label: "La pizza" },
    { id: "carotte", emoji: "🥕", label: "La carotte" },
    { id: "fromage", emoji: "🧀", label: "Le fromage" },
    { id: "cookie", emoji: "🍪", label: "Le biscuit" },
    { id: "glace", emoji: "🍦", label: "La glace" },
  ],
  instruments: [
    { id: "guitare", emoji: "🎸", label: "La guitare" },
    { id: "tambour", emoji: "🥁", label: "Le tambour" },
    { id: "piano", emoji: "🎹", label: "Le piano" },
    { id: "trompette", emoji: "🎺", label: "La trompette" },
    { id: "violon", emoji: "🎻", label: "Le violon" },
    { id: "saxophone", emoji: "🎷", label: "Le saxophone" },
    { id: "maracas", emoji: "🪇", label: "Les maracas" },
    { id: "cloche", emoji: "🔔", label: "La cloche" },
  ],
};

/** Mélange un tableau (Fisher-Yates) sans muter l'original. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sélectionne n éléments distincts au hasard dans un thème. */
export function pickItems(theme: ImageTheme, n: number): ImageItem[] {
  return shuffle(IMAGE_SETS[theme]).slice(0, n);
}
