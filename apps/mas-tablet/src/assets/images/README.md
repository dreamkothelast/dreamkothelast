# Images de l'application

## Structure attendue

```
images/
├── mascotte.svg           # Mascotte finale (remplacer le placeholder SVG dans Mascot.tsx)
├── animaux/
│   ├── chat.svg           # ou .png (512×512 recommandé)
│   ├── chien.svg
│   ├── vache.svg
│   ├── canard.svg
│   ├── grenouille.svg
│   ├── lion.svg
│   ├── elephant.svg
│   └── ...
├── objets/
│   ├── telephone.svg
│   ├── voiture.svg
│   ├── livre.svg
│   └── ...
├── nourriture/
│   ├── pomme.svg
│   ├── banane.svg
│   └── ...
└── instruments/
    ├── piano.svg
    ├── guitare.svg
    ├── tambour.svg
    └── ...
```

## Sources recommandées (CC0)

- **Kenney.nl** — https://kenney.nl/assets (packs d'animaux, objets, aliments en SVG)
- **OpenMoji** — https://openmoji.org (emojis en SVG CC-BY)
- **SVGRepo** — https://svgrepo.com (nombreux SVG CC0)
- **Twemoji** — https://github.com/twitter/twemoji (CC-BY 4.0)

## Format

- SVG préféré (vectoriel, scale sans perte, embarqué dans le bundle Vite)
- PNG acceptable : 512×512 px minimum
- Fond transparent recommandé
- Style : cartoon, contours épais, couleurs vives mais douces
