# CLAUDE.md — Civilization 2030 (`apps/civ2030`)

Jeu 4X tour par tour, période 2026→2050, DA Mini Motorways. Trois documents
normatifs à lire avant toute session de travail :

1. **`GAME_DESIGN.md`** — vision, piliers, les 7 systèmes, victoires.
2. **`ARCHITECTURE.md`** — GameState, pureté de l'engine, Canvas 2D, RNG.
3. **`legacy/WORLDSIM_V2_SPEC.md`** — référence biomes/palette/événements de la V2.

## Commandes

Depuis `apps/civ2030/` (ou depuis la racine via `pnpm -F civ2030 <cmd>`) :

```bash
pnpm dev          # serveur Vite (jeu dans le navigateur)
pnpm test         # Vitest, environnement node, one-shot
pnpm test:watch   # Vitest en watch
pnpm typecheck    # tsc app + tsc engine SANS lib DOM (garde-fou pureté)
pnpm lint         # ESLint (interdit React/DOM dans src/engine et src/data)
pnpm build        # tsc -b + vite build
```

Installation : `pnpm install` à la **racine du monorepo** (workspace pnpm).

## Definition of Done (par défaut, toute session)

1. `pnpm typecheck` vert — y compris `tsconfig.engine.json` (engine sans DOM).
2. `pnpm test` vert — tests nouveaux inclus pour tout comportement nouveau.
3. `pnpm lint` vert.
4. `pnpm build` vert.
5. Vérification manuelle dans `pnpm dev` du critère de jeu de la phase.
6. Les `.md` normatifs mis à jour si une décision de design/archi a changé.
7. Un commit par phase sur la branche de la phase, message descriptif.

## Conventions

- **TypeScript strict intégral** (`noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` actifs) ; pas de `any`, pas de `as` de confort.
- **Pureté engine** : `src/engine` et `src/data` n'importent jamais React, ne
  touchent jamais au DOM, n'appellent jamais `Math.random()` (PRNG du
  GameState uniquement) ni `Date.now()` (le temps de jeu = `state.turn`).
  Le typecheck et le lint l'imposent — ne contourne pas ces gardes.
- **État** : `GameState` sérialisable JSON (pas de classes/Map/Set), mutations
  uniquement via `applyAction`/`endTurn` pures. IDs opaques, jamais d'indices.
- **Data-driven** : tout contenu (techs, unités, bâtiments, événements,
  archétypes) vit dans `src/data` en constantes typées ; l'engine interprète
  des descripteurs, ne contient aucun contenu en dur.
- **UI** : composants fonction, état via hooks ; aucune règle de jeu dans
  `src/ui` ou `src/render` — si un calcul de gameplay apparaît dans un
  composant, il doit déménager en sélecteur engine.
- **DA** : palette crème de `legacy/WORLDSIM_V2_SPEC.md` §1 ; pas de noir pur,
  pas de contours durs. Toute nouvelle couleur s'ajoute à la spec.
- **Langue** : UI et docs en français ; identifiants de code en anglais.
- Formatage Prettier du monorepo (`pnpm format` à la racine).

## Roadmap (1 phase = 1 session = 1 branche/commit)

| Phase | Contenu | Test clé |
| ----- | ------- | -------- |
| ✅ 0  | Repo, GDD, architecture, CLAUDE.md | compile à vide |
| 1     | Carte hex seedée (biomes V2 + ressources stratégiques), endTurn(), rendu Canvas pan/zoom, sélection tuile | déterminisme par seed, continents connexes |
| 2     | Villes (Colon minimal), 4 rendements + Énergie/Influence, croissance, file de prod, 8-10 bâtiments 2026+ | 20 tours sans NaN/négatif/explosion |
| 3     | Unités complètes, A*, combat, capture, fog 3 états | matrice combat 10+ cas, A* obstacles |
| 4     | Tech tree ~40 techs / 5 ères / 4 branches, écran arbre | graphe acyclique, déblocages effectifs |
| 5     | IA adverses (4 archétypes, règles symétriques), diplomatie minimale | **headless 100 tours IA vs IA sans crash** |
| 6     | Victoires (4), événements narratifs, save/load, menu, polish | partie scriptée → victoire Science |

Contraintes d'ordre : phases 2 et 3 **strictement séquentielles** (système
d'unités partagé). Ne pas commencer une phase si la DoD de la précédente n'est
pas verte.

## Pièges connus

- **Tour 120 ≠ 2050** : la fin de partie est au **tour 100** (T4 2050) — voir
  GDD §1, note de cohérence. Ne pas réintroduire 120.
- Le code de la V2 god-sim est dans `legacy/worldsim-v2.jsx` (il **fait foi**),
  avec sa spec synchronisée `legacy/WORLDSIM_V2_SPEC.md`. Attention : la V2
  n'est **pas seedable** et ses 9 biomes diffèrent de la liste 4X — les écarts
  et décisions sont tabulés dans la spec §6.
- En Phase 5, si l'IA déçoit : itérer sur les pondérations des archétypes
  (`src/data/personalities.ts`), ne pas réécrire l'architecture.
