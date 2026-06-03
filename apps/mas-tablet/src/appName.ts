/**
 * Nom de l'application — source unique, pilotée au moment du build.
 *
 *  • Version PUBLIQUE (Android / Play Store)  → « Évelio »   (valeur par défaut)
 *  • Version STRUCTURE (Windows, MAS)         → « MAS Tablette »
 *
 * La distinction se fait via le mode de build Vite :
 *   - build par défaut  → fichier .env          → VITE_APP_NAME=Évelio
 *   - build « windows » → fichier .env.windows  → VITE_APP_NAME=MAS Tablette
 *
 * Voir package.json (scripts win:*) et les configs Tauri par plateforme.
 */
export const APP_NAME: string =
  (import.meta.env.VITE_APP_NAME as string | undefined)?.trim() || "Évelio";

/** Sous-titre affiché sous le nom sur l'écran d'accueil. */
export const APP_TAGLINE = "Choisis ton activité";
