# Civilization 2030 — Architecture

> Phase 0 — version 1.0. Contrainte dure : **l'engine tourne et se teste en pur
> TypeScript/Node, sans navigateur**. Tout ce document en découle.

## 1. Vue d'ensemble

```
apps/civ2030/
├── src/
│   ├── engine/   # Logique de jeu pure. Zéro import UI/DOM/React. Testable en Node.
│   ├── render/   # Rendu Canvas 2D de la carte. Lit GameState, ne le modifie jamais.
│   ├── ui/       # React : HUD, écrans (ville, tech, diplomatie, menus).
│   └── data/     # Contenu déclaratif typé : techs, unités, bâtiments, événements, archétypes IA.
├── tests/        # Vitest, environnement "node" (pas de jsdom : l'engine n'en a pas besoin).
└── legacy/       # Référence World Sim V2 (spec). Hors build, hors lint.
```

**Règle de dépendance (strictement descendante)** :

```
ui  →  render  →  engine  →  data
```

- `engine` importe `data` (les tables de contenu) et rien d'autre.
- `render` importe `engine` (types + état) et rien de React.
- `ui` orchestre tout : il détient l'état React, appelle l'engine, monte le canvas.
- Interdit : `engine` → `render`/`ui`, `data` → logique.

**Application mécanique de la règle** (pas seulement documentaire) :
1. `tsconfig.engine.json` compile `src/engine` + `src/data` avec `"lib": ["ES2022"]`
   **sans DOM** : tout accès à `window`/`document`/`HTMLElement` casse le typecheck.
2. `eslint.config.js` interdit dans `src/engine` et `src/data` les imports de
   React/render/ui et les globales DOM (`no-restricted-imports` / `no-restricted-globals`).
3. Vitest tourne en environnement `node` : un engine qui touche au DOM fait
   échouer la CI par construction.

## 2. Modèle du GameState

Un **état unique, sérialisable JSON, sans classes ni fonctions ni `Map`/`Set`**
(tableaux + records uniquement) : c'est ce qui rend save/load (Phase 6) trivial
et les tests headless reproductibles.

Forme cible (implémentée progressivement, Phase 1 → 6) :

```ts
interface GameState {
  schemaVersion: number;        // migrations de sauvegardes
  seed: string;                 // seed maître de la partie
  turn: number;                 // 1-indexé ; 1 tour = 1 trimestre, T1 2026
  rngState: number;             // état du PRNG embarqué DANS l'état (voir §4)

  map: {
    width: number; height: number;          // ~40×25, axial pointy-top
    tiles: Tile[];                          // index = r * width + q
  };
  civs: Civ[];                              // joueur = civs[0] (humanité paramétrable Phase 5)
  cities: City[];
  units: Unit[];
  // Visibilité par civ : 3 états (inexploré / exploré / visible), stockée à plat
  visibility: Record<CivId, Uint8ArrayLike>; // number[] sérialisable

  diplomacy: DiploRelation[];               // Phase 5
  climate: { globalRisk: number };          // jauge planétaire (GDD §9)
  pendingEvents: GameEvent[];               // Phase 6
  result: GameResult | null;                // victoire/défaite atteinte
}
```

Identifiants : **IDs opaques** (`CivId`, `CityId`, `UnitId` — branded strings),
jamais d'indices de tableau dans les références croisées.

### Mutations : actions + endTurn, le tout pur

L'engine expose deux familles de fonctions **pures** (`(state, …) → state'`,
copie structurelle, jamais de mutation en place) :

```ts
// Ordres du joueur ou d'une IA — mêmes fonctions pour les deux (GDD pilier 4)
applyAction(state: GameState, civId: CivId, action: Action): GameState;

