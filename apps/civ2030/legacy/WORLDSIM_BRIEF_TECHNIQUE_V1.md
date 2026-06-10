# Brief technique original — World Sim 2030 (V1, avril 2026)

> Texte extrait du document source `WorldSim2030_Brief_Technique.docx` (Amine Djeghali,
> avril 2026). C'est le brief de la **V1 envisagée sous Phaser** (god-sim à agents Maslow).
> La V2 réellement construite (`worldsim-v2.jsx`) a simplifié : React single-file, SVG,
> stats agrégées sans agents individuels. Conservé ici pour l'historique des intentions
> de design (trophées, game over, événements WEF) dont certaines nourrissent la Phase 6 du 4X.

---




BRIEF TECHNIQUE
WORLD SIM 2030
God-Sim Browser Game — Simulation de Civilisation

Auteur : Amine Djeghali
Pour : Claude Code
Avril 2026

1. Vision Produit
World Sim 2030 est un god-sim navigateur où le joueur incarne une entité divine qui observe et influence une civilisation à travers des leviers politiques, économiques et sociaux. Le jeu simule le monde réel de 2026 à 2030 avec des données baseline authentiques (FMI, ONU, WEF).

1.1 Pitch
"Et si tu étais Dieu et que tu devais piloter l'humanité de 2026 à 2030 sans provoquer l'effondrement ? Chaque levier a un coût. Chaque décision a des conséquences. Trouve la société idéale."

1.2 Références visuelles
• WorldBox: God Simulator — pixel art top-down, PNJ visibles, feu/destruction/construction
• Civilization III — carte isometric, terrains variés, brouillard de guerre
• RimWorld — gestion de colons avec personnalitys, besoins, événements aléatoires
• Dwarf Fortress — profondeur de simulation, chaque agent est unique

1.3 Objectifs joueur
• Maximiser le bonheur (basé pyramide de Maslow hiérarchique)
• Minimiser les inégalités (coefficient de Gini)
• Maintenir la température sous +1.5°C
• Débloquer les 10 trophées (Utopie, Égalité, Paradis 2030...)
• Éviter les 5 game over (Extinction, Guerre nucléaire, Cataclysme climatique, Fin reproduction, Effondrement social)

2. Stack Technique

Composant
Technologie
Moteur de jeu
Phaser 3.85+ (2D, WebGL, pixel art natif)
Rendu carte
Tilemap isometric ou top-down (Phaser Tilemap API)
Éditeur carte
Tiled Map Editor → export JSON
Assets graphiques
Pixel art 16x16 ou 32x32 (CC0 OpenGameArt ou custom)
Sprites PNJ
Spritesheet animé (idle, walk 4 dirs, work, die)
UI / HUD
Phaser DOM + HTML overlay ou Phaser UI plugins
Simulation
Module JS pur (tick-based, découplé du rendu)
Pathfinding
EasyStar.js (A* pour grille)
State management
Module singleton ou Zustand si React overlay
Build
Vite + TypeScript
Déploiement
Vercel / Netlify (static)

