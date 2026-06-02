# Génération des voix (hors-ligne, gratuite)

Les comptines et histoires sont racontées par une **vraie voix française
naturelle**, pré-enregistrée avec [Piper](https://github.com/rhasspy/piper)
(moteur TTS neural open-source, gratuit). Les clips MP3 vivent dans
`public/audio/` et sont embarqués dans le paquet → **100 % hors-ligne, aucune
voix robotique, aucun coût**.

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

## Autres voix Piper FR disponibles

- `fr_FR-siwis-medium` — femme, claire et douce (par défaut)
- `fr_FR-upmc-medium`  — femme, plus posée
- `fr_FR-tom-medium`   — homme
- `fr_FR-gilles-low`   — homme, léger

Changez le modèle via `PIPER_MODEL=/chemin/voix.onnx python3 scripts/generate_voices.py`.
