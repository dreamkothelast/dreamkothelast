# Spécification de référence — World Sim 2030 V2 (god-sim)

> Synchronisée avec le **code source réel** : `worldsim-v2.jsx` (single-file React,
> dans ce dossier). En cas de doute, **le code fait foi**. Le brief V1 d'origine
> (vision Phaser, agents Maslow) est conservé dans `WORLDSIM_BRIEF_TECHNIQUE_V1.md`.

## 1. Direction artistique **[code réel]**

Design tokens de la V2 (`const C`, worldsim-v2.jsx l.10-23) :

| Token        | Couleur   | Usage                                |
| ------------ | --------- | ------------------------------------ |
| `bg`         | `#F5F1E8` | fond crème signature                 |
| `surface`    | `#EFE9DC` | panneaux, surfaces                   |
| `ink`        | `#2A2A2A` | texte principal (pas de noir pur)    |
| `inkSoft`    | `#6B6560` | texte secondaire                     |
| `line`       | `#D9D1C0` | lignes discrètes                     |
| `sand`       | `#E8C88A` | déserts, zones arides                |
| `sage`       | `#9CB88A` | forêts, nature                       |
| `ocean`      | `#7FA5C9` | eau                                  |
| `terracotta` | `#D4876A` | crises, alertes                      |
| `plum`       | `#8A6B8E` | high-tech, IA                        |
| `gold`       | `#C9A14B` | prospérité                           |

Règles : **5 accents max, muted** ; typographie sans-serif système, labels en
capitales espacées (letterSpacing 1.5-2, ~10-11px) ; bordures 1px `line`,
rayons 4-6px ; sparklines fines pour l'historique des métriques.

### Grammaire visuelle des tuiles (à transposer en Canvas en Phase 1)

Chaque biome a une **palette de 4 variantes** choisie par hash déterministe
par tuile, plus des micro-décorations seedées :

- **Océan** : petites vagues `q 3 -1.5 6 0` blanches, opacité 0.4, sur ~60 % des tuiles.
- **Désert** : traits de dunes `#B8964A` opacité 0.5.
- **Montagne** : triangle `#6B6257` + calotte neigeuse `#F5F1E8` opacité 0.85.
- **Plaine/prairie** : 2-3 points d'herbe (r 0.6, opacité 0.6).
- **Forêts** : 3-4 arbres = cercle canopée (`#6E8C55` / `#556B4A` en forêt dense)
  + ombre ellipse noire 0.12 + highlight clair décalé.
- **Routes** : courbes de Bézier, trait `ink` opacité 0.25 + pointillé crème central.
- **Villes** : grappes de petits rectangles (2-5 px) en couronne, couleurs
  majoritairement neutres `#5A554E` avec accents terracotta/gold/plum ;
  landmark central sombre pour les grandes villes.

## 2. Carte & génération **[code réel]**

- Grille **32×20**, tuiles carrées 22px, **rendu SVG** (la V2 n'est pas hex).
- **9 biomes réels** (l.39-49) :

  | Biome        | Palette (variante 1) | Constructible | Décor   |
  | ------------ | -------------------- | ------------- | ------- |
  | `ocean`      | `#7FA5C9`            | non           | vagues  |
  | `coast`      | `#BFD4E4`            | oui           | —       |
  | `beach`      | `#EDE0BE`            | oui           | —       |
  | `plain`      | `#E8DFC8`            | oui           | herbe   |
  | `meadow`     | `#C8D4A5`            | oui           | herbe   |
  | `forest`     | `#9CB88A`            | oui           | arbres  |
  | `deepForest` | `#7A9568`            | non           | arbres  |
  | `desert`     | `#E8C88A`            | non           | dunes   |
  | `mountain`   | `#A89A8A`            | non           | pics    |

- **Génération** (l.52-103) : bruit valeur en **3 octaves sin/cos**
  (fréquences ×~2, amplitudes 0.5/0.3/0.2) ; masque radial île
  (`dist = √(dx²+dy²) + warp`) ; trois champs — **élévation** (2 octaves),
  **humidité** (bruit décalé +100), **température** (gradient latitude + bruit) ;
  classification par seuils en cascade (océan si `dist>0.85` ou `élév<-0.4`,
  montagne si `élév>0.55`, désert si chaud+sec+est, etc.).
- Hash déterministe `h(x,y,seed) = frac(sin(x·127.1 + y·311.7 + seed·74.3)·43758.5453)`
  pour variantes et décorations.
- **Villes** : 14 placements sur tuiles constructibles, distance Manhattan ≥ 4 ;
  **routes** : arbre couvrant glouton (plus proche voisin) + 3 liens aléatoires.
- ⚠️ **Limite connue de la V2** : la carte n'est **pas seedable** (bruit à
  constantes fixes ⇒ même carte à chaque partie) et `rand`/`pick` utilisent
  `Math.random()`. La Phase 1 du 4X corrige : PRNG seedé, cartes différentes
  par seed (exigence de la roadmap).

