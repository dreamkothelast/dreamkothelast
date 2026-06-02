# -*- coding: utf-8 -*-
"""Pré-génère tous les clips audio (voix Piper FR naturelle) depuis voiceContent.json.
Nomme chaque fichier par le hash FNV-32 du texte EXACT (identique au calcul JS),
pour que l'app retrouve ./audio/<hash>.mp3 sans manifeste."""
import json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, "..")
CONTENT = os.path.join(ROOT, "src", "data", "voiceContent.json")
OUTDIR = os.path.join(ROOT, "public", "audio")
MODEL = os.environ.get("PIPER_MODEL", "/tmp/piper-voices/fr_FR-siwis-medium.onnx")

def fnv32(s: str) -> str:
    # Mime JS String.charCodeAt : itère sur les unités de code UTF-16
    b = s.encode("utf-16-le")
    h = 0x811c9dc5
    for i in range(0, len(b), 2):
        c = b[i] | (b[i+1] << 8)
        h ^= c
        h = (h * 0x01000193) & 0xffffffff
    return format(h, "08x")

# Retire emojis / symboles non parlés pour la synthèse (le hash garde le texte original)
EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF\U00002B00-\U00002BFF️❤]", flags=re.UNICODE)

def spoken(text: str) -> str:
    t = EMOJI_RE.sub("", text)
    t = t.replace("«", "").replace("»", "")
    return re.sub(r"\s+", " ", t).strip()

def synth(text: str, out_mp3: str):
    spk = spoken(text)
    if not spk:
        return False
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
        wav = tf.name
    p = subprocess.run([sys.executable, "-m", "piper", "-m", MODEL, "-f", wav],
                       input=spk.encode("utf-8"),
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if p.returncode != 0:
        print("  piper err:", p.stderr.decode()[:200]); return False
    # WAV -> MP3 (mono 22.05k, qualité voix, léger)
    subprocess.run(["ffmpeg", "-y", "-i", wav, "-codec:a", "libmp3lame",
                    "-q:a", "5", "-ar", "22050", "-ac", "1", out_mp3],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.unlink(wav)
    return os.path.exists(out_mp3)

def main():
    os.makedirs(OUTDIR, exist_ok=True)
    data = json.load(open(CONTENT, encoding="utf-8"))
    texts = []
    for c in data["comptines"]:
        texts += c["lines"]
    for h in data["histoires"]:
        texts += [p["text"] for p in h["pages"]]
    # dédoublonne (lignes répétées = même hash = un seul fichier)
    seen, uniq = set(), []
    for t in texts:
        if t not in seen:
            seen.add(t); uniq.append(t)
    print(f"{len(texts)} lignes ({len(uniq)} uniques) -> {OUTDIR}")
    ok = 0
    for i, t in enumerate(uniq, 1):
        out = os.path.join(OUTDIR, fnv32(t) + ".mp3")
        if synth(t, out):
            ok += 1
        if i % 10 == 0:
            print(f"  {i}/{len(uniq)}…")
    total = sum(os.path.getsize(os.path.join(OUTDIR, f)) for f in os.listdir(OUTDIR) if f.endswith(".mp3"))
    print(f"OK : {ok}/{len(uniq)} clips, {total//1024} Ko au total")

if __name__ == "__main__":
    main()
