# Spécification de référence — World Sim 2030 V2 (god-sim)

> Reconstitution normative de la V2 à partir de sa description (le code source
> n'étant pas présent dans ce repo — voir `README.md`). Les sections marquées
> **[connu]** sont des faits décrits de la V2 ; les sections **[reconstitué]**
> sont des choix de Phase 0 pour rendre la spec implémentable, à ajuster si le
> code original refait surface.

## 1. Direction artistique **[connu]**

- Style : **pixel raffiné type Mini Motorways** — géométrie épurée, aplats doux,
  pas de contours durs, pas de textures bruitées.
- Fond / canevas : **crème `#F5F1E8`**.
- Palette de biomes **[reconstitué]** — dérivée de la contrainte « pastel sur crème » :

  | Biome           | Couleur   | Note                          |
  | --------------- | --------- | ----------------------------- |
  | Océan           | `#A8C5D6` | bleu-gris doux                |
  | Côte            | `#C4D8E2` | océan éclairci                |
  | Plaine          | `#C8D4A7` | vert tendre                   |
  | Forêt           | `#9DB88F` | vert plus saturé, jamais cru  |
  | Désert          | `#E8D5A8` | sable chaud                   |
  | Montagne        | `#B8AFA5` | gris pierre chaud             |
  | Toundra         | `#D8D8D0` | gris-vert froid               |
  | Jungle          | `#7FA876` | le plus saturé de la palette  |
  | Rivière         | `#9FBFD4` | entre océan et côte           |

- Encre / texte : brun-gris foncé (`#3A3633`), jamais de noir pur.

## 2. Génération de carte **[connu + reconstitué]**

- **9 biomes** : océan, côte, plaine, forêt, désert, montagne, toundra, jungle,
  rivières. **[connu]**
- Générés par **bruit multi-fréquences** (plusieurs octaves superposées). **[connu]**
- Schéma reconstitué pour la réimplémentation Phase 1 **[reconstitué]** :
  - Deux champs de bruit indépendants, **élévation** et **humidité**, chacun en
    3-4 octaves (fréquence ×2, amplitude ×0.5 par octave), seedés séparément à
    partir d'un seed maître (PRNG déterministe, ex. mulberry32 + hash du seed).
  - Classification : `élévation < seuilMer` → océan ; bande au-dessus → côte ;
    `élévation > seuilPic` → montagne ; sinon croisement latitude (proxy de
    température) × humidité → toundra / plaine / forêt / désert / jungle.
  - Rivières : descente de gradient depuis des sources en altitude jusqu'à la mer.
- Exigences reprises telles quelles en Phase 1 : **déterminisme par seed**
  (même seed ⇒ même carte) et continents connexes.

## 3. Événements géopolitiques 2026-2030 **[connu + reconstitué]**

La V2 déroulait des événements narratifs ancrés dans l'actualité 2026-2030,
présentés en cartes avec choix. Matière à réinjecter en Phase 6 (data-driven,
avec déclencheurs par date OU par état du monde, et conséquences mécaniques) :

| Événement (reconstitué)        | Déclencheur indicatif | Tension de design                          |
| ------------------------------ | --------------------- | ------------------------------------------ |
| Sommet COP                     | date (fin d'année)    | sacrifier de la Production pour l'Énergie propre / l'Influence |
| Rupture de capacités IA        | état (techs IA)       | accélération Science vs risque d'instabilité |
| Crise énergétique mondiale     | état (Énergie basse)  | tout le monde perd, les préparés perdent moins |
| Pandémie                       | date ± aléa seedé     | population vs économie                     |
| Tensions sur les semi-conducteurs | état (terres rares) | embargo = levier diplomatique              |
| Course au spatial              | état (techs Spatial)  | prestige (Influence) vs coût               |
| Vague migratoire climatique    | état (désertification)| population gratuite vs instabilité         |
| Percée fusion                  | état (techs Énergie)  | jackpot Énergie pour le premier            |
| Cyberattaque majeure           | aléa seedé            | sabotage de la file de production          |

## 4. Fins multiples **[connu + reconstitué]**

La V2 proposait **3 fins**. Reconstitution plausible : **effondrement climatique**,
**transcendance technologique**, **équilibre durable**. En 4X, ce principe devient
les 4 conditions de victoire (Domination, Science, Influence, Score 2050) **plus**
des fins d'échec collectives héritées du god-sim (ex. effondrement climatique
mondial si l'Énergie sale dépasse un seuil planétaire) — voir `GAME_DESIGN.md` §9.

## 5. Ce qui n'est PAS repris

- La boucle god-sim (observation passive, pas de tours) — remplacée par le tour
  par tour 4X.
- Le format single-file React — remplacé par l'architecture engine/render/ui/data
  (voir `ARCHITECTURE.md`).
