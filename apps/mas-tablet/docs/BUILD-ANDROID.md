# Version ANDROID — MAS Tablette (Google Play Store)

Cette page ne concerne **que la version Android**. Pour Windows, voir
[`BUILD-WINDOWS.md`](./BUILD-WINDOWS.md).

La version Android **réutilise exactement le même code React** que la version
Windows (une seule source de vérité). Seule la configuration de packaging
diffère : elle est isolée dans **`src-tauri/tauri.android.conf.json`**, fusionnée
automatiquement par Tauri et **sans aucun effet sur la version Windows**.

> ⚠️ Le build Android natif **ne peut pas être réalisé dans l'environnement
> cloud** (pas de SDK/NDK Android). Suivez ces étapes **sur votre machine**
> (Windows, macOS ou Linux) avec Android Studio.

---

## 1. Prérequis (à installer une seule fois)

1. **Android Studio** (inclut le SDK Android) — <https://developer.android.com/studio>
2. Dans Android Studio → *SDK Manager* :
   - **Android SDK Platform 34** (ou plus récent)
   - **NDK (Side by side)**
   - **Android SDK Command-line Tools**
3. **Rust** (<https://rustup.rs>) puis les cibles Android :
   ```bash
   rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
   ```
4. **JDK 17+** (fourni avec Android Studio).
5. **Variables d'environnement** (adapter les chemins) :
   ```bash
   # Linux / macOS (~/.bashrc, ~/.zshrc)
   export ANDROID_HOME="$HOME/Android/Sdk"
   export NDK_HOME="$ANDROID_HOME/ndk/$(ls $ANDROID_HOME/ndk | tail -1)"
   ```
   ```powershell
   # Windows (PowerShell, à mettre dans les variables système)
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   setx NDK_HOME "$env:LOCALAPPDATA\Android\Sdk\ndk\<version>"
   ```

---

## 2. Initialiser le projet Android (une seule fois)

```bash
cd apps/mas-tablet
npm install
npm run android:init
```

Cela génère le projet Gradle dans **`src-tauri/gen/android/`**
(ce dossier est volontairement ignoré par git — c'est du généré).

L'identifiant de l'application est **`com.mastablette.app`**
(défini dans `src-tauri/tauri.conf.json` → `identifier`).
👉 Choisissez-le **définitivement avant le premier envoi au Play Store** :
il ne pourra plus jamais être modifié ensuite.

---

## 3. Personnaliser (orientation, nom, icône)

### Icône
Générez toutes les icônes (Windows + Android) depuis un PNG carré ≥ 1024 px :
```bash
npm run tauri -- icon chemin/vers/icone.png
```

### Nom affiché sous l'icône
`src-tauri/gen/android/app/src/main/res/values/strings.xml` :
```xml
<string name="app_name">MAS Tablette</string>
```

### Orientation
L'UI est **responsive (portrait + paysage)**. Pour autoriser les deux en
respectant le verrou de rotation de l'utilisateur, dans
`src-tauri/gen/android/app/src/main/AndroidManifest.xml`, sur la balise
`<activity …>` :
```xml
android:screenOrientation="fullUser"
```
Pour **forcer le paysage** (usage tablette fixe MAS) : `"sensorLandscape"`.

### Aucune permission réseau
L'app est 100 % hors-ligne. Vous pouvez retirer la permission Internet du
manifeste si vous n'utilisez pas la voix IA en ligne (HuggingFace/OpenAI).
La voix naturelle pré-enregistrée (dossier `audio/`) est **embarquée
automatiquement** dans l'APK/AAB — rien à configurer.

---

## 4. Tester sur un appareil / émulateur

Branchez un téléphone (débogage USB activé) ou lancez un émulateur, puis :
```bash
npm run android:dev
```

---

## 5. Générer le paquet pour le Play Store (AAB)

```bash
npm run android:build          # → .aab (format Play Store) + .apk
# ou seulement l'APK (test/sideload) :
npm run android:build:apk
```

Sorties dans :
```
src-tauri/gen/android/app/build/outputs/
├── bundle/release/app-release.aab     ← à envoyer au Play Store
└── apk/release/app-release.apk        ← pour installer à la main (test)
```

---

## 6. Signer l'application (obligatoire pour le Play Store)

1. Créer une clé (une seule fois, **à conserver précieusement**) :
   ```bash
   keytool -genkey -v -keystore mas-tablette.keystore \
     -alias mas -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Créer `src-tauri/gen/android/key.properties` :
   ```properties
   storeFile=/chemin/absolu/mas-tablette.keystore
   storePassword=VOTRE_MOT_DE_PASSE
   keyAlias=mas
   keyPassword=VOTRE_MOT_DE_PASSE
   ```
3. Vérifier que `app/build.gradle.kts` lit bien ce fichier pour la config
   `signingConfigs.release` (Tauri 2 génère le code de lecture ; sinon suivre
   <https://v2.tauri.app/distribute/google-play/>).

> 🔐 Sauvegardez le keystore **hors du dépôt** (ne jamais committer). Sans lui,
> impossible de publier une mise à jour de l'app.

---

## 7. Publier sur le Play Store

1. Compte **Google Play Console** : 25 $ une fois — <https://play.google.com/console>
2. *Créer une application* → langue, nom « MAS Tablette ».
3. Téléverser le **`app-release.aab`** (piste *Test interne* d'abord).
4. Remplir la fiche : description, captures d'écran (≥ 2), icône 512×512,
   bannière 1024×500, **politique de confidentialité** (URL obligatoire),
   classification du contenu, public cible.
5. Renseigner *Sécurité des données* : déclarer « aucune donnée collectée »
   (l'app est hors-ligne ; les photos restent locales à l'appareil).
6. Soumettre pour examen.

---

## Récapitulatif des commandes Android

| Commande | Résultat |
|---|---|
| `npm run android:init` | Génère le projet Android (une fois) |
| `npm run android:dev` | Teste sur appareil / émulateur |
| `npm run android:build` | Produit l'`.aab` (Play Store) + `.apk` |
| `npm run android:build:apk` | Produit seulement l'`.apk` (test) |

## Séparation Windows / Android — comment ça marche

| Fichier | Rôle | Impacte… |
|---|---|---|
| `src-tauri/tauri.conf.json` | Config **commune** (nom, version, identifiant, icône) | les deux |
| `src-tauri/tauri.windows.conf.json` | Fenêtre bureau + cibles `.msi`/`.exe` | **Windows seul** |
| `src-tauri/tauri.android.conf.json` | Cibles `.aab`/`.apk` | **Android seul** |
| `src/` (React) | Interface **partagée**, responsive | les deux |

Tauri fusionne automatiquement le bon fichier de plateforme : un build Windows
n'embarque jamais la config Android, et inversement.