## 3. Modèle de simulation **[code réel]**

- **Temps** : 1 tick = 1 mois, 12 ticks/an, 2026→2030, tick de base 1200 ms
  (vitesses ×1/×2/×4).
- **6 métriques globales**, baseline 2026 « réelle » (l.234-241) : population
  8 200 (millions, ONU), PIB 105 T$, bonheur 52/100 (World Happiness Report),
  inégalités 38/100 (Gini), climat 50/100 (50 = trajectoire +2,7 °C), tech 30/100.
- **Drift naturel par tick** (le monde se dégrade sans action) : climat +0.3,
  inégalités +0.1, bonheur −0.05, PIB +0.2, tech +0.4.
- **6 politiques togglables** avec coût en budget (régén. 0.3/tick, plafond 20) :
  Revenu universel, Taxe carbone, Régulation IA, Éducation massive, Défense
  renforcée, Transition verte — chacune = effets continus par tick.
- Population : −2/tick si bonheur < 30, +3 si > 70. Tout est clampé 0-100.

## 4. Événements narratifs 2026→2030 **[code réel]**

9 événements datés (1/an environ, déclenchés au mois 4 de leur année), chacun
**3 choix** avec effets chiffrés sur les métriques (l.157-221) :

| Année | id            | Titre                          | Tension                                  |
| ----- | ------------- | ------------------------------ | ---------------------------------------- |
| 2026  | `ai_job`      | Choc IA générative             | taxer l'IA / laisser-faire / reconversion |
| 2026  | `climate_cop` | COP31 à Belém                  | signer-investir / signer sans appliquer / refuser |
| 2027  | `water`       | Crise hydrique Sud-Europe      | dessalement / rationnement / migration   |
| 2027  | `bric`        | Monnaie BRICS+ lancée          | rejoindre / bloc atlantique / neutralité |
| 2028  | `agi`         | Annonce AGI                    | régulation / course ouverte / moratoire  |
| 2028  | `election`    | Cycles électoraux majeurs      | centre / populisme / technocratie        |
| 2029  | `pandemic`    | Alerte pandémique H5N1         | confinement / ciblé / minimiser          |
| 2029  | `fusion`      | Percée fusion nucléaire        | investir massif / partenariat / attendre |
| 2030  | `final`       | Bilan décennal                 | reconstruction / statu quo / fuite tech  |

Style : titre court, description factuelle 1-2 phrases « presse », choix avec
effets affichés en clair (`gdp +5 · ineq +10 · hap -6`). L'événement **met le
jeu en pause** et force la décision. À réinjecter en Phase 6 (format
data-driven, déclencheurs date OU état, IA aussi concernées).

## 5. Fins **[code réel]**

3 verdicts au passage de 2030 (l.324-330) :

- **`utopia`** « Utopie raisonnée » : bonheur > 65 **et** inégalités < 35 **et** climat < 55.
- **`collapse`** « Effondrement partiel » : bonheur < 35 **ou** climat > 80.
- **`stasis`** « Monde en équilibre fragile » : tout le reste.

Écran de fin : verdict, texte d'épilogue, 4 stats finales, bouton rejouer.
Dans le 4X : `utopia/stasis` deviennent les victoires graduées (Score 2050),
`collapse` devient la fin d'échec climatique collective (GDD §9).

## 6. Écarts V2 ↔ brief 4X (décisions Phase 0/1)

| Sujet     | V2 réelle                                   | Brief 4X (roadmap)                          | Décision |
| --------- | ------------------------------------------- | ------------------------------------------- | -------- |
| Biomes    | ocean, coast, beach, plain, meadow, forest, deepForest, desert, mountain | océan, côte, plaine, forêt, désert, montagne, **toundra, jungle, rivières** | Phase 1 suit la liste du brief 4X (toundra/jungle/rivières incluses) ; beach/meadow/deepForest deviennent des variantes visuelles, couleurs dérivées de la palette V2 |
| Grille    | carrés 32×20, SVG                           | hex pointy-top ~40×25, Canvas               | Brief 4X |
| Seed      | carte fixe, `Math.random()` resté çà et là  | déterministe par seed                        | Brief 4X (exigence dure) |
| Temps     | 1 tick = 1 mois, temps réel pausable        | 1 tour = 1 trimestre, tour par tour          | Brief 4X |
| Métriques | 6 jauges mondiales agrégées                 | rendements par tuile + Énergie/Influence     | Brief 4X ; l'esprit « jauges lisibles + sparklines » est conservé dans le HUD |

Ce qui est repris **tel quel** de la V2 : design tokens et grammaire visuelle
(§1), squelette de génération élévation/humidité/température (§2), ton et
structure des événements (§4), principe des fins multiples (§5), UI sobre
(barre de métriques, journal, modales).
