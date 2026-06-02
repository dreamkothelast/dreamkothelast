# MAS Tablette 🫧

Suite de mini-jeux éducatifs et sensoriels pour adultes en situation de handicap (MAS).  
Application **100 % hors-ligne** — aucun appel réseau, jamais.

---

## Prérequis (développement)

| Outil | Version recommandée |
|-------|----------------------|
| Node.js | 18 + |
| npm | 9 + (ou pnpm / yarn) |
| Rust | 1.77 + (`rustup update stable`) |
| WebView2 Runtime | pré-installé sur Windows 11, voir ci-dessous |

### WebView2 Runtime (Windows)

Tauri utilise Edge WebView2 pour afficher l'interface.  
Il est **pré-installé sur Windows 10 (depuis avril 2021) et Windows 11**.  
Sur un poste sans WebView2 : télécharger le runtime autonome sur  
https://developer.microsoft.com/fr-fr/microsoft-edge/webview2/#download-section  
→ choisir « Evergreen Bootstrapper » ou « Standalone Installer (x64) ».  
**Le .msi que vous produirez peut embarquer WebView2 — voir Build .msi ci-dessous.**

---

## Installation (une seule fois)

```bash
# Dans le dossier apps/mas-tablet/
npm install
```

---

## Lancement en développement

### Option A — Tauri natif (recommandé)

```bash
npm run tauri dev
```

Lance Vite + WebView2 dans une vraie fenêtre Windows (1920×1080, `resizable: false`).

### Option B — Navigateur (itération rapide, sans Rust)

```bash
npm run dev
# Ouvrir http://localhost:5173 dans Microsoft Edge
```

**Simulation tablette dans Edge :**
1. F12 pour ouvrir les DevTools
2. Ctrl+Shift+M → Barre d'appareil (Device Emulation)
3. Résolution custom : **1920 × 1080** (ou la vraie résolution de votre tablette)
4. ✅ Cocher **"Émuler la saisie tactile"** dans les options
5. Cliquer **Actualiser** (F5)

---

## Build .msi / .exe (Windows)

```bash
npm run tauri build
```

Le bundle se trouve dans :  
`src-tauri/target/release/bundle/msi/MAS Tablette_0.1.0_x64_en-US.msi`

### Embarquer WebView2 dans l'installeur

Dans `src-tauri/tauri.conf.json`, ajouter sous `bundle.windows` :

```json
{
  "bundle": {
    "windows": {
      "webviewInstallMode": {
        "type": "embedBootstrapper"
      }
    }
  }
}
```

Cela augmente la taille du .msi mais supprime la dépendance à l'internet lors de l'installation.

---

## Polices self-hosted (requis pour la police Fredoka)

L'application fonctionne sans les fichiers de police (fallback système).  
Pour l'expérience optimale, ajouter Fredoka :

1. Télécharger la police : https://fonts.google.com/specimen/Fredoka  
   → Cliquer "Download family" → extraire les `.ttf`
2. Convertir en WOFF2 : https://www.fontsquirrel.com/tools/webfont-generator
3. Placer dans **`public/assets/fonts/`** :
   - `Fredoka-Regular.woff2`
   - `Fredoka-SemiBold.woff2`
   - `Fredoka-Bold.woff2`

---

## Structure du projet

```
apps/mas-tablet/
├── public/
│   └── assets/fonts/          ← polices WOFF2 (à fournir, voir ci-dessus)
├── src/
│   ├── main.tsx               ← point d'entrée React
│   ├── App.tsx                ← machine d'état (navigation)
│   ├── registry.ts            ← registre central des activités
│   ├── types.ts               ← types partagés
│   ├── hooks/
│   │   ├── useAudio.ts        ← Web Audio API (sons générés, 100 % offline)
│   │   ├── useSettings.ts     ← réglages persistés en localStorage
│   │   └── useSessionTimer.ts ← minuteur de session
│   ├── components/
│   │   ├── BigButton.tsx      ← bouton accessible (min 80×80 px)
│   │   ├── BigTile.tsx        ← tuile de l'écran d'accueil
│   │   ├── CelebrationScreen.tsx  ← confettis + mascotte (renforcement positif)
│   │   ├── CompanionPanel.tsx ← panneau réglages accompagnant
│   │   ├── GameShell.tsx      ← wrapper activité (Accueil + minuteur)
│   │   ├── HomeButton.tsx     ← bouton Accueil toujours visible
│   │   ├── Mascot.tsx         ← mascotte SVG placeholder
│   │   └── SessionTimer.tsx   ← affichage discret du minuteur
│   ├── screens/
│   │   └── HomeScreen.tsx     ← écran d'accueil avec tuiles
│   └── activities/
│       └── sensory/           ← Bulles Magiques (cause à effet)
│           ├── index.ts
│           └── SensoryActivity.tsx
└── src-tauri/
    ├── tauri.conf.json        ← config fenêtre tablette 1920×1080
    ├── Cargo.toml
    └── src/
        ├── main.rs
        └── lib.rs
```

