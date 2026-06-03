// Capture des écrans clés aux dimensions téléphone & tablette.
// Sert le dossier dist/ puis pilote Chromium (Playwright).
import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const OUT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "screenshots");
const PORT = 4317;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".mp3": "audio/mpeg", ".woff2": "font/woff2",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT) || !existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    const buf = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
    res.end(buf);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
});

const DEVICES = [
  { name: "phone-portrait", width: 390, height: 844 },   // ~iPhone/Pixel portrait
  { name: "phone-landscape", width: 844, height: 390 },
  { name: "tablet", width: 1280, height: 800 },          // tablette paysage
];

// Actions pour atteindre chaque écran (clic sur une tuile par texte).
const SCREENS = [
  { id: "accueil", go: async () => {} },
  { id: "comptines", go: (pg) => pg.getByRole("button", { name: /Comptines/i }).first().click() },
  { id: "histoires", go: (pg) => pg.getByRole("button", { name: /Histoires/i }).first().click() },
  { id: "memory", go: (pg) => pg.getByRole("button", { name: /Paires/i }).first().click() },
  { id: "musical", go: (pg) => pg.getByRole("button", { name: /Musical/i }).first().click() },
  { id: "scenes", go: (pg) => pg.getByRole("button", { name: /Sc.nes/i }).first().click() },
  { id: "photos", go: (pg) => pg.getByRole("button", { name: /Photos/i }).first().click() },
];

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch();

for (const dev of DEVICES) {
  for (const scr of SCREENS) {
    const ctx = await browser.newContext({
      viewport: { width: dev.width, height: dev.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    try {
      await scr.go(page);
      await page.waitForTimeout(700);
    } catch (e) {
      console.warn(`  (skip ${scr.id} @ ${dev.name}: ${e.message.split("\n")[0]})`);
    }
    const path = join(OUT, `${dev.name}-${scr.id}.png`);
    await page.screenshot({ path });
    console.log("✓", `${dev.name}-${scr.id}.png`);
    await ctx.close();
  }
}

await browser.close();
server.close();
console.log("Terminé →", OUT);
