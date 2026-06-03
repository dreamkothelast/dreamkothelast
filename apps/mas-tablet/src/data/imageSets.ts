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
  icon: string;         // nom d'icône SVG (voir src/components/Icon.tsx)
  label: string;        // nom français, lu/affiché
  sound?: string;       // chemin audio optionnel (Phase 4)
}

export const IMAGE_SETS: Record<ImageTheme, ImageItem[]> = {
  animaux: [
    { id: "chien", icon: "dog", label: "Le chien", sound: "/assets/sounds/animaux/chien.mp3" },
    { id: "chat", icon: "cat", label: "Le chat", sound: "/assets/sounds/animaux/chat.mp3" },
    { id: "lapin", icon: "rabbit", label: "Le lapin" },
    { id: "grenouille", icon: "frog", label: "La grenouille" },
    { id: "lion", icon: "lion", label: "Le lion" },
    { id: "elephant", icon: "elephant", label: "L'éléphant" },
    { id: "pingouin", icon: "penguin", label: "Le pingouin" },
    { id: "tortue", icon: "turtle", label: "La tortue" },
  ],
  objets: [
    { id: "voiture", icon: "car", label: "La voiture" },
    { id: "livre", icon: "book", label: "Le livre" },
    { id: "ballon", icon: "ball", label: "Le ballon" },
    { id: "balon-baudruche", icon: "balloon", label: "Le ballon de baudruche" },
    { id: "ours", icon: "teddy", label: "L'ours en peluche" },
    { id: "parapluie", icon: "umbrella", label: "Le parapluie" },
    { id: "cle", icon: "key", label: "La clé" },
    { id: "horloge", icon: "clock", label: "Le réveil" },
  ],
  nourriture: [
    { id: "pomme", icon: "apple", label: "La pomme" },
    { id: "banane", icon: "banana", label: "La banane" },
    { id: "fraise", icon: "strawberry", label: "La fraise" },
    { id: "pizza", icon: "pizza", label: "La pizza" },
    { id: "carotte", icon: "carrot", label: "La carotte" },
    { id: "fromage", icon: "cheese", label: "Le fromage" },
    { id: "cookie", icon: "cookie", label: "Le biscuit" },
    { id: "glace", icon: "icecream", label: "La glace" },
  ],
  instruments: [
    { id: "guitare", icon: "guitar", label: "La guitare" },
    { id: "tambour", icon: "drum", label: "Le tambour" },
    { id: "piano", icon: "piano", label: "Le piano" },
    { id: "trompette", icon: "trumpet", label: "La trompette" },
    { id: "violon", icon: "violin", label: "Le violon" },
    { id: "saxophone", icon: "sax", label: "Le saxophone" },
    { id: "maracas", icon: "maracas", label: "Les maracas" },
    { id: "cloche", icon: "bell", label: "La cloche" },
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
