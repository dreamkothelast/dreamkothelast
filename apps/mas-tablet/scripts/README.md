# Génération des voix (hors-ligne, gratuite)

Les comptines et histoires sont racontées par une **vraie voix française
naturelle**, pré-enregistrée et embarquée dans `public/audio/` → **100 %
hors-ligne, aucune voix robotique**. Deux générateurs au choix :

- **ElevenLabs** (recommandé, le plus naturel) — voir la section ⭐ ci-dessous ;
- **Piper** (open-source, gratuit) — voir plus bas.

Dans les deux cas, les clips remplacent les mêmes fichiers (hachage FNV-32) et
sont lus hors-ligne sans aucune clé ni connexion à l'usage.

## Source unique du contenu

`src/data/voiceContent.json` est la **seule** source de vérité pour les
paroles et histoires. Elle est :
- importée par `ComptinesActivity.tsx` et `HistoiresActivity.tsx`
- lue par le générateur de voix

Pour modifier les textes : éditez `scripts/build_content.py` puis relancez :

```bash
python3 scripts/build_content.py      # régénère voiceContent.json
```

## Régénérer les voix

```bash
pip install piper-tts
sudo apt-get install -y ffmpeg

# Télécharger une voix française (femme, douce)
mkdir -p /tmp/piper-voices && cd /tmp/piper-voices
BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium"
curl -L -o fr_FR-siwis-medium.onnx       "$BASE/fr_FR-siwis-medium.onnx"
curl -L -o fr_FR-siwis-medium.onnx.json  "$BASE/fr_FR-siwis-medium.onnx.json"

# Générer tous les clips dans public/audio/
cd <repo>/apps/mas-tablet
python3 scripts/generate_voices.py
```

Chaque clip est nommé par le hash **FNV-32** du texte exact (identique au
calcul JS dans `useOnlineTTS.ts`), pour que l'app retrouve `./audio/<hash>.mp3`
sans fichier manifeste.

## ⭐ Voix ElevenLabs (qualité naturelle recommandée)

Pour des voix nettement plus naturelles (idéal pour les histoires et comptines
destinées à un public fragile), régénérez les clips avec **ElevenLabs**. Le
résultat remplace directement les MP3 dans `public/audio/` (même hachage
FNV-32) → **toujours 100 % hors-ligne dans l'app, aucune clé requise à l'usage**.

```bash
# 1. Clé API ElevenLabs (https://elevenlabs.io → Profile → API key)
export ELEVENLABS_API_KEY=sk_xxxxxxxx

# 2. (optionnel) voix distinctes histoires / comptines — ID depuis la
#    bibliothèque de voix ElevenLabs (Voices → Use → copier l'ID).
export ELEVENLABS_VOICE_ID_HISTOIRES=XB0fDUnXU5powFXDhCwa   # voix conteur
export ELEVENLABS_VOICE_ID_COMPTINES=XB0fDUnXU5powFXDhCwa   # voix chantante

# 3. Générer (Node 18+, aucune dépendance npm)
npm run voices:elevenlabs              # comptines + histoires
npm run voices:elevenlabs:histoires    # seulement les histoires
npm run voices:elevenlabs:comptines    # seulement les comptines
```

Réglages par défaut : modèle `eleven_multilingual_v2`, voix « Charlotte »
(FR, douce), `stability 0.5 / similarity 0.8` (lecture posée et régulière).
Surchargez via `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`.

> 💡 Au runtime, l'app accepte aussi une clé ElevenLabs (`sk_…`) dans
> Réglages → Voix IA, comme filet de secours pour tout **nouveau** texte non
> encore pré-généré (mise en cache puis hors-ligne).

## Autres voix Piper FR disponibles

- `fr_FR-siwis-medium` — femme, claire et douce (par défaut)
- `fr_FR-upmc-medium`  — femme, plus posée
- `fr_FR-tom-medium`   — homme
- `fr_FR-gilles-low`   — homme, léger

Changez le modèle via `PIPER_MODEL=/chemin/voix.onnx python3 scripts/generate_voices.py`.
