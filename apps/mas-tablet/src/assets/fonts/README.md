# Polices auto-hébergées (self-hosted fonts)

Ce dossier doit contenir les fichiers de police Fredoka au format WOFF2.

## Procédure de téléchargement (une seule fois)

1. Aller sur https://fonts.google.com/specimen/Fredoka
2. Cliquer "Download family"
3. Extraire l'archive — récupérer les fichiers `.ttf`
4. Convertir en WOFF2 avec l'outil en ligne https://www.fontsquirrel.com/tools/webfont-generator
   ou via `woff2_compress` (cli) :
   ```
   woff2_compress Fredoka-Regular.ttf
   woff2_compress Fredoka-SemiBold.ttf
   woff2_compress Fredoka-Bold.ttf
   ```
5. Placer les fichiers `.woff2` dans ce dossier :
   - `Fredoka-Regular.woff2`
   - `Fredoka-SemiBold.woff2`
   - `Fredoka-Bold.woff2`

## Fallback

Sans ces fichiers, l'application utilise le fallback CSS :
`"Baloo 2", "Quicksand", "Comic Sans MS", cursive`

L'app fonctionne parfaitement sans la police, mais Fredoka est recommandée
pour l'expérience optimale (arrondie, chaleureuse, très lisible).

## Licence

Fredoka est distribuée sous licence OFL (Open Font License) — utilisation
commerciale et intégration dans l'application autorisées.
