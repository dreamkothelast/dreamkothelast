// -*- generation des voix via ElevenLabs -*-
//
// Pré-génère TOUS les clips audio des comptines + histoires en voix
// ElevenLabs (qualité naturelle), puis les écrit dans public/audio/<hash>.mp3.
// Le nom de fichier = hash FNV-32 du texte EXACT (identique au calcul JS dans
// useOnlineTTS.ts) → l'app retrouve ./audio/<hash>.mp3 sans manifeste, et joue
// ces clips 100 % HORS-LIGNE (rien à reconfigurer côté app).
//
// Usage :
//   export ELEVENLABS_API_KEY=sk_xxx
//   # (optionnel) voix distinctes histoires / comptines :
//   export ELEVENLABS_VOICE_ID=XB0fDUnXU5powFXDhCwa            # défaut global
//   export ELEVENLABS_VOICE_ID_HISTOIRES=...                   # voix conteur
//   export ELEVENLABS_VOICE_ID_COMPTINES=...                   # voix chantante
//   node scripts/generate_voices_elevenlabs.mjs               # tout
//   node scripts/generate_voices_elevenlabs.mjs histoires     # seulement histoires
//   node scripts/generate_voices_elevenlabs.mjs comptines     # seulement comptines
//
// Nécessite Node 18+ (fetch natif). Aucune dépendance npm.

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CONTENT = join(ROOT, "src", "data", "voiceContent.json");
const OUTDIR = join(ROOT, "public", "audio");

// ── Clé + voix ──────────────────────────────────────────────────────────────
const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("✗ ELEVENLABS_API_KEY manquante. export ELEVENLABS_API_KEY=sk_...");
  process.exit(1);
}
// Voix par défaut (présentes dans la bibliothèque standard ElevenLabs) :
//   • Histoires → « Sarah » (mature, rassurante, posée) — narration douce
//   • Comptines → « Laura » (enthousiaste, vivante) — rythme chanté
// Toutes surchargeables par variables d'environnement.
const VOICE_HISTOIRES_DEFAULT = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const VOICE_COMPTINES_DEFAULT = "FGY2WhTYpPnrIDTdsKH5"; // Laura
const VOICE_DEFAULT   = process.env.ELEVENLABS_VOICE_ID || VOICE_HISTOIRES_DEFAULT;
const VOICE_HISTOIRES = process.env.ELEVENLABS_VOICE_ID_HISTOIRES || process.env.ELEVENLABS_VOICE_ID || VOICE_HISTOIRES_DEFAULT;
const VOICE_COMPTINES = process.env.ELEVENLABS_VOICE_ID_COMPTINES || process.env.ELEVENLABS_VOICE_ID || VOICE_COMPTINES_DEFAULT;
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

// ── Hash FNV-32 — identique au JS (itère sur les unités UTF-16) ──────────────
function fnv32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// Retire les emojis / symboles non parlés (le hash garde le texte ORIGINAL).
function spoken(text) {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Appel ElevenLabs TTS → Buffer MP3 ───────────────────────────────────────
async function synth(text, voiceId) {
  const spk = spoken(text);
  if (!spk) return null;
  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}` +
    `?output_format=mp3_44100_128`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: spk,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,         // voix posée et régulière (lecture pour public fragile)
        similarity_boost: 0.8,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} — ${detail.slice(0, 200)}`);
  }
  return Buffer.from(await resp.arrayBuffer());
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Programme principal ─────────────────────────────────────────────────────
async function main() {
  const only = (process.argv[2] || "").toLowerCase(); // "", "histoires", "comptines"
  await mkdir(OUTDIR, { recursive: true });
  const data = JSON.parse(await readFile(CONTENT, "utf8"));

  // (texte, voix) à générer ; dédoublonné par texte exact
  const jobs = [];
  const seen = new Set();
  const push = (text, voiceId) => {
    if (!seen.has(text)) { seen.add(text); jobs.push({ text, voiceId }); }
  };
  if (only !== "histoires") {
    for (const c of data.comptines) for (const l of c.lines) push(l, VOICE_COMPTINES);
  }
  if (only !== "comptines") {
    for (const h of data.histoires) for (const p of h.pages) push(p.text, VOICE_HISTOIRES);
  }

  console.log(
    `${jobs.length} clips uniques à générer (ElevenLabs ${MODEL_ID}) → ${OUTDIR}`
  );

  let ok = 0;
  for (let i = 0; i < jobs.length; i++) {
    const { text, voiceId } = jobs[i];
    const out = join(OUTDIR, fnv32(text) + ".mp3");
    try {
      const buf = await synth(text, voiceId);
      if (buf) { await writeFile(out, buf); ok++; }
    } catch (e) {
      console.warn(`  ✗ "${text.slice(0, 40)}…" : ${e.message}`);
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${jobs.length}…`);
    await sleep(350); // respecte les limites de débit ElevenLabs
  }
  console.log(`OK : ${ok}/${jobs.length} clips générés dans public/audio/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
