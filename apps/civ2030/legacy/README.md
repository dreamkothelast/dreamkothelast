# /legacy — Référence World Sim 2030 (V2 god-sim)

Référence du jeu d'origine dont Civilization 2030 hérite l'ADN. **Hors build et
hors lint** (exclu dans `eslint.config.js`, jamais importé par `src/`) : c'est
de la documentation, pas du code de production.

## Contenu

| Fichier | Rôle |
| ------- | ---- |
| `worldsim-v2.jsx` | **Le code source réel de la V2** (single-file React, fourni par Amine). Fait foi. |
| `WORLDSIM_V2_SPEC.md` | Spec synchronisée avec ce code : palette/tokens, biomes et génération, simulation, 9 événements, 3 fins — plus le tableau des écarts V2 ↔ brief 4X et les décisions prises. |
| `WORLDSIM_BRIEF_TECHNIQUE_V1.md` | Brief technique original (avril 2026) de la V1 envisagée sous Phaser (god-sim à agents Maslow). Historique des intentions : trophées, game over, événements WEF. |

## Historique de la décision

En Phase 0, le code V2 était introuvable dans le repo : la spec avait été
**reconstituée** depuis la description (avec marquage [connu]/[reconstitué]).
Le code réel a été fourni ensuite et la spec a été **resynchronisée** — elle ne
contient plus de reconstitution, le code fait foi.

## Ce que les phases suivantes y puisent

- **Phase 1** : design tokens et grammaire visuelle des tuiles (spec §1),
  schéma de génération élévation/humidité/température (§2) — en le rendant
  **seedable** (la V2 ne l'est pas, écart documenté §6).
- **Phase 6** : matière des événements narratifs (§4) et des fins (§5) ;
  les trophées/game over du brief V1 peuvent inspirer le score et les fins d'échec.