---

## Ajouter une activité (Phase 2+)

1. Créer `src/activities/mon-jeu/MonJeuActivity.tsx`  
   → Exporter un composant qui implémente `ActivityProps` (voir `src/types.ts`)

2. Créer `src/activities/mon-jeu/index.ts` :
   ```ts
   import type { ActivityDefinition } from "../../types";
   import { MonJeuActivity } from "./MonJeuActivity";

   export const monJeuActivity: ActivityDefinition = {
     id: "mon-jeu",
     title: "Mon Jeu",
     icon: "🎮",
     colors: { primary: "#FFD23F", secondary: "#4A3B2F" },
     component: MonJeuActivity,
     sounds: [],
   };
   ```

3. Dans `src/registry.ts`, importer et ajouter à `ACTIVITIES` :
   ```ts
   import { monJeuActivity } from "./activities/mon-jeu";
   export const ACTIVITIES = [sensoryActivity, monJeuActivity];
   ```

→ L'écran d'accueil affiche la nouvelle tuile automatiquement. ✅

---

## Assets à fournir

### Images (`public/assets/images/` — CC0 recommandé)

| Chemin | Format | Usage |
|--------|--------|-------|
| `mascotte.svg` | SVG | Remplacer le placeholder dans `Mascot.tsx` |
| `animaux/*.svg` | SVG 512 px | Memory, Jeu d'écoute (Phase 2/4) |
| `instruments/*.svg` | SVG 512 px | Memory, Jeu d'écoute (Phase 3/4) |
| `objets/*.svg` | SVG 512 px | Memory, Jeu d'écoute (Phase 4) |
| `nourriture/*.svg` | SVG 512 px | Memory, Jeu d'écoute (Phase 4) |

Sources : **Kenney.nl** (CC0), **OpenMoji** (CC-BY), **SVGRepo** (CC0).

### Sons (`public/assets/sounds/` — CC0 requis)

| Chemin | Usage |
|--------|-------|
| `ui/click.mp3` | Son de bouton |
| `ui/celebration.mp3` | Fanfare fin de jeu |
| `animaux/chat.mp3` … | Jeu d'écoute Phase 4 |
| `instruments/piano.mp3` … | Jeu musical Phase 3 |

Sources : **Freesound.org** (CC0), **Kenney.nl Audio** (CC0).  
**Phase 1 (Bulles Magiques) : aucun fichier son requis**, sons générés via Web Audio API.

---

## Panneau accompagnant

Accessible depuis n'importe quel écran :
- **Tactile** : maintenir appuyé 1,5 s sur le **coin bas-droit** de l'écran
- **Clavier** : **Shift + F10**

Permet de régler : minuteur de session, niveau de difficulté, volume, intensité visuelle, thème d'images.  
Les réglages sont persistés en `localStorage`.

---

## Accès par contacteur (switch)

Tout élément interactif est activable au **clavier** (Espace et Entrée), car les contacteurs émulent ces touches.  
Le focus est très marqué (cadre jaune épais).  
Architecture prête pour un futur mode balayage automatique (Phase 6) :  
chaque écran expose une liste ordonnée d'éléments focusables via `tabIndex`.

---

## Feuille de route

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Squelette + Accueil + Sensoriel (bulles) + Panneau accompagnant + Minuteur | ✅ |
| 2 | Memory (paires d'images) | 🔜 |
| 3 | Jeu Musical (Simon coloré) | 🔜 |
| 4 | Jeu d'Écoute | 🔜 |
| 5 | Polish accessibilité + Build .msi | 🔜 |
| 6 | Mode balayage/scanning contacteur | 🗓 roadmap |
