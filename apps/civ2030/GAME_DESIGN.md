# Civilization 2030 — Game Design Document

> Phase 0 — version 1.0. Ce document est normatif : les phases 1→6 l'implémentent.
> Toute déviation en cours de route doit être reportée ici dans le même commit.

## 1. Vision

**Civilization 2030 est un 4X tour par tour sur la période 2026→2050**, où l'on
dirige une nation contemporaine à travers les vraies bifurcations du siècle :
course à l'IA, transition énergétique, climat, spatial. Ce n'est **pas** un clone
de Civ qui commence à l'âge de pierre : la partie démarre dans *notre* monde, au
T1 2026, et se joue en 100 tours (1 tour = 1 trimestre) jusqu'au T4 2050.

L'ADN de World Sim 2030 est conservé : direction artistique Mini Motorways
(palette crème `#F5F1E8`, géométrie épurée), monde généré par bruit
multi-fréquences en 9 biomes, événements géopolitiques crédibles à choix et
conséquences, fins multiples. Ce qui change : le joueur n'observe plus un monde,
il **pilote une nation** contre des IA adverses, sur une carte hexagonale, avec
villes, unités, tech tree et conditions de victoire.

**Fantasme joueur** : « je suis la France / la Corée / le Brésil de 2026, et en
25 ans je dois faire les bons paris technologiques et géopolitiques avant les
autres. »

### Note de cohérence (décision Phase 0)

Le brief initial dit « Score au tour 120 (année 2050) ». À 4 tours/an depuis
2026, le tour 120 tombe en 2055. **Décision : la fin de partie est au tour 100
(T4 2050).** La règle « 1 tour = 1 trimestre, départ T1 2026 » prime, car c'est
elle qui ancre les événements datés. 100 tours est aussi une meilleure durée de
partie (~4-6 h).

## 2. Piliers de design

1. **Le monde de demain, pas un monde de fantasy.** Chaque tech, bâtiment,
   ressource ou événement doit être plausible en 2026-2050 et reconnaissable par
   quelqu'un qui lit la presse. Critère de rejet : « est-ce qu'un article du
   Monde pourrait en parler en 2035 ? »
2. **Lisible comme Mini Motorways.** Un écran = une décision compréhensible en
   5 secondes. On préfère couper une mécanique plutôt que d'ajouter un tableau
   illisible. La DA n'est pas un skin, c'est une contrainte de design.
3. **Des dilemmes, pas des optimisations.** Les événements et le tech tree
   forcent des choix exclusifs (croissance sale vs transition propre, IA rapide
   vs IA sûre). Il ne doit jamais exister de « meilleur choix » universel.
4. **Symétrie des règles.** Les IA adverses jouent exactement avec les règles du
   joueur — zéro triche de ressources. La difficulté module leurs pondérations
   et bonus *déclarés*, pas leurs règles.
5. **Déterminisme et testabilité.** Même seed ⇒ même partie à actions égales.
   Tout le gameplay est simulable headless ; c'est ce qui rend les phases 5 et 6
   livrables.

## 3. Boucle de jeu (tour par tour)

Un tour = un trimestre. Boucle joueur :

1. **Notifications** : événements déclenchés, constructions/recherches achevées,
   premiers contacts, menaces (file de notifications en haut, à la Civ VI).
2. **Décisions stratégiques** (si dues) : choix d'événement narratif, nouvelle
   recherche, diplomatie.
3. **Gestion** : files de production des villes, achats, affectations.
4. **Unités** : déplacements, ordres multi-tours, combats, fondations de villes.
5. **Fin de tour** : `endTurn()` — résolution dans cet ordre fixe :
   rendements → croissance/production → science → événements → IA adverses
   (chacune joue sa boucle complète) → diplomatie/traités → vérification des
   conditions de victoire/défaite → tour suivant.

**Arc de partie** (100 tours) :
- **2026-2030 (tours 1-20), « Positionnement »** : exploration, 2-4 villes,
  premiers paris techs, premiers contacts.
