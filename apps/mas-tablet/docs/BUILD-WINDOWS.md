# Version WINDOWS — MAS Tablette

Cette page ne concerne **que la version Windows** (tablette / PC de la MAS).
Pour Android, voir [`BUILD-ANDROID.md`](./BUILD-ANDROID.md).

Il existe **deux façons** de livrer la version Windows. La première (portable)
est celle utilisée aujourd'hui à la MAS.

---

## 1. Version portable (recommandée pour la MAS) ✅

Un **dossier unique** à double-cliquer, **sans installation**, **100 % hors-ligne**.
C'est ce qui est livré dans `MAS-Tablette-FINALE.zip`.

```bash
cd apps/mas-tablet
npm install
npm run win:portable
```

Produit `dist-portable/` :

```
dist-portable/
├── index.html               ← tout l'applicatif inliné (un seul fichier)
├── audio/                    ← voix naturelle pré-enregistrée (MP3)
├── LANCER-MAS-TABLETTE.bat   ← double-clic → plein écran Edge
└── LIRE-MOI.txt
```

Pour créer le ZIP de distribution :

```bash
cd dist-portable
zip -r ../MAS-Tablette-FINALE.zip index.html audio/ LANCER-MAS-TABLETTE.bat LIRE-MOI.txt
```

> ⚠️ Le dossier `audio/` doit **toujours rester à côté** de `index.html`,
> sinon l'app retombe sur la voix Windows par défaut.

**Installation sur le poste MAS / Smartbox :**
1. Copier tout le dossier dans `C:\MAS-Tablette\`
2. Double-cliquer `LANCER-MAS-TABLETTE.bat`
3. (Grid 3) Cellule → Commande Shell → `C:\MAS-Tablette\LANCER-MAS-TABLETTE.bat`

---

## 2. Installeur natif (.msi / .exe) — optionnel

Application Windows native via Tauri (icône, menu démarrer, désinstalleur).

**Prérequis** : [Rust](https://rustup.rs) + « Microsoft C++ Build Tools » +
WebView2 (présent par défaut sur Windows 10/11).

```bash
cd apps/mas-tablet
npm run win:build
```

Produit (dans `src-tauri/target/release/bundle/`) :
- `msi/MAS Tablette_0.1.0_x64_fr-FR.msi`
- `nsis/MAS Tablette_0.1.0_x64-setup.exe`

La configuration propre à Windows (fenêtre 1920×1080, cibles `msi`/`nsis`) est
dans **`src-tauri/tauri.windows.conf.json`** — fusionné automatiquement par
Tauri et **sans aucun effet sur la version Android**.

---

## Récapitulatif des commandes Windows

| Commande | Résultat |
|---|---|
| `npm run win:portable` | Dossier portable `dist-portable/` (zip à la main) |
| `npm run win:dev` | Lance l'app Tauri en mode développement |
| `npm run win:build` | Installeur `.msi` + `.exe` |
