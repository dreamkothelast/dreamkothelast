# /legacy — Référence World Sim 2030 (V2 god-sim)

## ⚠️ Décision documentée (Phase 0)

Le brief de la Phase 0 demandait de **placer le code existant de la V2 god-sim dans
`/legacy` comme référence**. Or, après audit complet du repo `dreamkothelast/dreamkothelast`
(toutes branches : `claude/civ2030-phase0-setup-*`, `claude/create-parisian-merchant-org-*`,
historique git complet), **le code de World Sim 2030 n'existe nulle part dans ce repo** :
aucune occurrence de la palette `#F5F1E8`, des biomes, ou des événements géopolitiques.
Le repo contient un monorepo sans rapport (`parislivr` : apps web/api/mas-tablet).

Plutôt que de bloquer la phase, la décision suivante a été prise :

1. **`WORLDSIM_V2_SPEC.md`** (ci-contre) reconstitue formellement tout ce qui est connu
   de la V2 à partir de sa description : palette, 9 biomes, génération par bruit
   multi-fréquences, événements 2026-2030, 3 fins. C'est la **référence normative**
   que la Phase 1 (biomes) et la Phase 6 (événements, fins) devront implémenter.
2. Si tu retrouves le fichier source de la V2 (le single-file React), **dépose-le ici**
   (`legacy/worldsim-v2.jsx` ou similaire) : il deviendra alors la référence prioritaire
   et la spec sera mise à jour pour coller au code réel.

## Ce que la Phase 1+ doit réutiliser de la V2

- La **palette crème** et la grammaire visuelle Mini Motorways (voir spec, §1).
- La **logique de génération de biomes** : bruit multi-fréquences (élévation +
  humidité), seuils par biome (voir spec, §2). À réimplémenter en TypeScript pur
  dans `src/engine/map/`, de façon seedée et déterministe.
- Le **ton et la matière des événements narratifs** 2026-2030 (voir spec, §3),
  réinjectés en Phase 6 sous forme data-driven dans `src/data/events.ts`.
- Le principe des **fins multiples** (voir spec, §4), généralisé en 4 conditions
  de victoire 4X en Phase 6.

Ce dossier est **hors build et hors lint** (exclu dans `eslint.config.js` et non
importé par `src/`) : c'est de la documentation, pas du code de production.