- **2030-2040 (tours 21-60), « Accélération »** : moteur économique, courses
  technologiques (fusion ? AGI ?), guerres limitées, blocs diplomatiques.
- **2040-2050 (tours 61-100), « Dénouement »** : projets finaux, victoires en
  vue pour 2-3 civilisations, événements climatiques systémiques qui forcent la
  fin de partie à rester tendue.

## 4. Système 1 — Carte hexagonale

- Grille **pointy-top, coordonnées axiales** (`q, r`), ~**40×25** tuiles,
  générée par seed (déterministe), continents connexes.
- **9 biomes** : océan, côte, plaine, forêt, désert, montagne, toundra, jungle
  + rivières en arêtes/tuiles — génération par bruit multi-fréquences
  élévation × humidité × température héritée de la V2. Note : les 9 biomes de
  la V2 réelle diffèrent légèrement (beach/meadow/deepForest au lieu de
  toundra/jungle/rivières) ; la liste 4X ci-dessus prime, et beach/meadow/
  deepForest deviennent des variantes visuelles (décision documentée :
  `legacy/WORLDSIM_V2_SPEC.md` §6).
- **Ressources stratégiques modernes** posées à la génération : **lithium**
  (batteries → unités drones, stockage), **uranium** (nucléaire), **pétrole**
  (économie sale mais immédiate), **terres rares** (compute, 6G), **terres
  agricoles** (Alimentation). Règles de placement par biome (ex. lithium :
  désert/montagne ; terres agricoles : plaine).
- Chaque tuile a des **rendements** (voir §5) modulés par biome, ressource,
  aménagement et rivière.

## 5. Système 2 — Villes & économie