2.1 Pourquoi Phaser et pas Three.js / React
• Phaser est conçu pour le jeu 2D : tilemap natif, sprite animations, camera, input, physics
• Three.js est un moteur 3D généraliste — overkill pour du pixel art top-down
• React est pour des UI, pas pour un game loop 60fps avec des centaines de sprites
• Phaser gère nativement le pixel art mode (pas d'antialiasing, nearest neighbor)

3. Architecture du Projet

3.1 Structure fichiers
worldsim2030/
├─ src/
│  ├─ main.ts                 # Entry point Phaser
│  ├─ config.ts               # Phaser game config
│  ├─ scenes/
│  │  ├─ BootScene.ts         # Preload assets
│  │  ├─ GameScene.ts         # Main game scene
│  │  ├─ HudScene.ts          # UI overlay scene (parallel)
│  │  └─ GameOverScene.ts     # Game over screen
│  ├─ simulation/
│  │  ├─ Engine.ts            # Tick engine (découplé du rendu)
│  │  ├─ Agent.ts             # Classe agent (Maslow, économie, santé)
│  │  ├─ MapGenerator.ts      # Génération procédurale du monde
│  │  ├─ EventSystem.ts       # Événements stochastiques
│  │  ├─ PolicyManager.ts     # 14 leviers politiques + budget
│  │  ├─ MetricsCalculator.ts # IDH, Gini, PIB, etc.
│  │  └─ GameOverChecker.ts   # 5 conditions de fin
│  ├─ entities/
│  │  ├─ Citizen.ts           # Sprite PNJ + lien Agent
│  │  ├─ Building.ts          # Sprite bâtiments
│  │  └─ Effect.ts            # Particules (feu, pluie, pollution)
│  ├─ ui/
│  │  ├─ MetricsBar.ts        # Barre top avec IDH, Gini, etc.
│  │  ├─ PolicyPanel.ts       # Panneau latéral avec sliders
│  │  ├─ AgentInspector.ts    # Détail agent au clic
│  │  ├─ EventTicker.ts       # Bandeau d'événements
│  │  └─ AchievementPopup.ts  # Notification trophée
│  └─ data/
│     ├─ baseline2026.ts      # Données réelles mondiales
│     ├─ events.ts            # Définition des 12 événements
│     ├─ achievements.ts      # 10 trophées
│     └─ terrains.ts          # 14 types de terrain
├─ assets/
│  ├─ tilesets/                # PNG tilesets (16x16 ou 32x32)
│  ├─ sprites/                 # Spritesheets PNJ
│  ├─ tilemaps/                # JSON exportés de Tiled
│  ├─ ui/                      # Assets UI (cadres, icônes)
│  └─ audio/                   # SFX + ambient (optionnel)
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
└─ package.json

4. Game Design Document

4.1 Core Loop
• 1. Observer la carte (PNJ se déplacent, travaillent, interagissent)
• 2. Lire les métriques (IDH, Gini, Température, Bonheur)
• 3. Ajuster les 14 leviers politiques (panneau latéral)
• 4. Observer les conséquences (immédiates et différées)
• 5. Réagir aux événements aléatoires (crises, booms)
• 6. Viser les trophées / éviter les game over

4.2 Carte du monde
Génération procédurale
• Grille 28x18 tiles (extensible)
• Algorithme : distance au centre + bruit pour forme d'île
• 14 types de terrain : océan, mer, littoral, prairie, champs, forêt, collines, montagne, neige, désert, métropole, bourgade, industrie, pôle tech
• Placement automatique de 3 villes, 2 zones industrielles, 2 pôles tech
• Chaque tile a : nourriture, ressources, pollution, développement
Rendu Phaser
• Tilemap créé dans Tiled avec un tileset pixel art 32x32
• Layer 1 : terrain de base
• Layer 2 : décorations (arbres, rochers, fleurs)
• Layer 3 : bâtiments (maisons, immeubles, usines)
• Layer 4 : overlay pollution/développement (teintes dynamiques)
• Caméra : scroll WASD/flèches + molette zoom + drag

4.3 Agents / PNJ
Données (module simulation)
• 75 agents avec : nom, âge, genre, personnalité (8 types), profession (14 types)
• Pyramide de Maslow : physiologie, sécurité, appartenance, estime, accomplissement
• Stats : richesse, revenu, santé, éducation, littératie IA, exposition climatique
• Social : confiance institutionnelle, griefs, connexions
• Fertilité (18-50 ans + santé > 25) → système de natalité
Rendu Phaser (sprite)
• Spritesheet 32x32 avec animations : idle (2 frames), walk_down/up/left/right (4 frames chacun), work (2 frames), die (3 frames)
• Couleur du sprite varie selon bonheur : vert > 60, jaune 40-60, rouge < 40 (tint Phaser)
• Bulle d'état au-dessus du PNJ : ❤️ santé, 💼 emploi, 😡 griev, 🎓 éducation
• Pathfinding A* (EasyStar.js) vers destination : lieu de travail, maison, marché
• Clic sur un PNJ → panneau détail avec pyramide Maslow + stats complètes

4.4 Simulation Engine
Tick system
• 1 tick = ~1 seconde réelle = 0.1 an simulé
• Vitesse ajustable : 1x (800ms), 2x (400ms), 4x (200ms)
• Chaque tick : update agents → update carte → check events → check game over → update metrics
Budget et inflation
• Total dépenses = somme des 10 postes de dépense
• Si dépenses/10 > taxe * 2 → stress budgétaire → inflation
• Inflation impacte : revenus, emploi, confiance, satisfaction
• C'est le mécanisme anti-"tout à 100%" — les trade-offs sont forcés
Température globale
• Baseline 2026 : +1.3°C
• Monte en fonction de (100 - transition_energie) et (100 - environnement)
• Dépasser +1.5°C : effets négatifs croissants
• Dépasser +3°C : Game Over Cataclysme

4.5 Événements
12 événements basés sur les risques réels WEF 2026 :
• CRISES : Vague de chaleur, Crise dette, Pandémie, Cyberattaque, Méga-inondation, Bulle tech, Tensions nucléaires
• BOOMS : Percée IA agents, Boom renouvelables, Réforme éducative, Avancée médicale, Accord climat
• Chaque événement a : probabilité par tick, durée, effet sur agents/carte
• Rendu : notification popup + effet visuel sur la carte (feu pour chaleur, pluie pour inondation, éclairs pour tech)

4.6 Game Over (5 conditions)
Condition
Trigger
Description
Extinction
Population = 0
Plus personne en vie
Guerre nucléaire
Confiance < 8 + Griefs > 80 + Temp > 1.8
Tensions géopolitiques extrêmes
Cataclysme climat
Température > +3°C
Écosystèmes effondrés
Fin reproduction
0 agents fertiles
Civilisation condamnée
Effondrement social
Confiance < 5 + Griefs > 75
Anarchie totale

4.7 Trophées (10)
• Utopie : Bonheur > 70
• Égalité : Gini < 0.25
• Plein emploi : Emploi > 95%
• Monde vert : Pollution < 5
• Ère IA : IA literacy > 70
• Confiance : Confiance moy > 70
• Fournaise : Temp > +2°C (négatif)
• Révolution : Griefs > 60 (négatif)
• Effondrement : HDI < 30 (négatif)
• Paradis 2030 : HDI > 75 + Gini < .30 + Bonheur > 65 (boss final)

5. Assets à Produire

5.1 Tileset terrain (priorité 1)
• Format : PNG 32x32 par tile, palette limitée (style WorldBox)
• 14 tiles de terrain + variantes (2-3 par terrain = ~40 tiles)
• Décorations : arbres (3 types), rochers, fleurs, herbe haute
• Bâtiments : maison bois, maison pierre, immeuble petit/grand, usine, labo tech, ferme, marché
• Source recommandée : OpenGameArt (CC0) ou générer avec Aseprite

5.2 Spritesheet PNJ (priorité 1)
• Taille : 16x16 ou 32x32 pixels
• Animations : idle (2f), walk_down (4f), walk_up (4f), walk_left (4f), walk_right (4f), work (2f), die (3f)
• Total : 23 frames par PNJ
• Variantes couleur via Phaser tint (pas besoin de sprites séparés)
• Source : Kenney.nl (CC0) ou LPC Spritesheet Generator

5.3 UI Assets (priorité 2)
• Cadre panneau latéral (9-slice)
• Slider custom pixel art
• Boutons : play, pause, speed, reset
• Icônes métriques : IDH, Gini, emploi, température, IA
• Popup notification trophée
• Overlay game over (fond sombre + icône)

5.4 Audio (priorité 3)
• Ambient : boucle nature 30s (oiseaux, vent)
• SFX : clic UI, notification événement, trophée débloqué, game over
• Source : Freesound.org (CC0)

6. Roadmap de Développement

Phase 1 : Fondations (2-3 jours)
• Setup Vite + TypeScript + Phaser
• BootScene avec preload assets
• Générateur de carte procédurale → Tilemap Phaser
• Caméra : scroll + zoom
• Rendu basique des 14 terrains

Phase 2 : Simulation (2-3 jours)
• Module simulation découplé (Engine.ts)
• Classe Agent avec Maslow + économie
• Tick system avec vitesse variable
• PolicyManager avec 14 leviers + budget
• MetricsCalculator (IDH, Gini, PIB, etc.)

Phase 3 : PNJ visuels (2-3 jours)
• Sprite PNJ avec animations
• Pathfinding A* (EasyStar.js)
• PNJ se déplacent entre tiles
• Tint couleur selon bonheur
• Clic PNJ → panneau détail

Phase 4 : UI/HUD (2 jours)
• HUD fullscreen avec métriques top bar
• Panneau latéral avec sliders politiques
• Bandeau événements en bas
• AgentInspector au clic
• SparkLines pour historique

Phase 5 : Gameplay (1-2 jours)
• Système d'événements (12 types)
• 5 conditions Game Over
• 10 trophées avec notifications
• Système de natalité
• Effets visuels (événements : feu, pluie, éclairs)

Phase 6 : Polish (1-2 jours)
• Audio ambient + SFX
• Particules Phaser (fumée pollution, étoiles trophée)
• Transitions scènes (fade in/out)
• Responsive design
• Déploiement Vercel

7. Prompt Initial Claude Code

Voici le prompt à coller dans Claude Code pour démarrer :

Crée un projet god-sim navigateur appelé "World Sim 2030" avec Phaser 3 + TypeScript + Vite. Le joueur est un dieu qui observe sa civilisation pixel art depuis le ciel et influence le monde via 14 leviers politiques.

Stack : Phaser 3.85, TypeScript, Vite, EasyStar.js (pathfinding)

Carte : Grille 28x18, génération procédurale en île, 14 types de terrain pixel art 32x32, caméra scroll + zoom.

Agents : 75 PNJ avec sprites animés (idle, walk 4 dirs, work), pyramide de Maslow (5 niveaux), économie, santé, éducation, littératie IA. Pathfinding A* entre tiles.

Simulation : Tick-based (0.1 an/tick), 14 leviers politiques avec contrainte budgétaire (dépenses > recettes = inflation), température globale qui monte, 12 événements aléatoires basés WEF 2026.

Gameplay : 5 game over (extinction, nucléaire, climat +3°C, fin reproduction, effondrement social), 10 trophées, système de natalité.

HUD : Fullscreen, barre métriques en haut (IDH, Gini, Bonheur, Emploi, Temp, IA), panneau latéral sliders, bandeau événements, inspecteur agent au clic.

DA : Pixel art style WorldBox, palette chaude et douce (fond crème, accents terracotta/olive), lisible sans forcer les yeux.

Commence par la Phase 1 : setup projet + carte procédurale + caméra.

7.1 Assets de démarrage
Pour les premiers tests, utiliser des rectangles colorés comme placeholder tiles. Le tileset définitif sera intégré en Phase 6 (polish). Phaser permet de générer des textures programmatiquement :
this.textures.generate('grass', { data: ['1'.repeat(32)], pixelWidth: 32, pixelHeight: 32 });

8. Valeur Portfolio

Ce projet démontre des compétences clés pour un profil PO/PM + tech :
• Product thinking : game design document complet, core loop défini, métriques de succès
• Données réelles : intégration de data FMI/ONU/WEF dans un produit interactif
• Architecture technique : séparation simulation/rendu, modules découplés
• IA : simulation agents autonomes avec besoins Maslow, disruption IA intégrée
• Game design : 5 game over, 10 achievements, événements basés sur des risques réels
• Livrable complète : déployable en 1 clic, jouable dans un navigateur

Parfait comme pièce maîtresse du portfolio Amine Tech — démontre la capacité à concevoir, spécifier ET builder un produit complexe de A à Z.