// Fin de tour : résolution déterministe dans un ordre fixe
endTurn(state: GameState): GameState;
```

`Action` est une union discriminée (`{ type: "moveUnit", … } | { type: "setResearch", … } | …`).
Avantages : rejouabilité (seed + liste d'actions = partie), IA et joueur
strictement symétriques, tests triviaux, time-travel debug possible.

Performance assumée : à ~1 000 tuiles et < 200 unités, la copie structurelle
par tour coûte < 1 ms en V8 — l'immutabilité naïve suffit, pas besoin d'Immer
ni de structures persistantes. À re-mesurer en Phase 5 (headless 100 tours).

## 3. Frontière engine ↔ UI

- L'UI tient le `GameState` courant dans un store React minimal
  (`useReducer`/context en Phase 1 ; Zustand seulement si la profondeur des
  écrans le justifie en Phase 2+ — décision repoussée volontairement).
- L'UI appelle `applyAction`/`endTurn` et remplace l'état ; les sélecteurs purs
  de l'engine (`getTileYields(state, tileId)`, `getReachableTiles(state, unitId)`…)
  servent aux panneaux et au surlignage. **Aucune règle de jeu dans l'UI.**
- `render/` reçoit `{ state, camera, hover, selection }` et dessine. Les entrées
  souris/clavier sont traduites par `ui/` en intentions (« sélectionner la tuile
  q,r »), jamais interprétées par `render/`.

## 4. Déterminisme & RNG

- PRNG maison **mulberry32** (32 bits, 4 lignes, largement suffisant pour du
  gameplay) ; `rngState` vit **dans le GameState** : tirer un nombre rend un
  nouvel état. Aucun `Math.random()` dans `src/engine` (lint l'interdira en
  Phase 1).
- La génération de carte dérive des sous-seeds (élévation, humidité,
  ressources) du seed maître par hachage — même seed ⇒ même carte, même partie
  à actions égales. C'est testé, pas promis.

## 5. Rendu de la carte : Canvas 2D (décision)

### Les chiffres

Charge à dessiner, carte 40×25 = **1 000 hexagones**, vue typique zoomée ~400
tuiles visibles :

| Élément                          | Quantité   | Coût/frame Canvas 2D (est.)    |
| -------------------------------- | ---------- | ------------------------------ |
| Hexagones biome (path + fill)    | ≤ 1 000    | ~1 000 draw calls ≈ 1-2 ms     |
| Ressources/aménagements (icônes) | ~200       | ~0,3 ms (sprites pré-rendus)   |
| Unités + villes                  | < 100      | ~0,2 ms                        |
| Fog + surlignages                | ~1 000     | ~1 ms (calque dédié)           |

Budget 60 fps = 16,6 ms/frame. Pire cas estimé **< 5 ms**, et le calque
terrain ne change qu'aux changements d'état (pas au pan/zoom : on blitte un
**canvas offscreen pré-rendu** par niveau de zoom, soit 1 `drawImage` par
frame pendant la navigation). Marge ×3 minimum.

### Comparaison

| Critère                         | **Canvas 2D**          | PixiJS (WebGL)         | SVG                     |
| ------------------------------- | ---------------------- | ---------------------- | ----------------------- |
| 1 000 hex + fog à 60 fps        | ✅ ~5 ms (offscreen)   | ✅ ~1 ms (surdimensionné) | ❌ 1 000+ nœuds DOM, layout/paint instables au pan |
| Poids ajouté au bundle          | **0 Ko**               | ~450 Ko min            | 0 Ko                    |
| Adéquation DA (aplats, formes)  | ✅ exact               | ✅ mais pipeline texture inutile ici | ✅                |
| Testabilité hors navigateur     | ✅ rendu isolé de l'engine de toute façon | idem | idem |
| Risque/maintenance              | API stable depuis 15 ans | dépendance majeure, breaking changes v7→v8 | piège de perf connu pour les cartes |

**Décision : Canvas 2D**, avec calques (terrain pré-rendu offscreen / entités /
fog / UI de carte). PixiJS ne devient pertinent que si on passe à des cartes
5-10× plus grandes ou à des animations massives — hors périmètre v1 (GDD §11).
Critère de bascule explicite : si le profil Phase 1 montre > 8 ms/frame en
navigation sur une machine moyenne, on réévalue.

## 6. Données (`src/data`)

Modules TypeScript déclaratifs (constantes typées exportées), pas de JSON : on
gagne le typage, les unions discriminées et les références vérifiées à la
compilation (`unlocks: BuildingId[]`). Pas de logique dans `data/` — les
effets sont des **descripteurs** (`{ kind: "yieldBonus", yield: "science", … }`)
interprétés par l'engine. L'intégrité (graphe de techs acyclique, IDs
référencés existants) est testée en CI dès la Phase 4.

## 7. Tests

- **Vitest, environnement `node`** — l'engine se teste sans navigateur (contrainte dure).
- Pyramide : unités engine (déterminisme, rendements, A*, combat) → intégrité
  data (graphe techs) → **simulations headless** (20 tours éco en Phase 2, 100
  tours IA vs IA en Phase 5, partie scriptée jusqu'à victoire Science en Phase 6).
- Le rendu n'est pas testé par snapshot d'image en v1 ; il est gardé trivial et
  vérifié à la main (DoD de chaque phase).

## 8. Intégration au monorepo

L'app vit dans `apps/civ2030` du monorepo pnpm/turbo existant (décision Phase 0 :
le repo contenait déjà d'autres apps sans rapport — on n'écrase rien). Elle est
autonome : Vite + React + TS strict, aucun import des autres apps/packages.
Les commandes passent par turbo depuis la racine ou directement ici
(voir `CLAUDE.md`).