- **Fondation** par l'unité Colon ; une ville exploite un rayon de **2 hex**
  (zone d'influence visible).
- **4 rendements de tuile** : 🌾 **Alimentation** (croissance), ⚙️ **Production**
  (construction), 💰 **Capital** (achats, entretien), 🔬 **Science** (recherche).
- **2 ressources nationales globales** : ⚡ **Énergie** (consommée par les
  bâtiments avancés ; se produit propre ou sale — le sale alimente le risque
  climatique global, voir §9) et 🕊️ **Influence** (monnaie diplomatique et
  culturelle, alimente la victoire Influence).
- **Croissance** : stock d'Alimentation → seuils croissants → +1 population ;
  chaque pop travaille une tuile de la zone.
- **File de production** par ville ; 8-10 **bâtiments 2026+** au départ :
  ferme verticale, centrale solaire, data center, université, hôpital, port,
  usine, réseau 6G, parc éolien offshore, centrale à gaz (le choix sale).
- L'économie est volontairement resserrée (4 rendements + 2 globales, pas plus)
  — pilier 2.

## 6. Système 3 — Unités & combat

- **5 unités de base** : Colon (fonde), Ouvrier (aménagements : ferme, mine,
  route), Infanterie, Drone de combat, unité Navale. Le tech tree en débloque
  d'autres (drones autonomes, cyber-unités, défense orbitale).
- **Mouvement** : points de mouvement, coûts par biome, embarquement côtier
  simple ; **pathfinding A*** hexagonal, ordres persistants multi-tours.
- **Combat** : attaque/défense, PV, bonus défensifs de terrain (montagne,
  forêt, rivière traversée), expérience et 2-3 promotions. Une ville a des PV ;
  à zéro, elle est **capturée**.
- **Brouillard de guerre** à 3 états par civilisation : inexploré / exploré
  (mémoire grisée) / visible.
- Le militaire reste volontairement compact : la profondeur vient du *quand*
  (fenêtres d'agression ouvertes par les techs), pas du nombre d'unités.

## 7. Système 4 — Tech tree 2026→2050 (cœur de l'identité)

- ~**40 technologies**, **5 ères** (2026, 2030, 2035, 2040, 2050), **4
  branches** : **IA & Compute**, **Énergie & Climat**, **Biotech & Santé**,
  **Spatial & Défense**. Exemples du grain visé : LLM souverains, fusion,
  géo-ingénierie, interfaces neuronales, mining d'astéroïdes.
- Une recherche active, Science cumulée par tour, changement sans perte.
- Chaque tech débloque concrètement : bâtiments, unités, aménagements, bonus
  passifs — et certaines **ouvrent des événements** (§9) : rechercher
  l'AGI *cause* l'événement « rupture IA ».
- Les **projets finaux** des branches portent deux victoires : **AGI alignée**
  (IA & Compute) ou **programme spatial habité** (Spatial) → victoire Science.
- Données dans `/src/data/techs.ts`, graphe acyclique, intégrité testée.

## 8. Système 5 — IA adverses & diplomatie

- **3-5 civilisations IA**, mêmes règles que le joueur (pilier 4).
- Architecture : **évaluation de l'état → arbitrage de priorités (explorer /
  s'étendre / développer / militariser) → file d'actions** ; 4 **archétypes
  data-driven** (expansionniste, scientifique, militariste, diplomate) qui ne
  diffèrent que par leurs pondérations (`/src/data/personalities.ts`).
- **Diplomatie minimale** : premier contact, guerre/paix, pacte de
  non-agression, échange de ressources ; écran dédié.
- Les nations sont **contemporaines mais semi-fictionnalisées** (« Union
  Atlantique », « Dragon de l'Est »...) : lisibles géopolitiquement sans
  prétendre simuler des pays réels nommés — ça évite le malaise et garde la
  liberté de design. Décision révisable ici même si tu préfères des pays réels.
- Test de référence : **simulation headless 100 tours IA vs IA** sans crash,
  métriques par civ (villes, pop, techs, guerres).

## 9. Système 6 — Événements narratifs (ADN World Sim) & risque climatique

C'est le greffon god-sim → 4X :

- **9+ événements** (COP, rupture IA, crise énergétique, pandémie, etc. — liste
  en `legacy/WORLDSIM_V2_SPEC.md` §3), déclenchés **par date** (COP fin
  d'année) ou **par état du monde** (crise énergétique si l'Énergie globale
  plonge), avec **choix à conséquences mécaniques réelles** (rendements,
  diplomatie, débloquages) — jamais purement cosmétiques.
- Les IA adverses font aussi leurs choix d'événements, selon leur archétype.
- **Risque climatique global** : la production d'Énergie sale de *toutes* les
  civilisations alimente une jauge planétaire commune (visible). Des paliers
  déclenchent des événements négatifs mondiaux ; le palier ultime est une **fin
  d'échec collective** (effondrement) héritée des fins de la V2. C'est le
  dilemme central du jeu : le sale est plus rapide, mais tout le monde partage
  l'atmosphère.

## 10. Système 7 — Conditions de victoire & fins

| Victoire       | Condition                                                        |
| -------------- | ---------------------------------------------------------------- |
| **Domination** | Contrôler toutes les capitales d'origine                         |
| **Science**    | Achever un projet final (AGI alignée **ou** programme spatial)   |
| **Influence**  | Seuil d'Influence cumulée + accords majeurs avec chaque civ      |
| **Score 2050** | Au tour 100 (T4 2050), meilleur score composite (villes, pop, techs, Influence, état climatique) |

Plus les **fins héritées World Sim** : effondrement climatique collectif (tout
le monde perd, §9) et défaite par élimination (perte de toutes ses villes).
Écran de fin avec statistiques et graphiques d'évolution.

## 11. Hors périmètre (v1)

Multijoueur, espionnage, religion/culture à la Civ, commerce par routes
physiques, génération de carte « vraie Terre », mods. À reconsidérer après la
Phase 6 seulement.

## 12. Roadmap

Détaillée dans `CLAUDE.md`. Rappel : 1 phase = 1 session = 1 commit ; phases 2
et 3 strictement séquentielles (système d'unités partagé).
