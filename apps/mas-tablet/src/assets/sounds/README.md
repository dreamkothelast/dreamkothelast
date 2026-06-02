# Sons de l'application

## Phase 1 — Sons générés

L'activité Bulles Magiques utilise des sons **générés en temps réel** via la Web Audio API
(gamme pentatonique, aucun fichier requis). Pas de fichier à fournir pour la Phase 1.

## Structure attendue pour les phases suivantes

```
sounds/
├── ui/
│   ├── click.mp3          # Son de bouton (court, doux)
│   ├── home.mp3           # Retour accueil
│   └── celebration.mp3    # Fanfare de célébration
├── animaux/
│   ├── chat.mp3
│   ├── chien.mp3
│   ├── vache.mp3
│   ├── canard.mp3
│   ├── grenouille.mp3
│   └── ...
├── instruments/
│   ├── piano.mp3
│   ├── guitare.mp3
│   ├── tambour.mp3
│   └── ...
└── objets/
    ├── telephone.mp3
    ├── klaxon.mp3
    └── ...
```

## Sources recommandées (CC0, 100 % libres)

- **Freesound.org** (https://freesound.org) — filtrer par licence CC0
- **Kenney.nl** (https://kenney.nl/assets) — packs audio CC0

## Format requis

- MP3 (compatible Howler.js et WebView2)
- Durée max : 3 secondes pour les effets, 5 s pour les sons d'animaux
- Niveau : normalisé à -6 dBFS (pas trop fort)
