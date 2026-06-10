import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// WORLD SIM 2030 — V2
// DA: Mini Motorways (épuré, crème, géométrique)
// Game Director: refonte complète visuel + gameplay
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS (Mini Motorways palette) ───
const C = {
  bg:        "#F5F1E8",   // fond crème signature
  surface:   "#EFE9DC",   // surface légèrement plus sombre
  ink:       "#2A2A2A",   // texte principal (pas noir pur)
  inkSoft:   "#6B6560",   // texte secondaire
  line:      "#D9D1C0",   // lignes discrètes
  // Accents (5 max, muted)
  sand:      "#E8C88A",   // déserts, zones arides
  sage:      "#9CB88A",   // forêts, nature
  ocean:     "#7FA5C9",   // eau
  terracotta:"#D4876A",   // crises, alertes
  plum:      "#8A6B8E",   // high-tech, IA
  gold:      "#C9A14B",   // prospérité
};

// ─── CONFIG ───
const MAP_W = 32;
const MAP_H = 20;
const TILE = 22;
const TICK_MS = 1200;
const START_YEAR = 2026;
const END_YEAR = 2030;
const TICKS_PER_YEAR = 12; // 12 mois par an

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

// ─── TERRAIN (palette variations pour chaque tuile) ───
const TERRAIN = {
  ocean:   { palette: ["#7FA5C9", "#89AECE", "#96B8D6", "#7299BE"], buildable: false, waves: true },
  coast:   { palette: ["#BFD4E4", "#C9DBE8", "#B5CDDF", "#D0DFEB"], buildable: true  },
  beach:   { palette: ["#EDE0BE", "#E8D8B0", "#F0E4C6", "#E3D2A8"], buildable: true  },
  plain:   { palette: ["#E8DFC8", "#DFD3B5", "#ECE3CD", "#D8CAA8"], buildable: true, grass: true  },
  meadow:  { palette: ["#C8D4A5", "#D0DAB0", "#BDCB98", "#C3D19E"], buildable: true, grass: true  },
  forest:  { palette: ["#9CB88A", "#8FAD7C", "#A6C094", "#85A373"], buildable: true, trees: true  },
  deepForest:{palette: ["#7A9568", "#6E8A5D", "#84A072", "#688457"], buildable: false, trees: true },
  desert:  { palette: ["#E8C88A", "#E0BD7A", "#EDD197", "#D5B06B"], buildable: false, dunes: true },
  mountain:{ palette: ["#A89A8A", "#958779", "#B8AB9C", "#827665"], buildable: false, peaks: true },
};

// Hash déterministe pour variations reproductibles
function h(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

// Bruit pour continents
function noise(x, y, scale = 1) {
  return (
    Math.sin(x * 0.15 * scale) * Math.cos(y * 0.18 * scale) * 0.5 +
    Math.sin(x * 0.37 * scale + 1.3) * Math.cos(y * 0.29 * scale + 0.7) * 0.3 +
    Math.sin(x * 0.73 * scale + 2.1) * Math.cos(y * 0.61 * scale + 1.9) * 0.2
  );
}

// ─── GÉNÉRATION CARTE (continents organiques + biomes) ───
function generateMap() {
  const map = [];
  for (let y = 0; y < MAP_H; y++) {
    const row = [];
    for (let x = 0; x < MAP_W; x++) {
      const dx = (x - MAP_W / 2) / (MAP_W / 2);
      const dy = (y - MAP_H / 2) / (MAP_H / 2);
      const warp = noise(x, y, 1) * 0.3;
      const dist = Math.sqrt(dx * dx + dy * dy) + warp;

      const elevation = noise(x, y, 1) + noise(x, y, 2) * 0.5;
      const moisture = noise(x + 100, y + 100, 1.5);
      const temperature = 1 - Math.abs(dy) + noise(x, y, 0.7) * 0.3;

      let t;
      if (dist > 0.85 || elevation < -0.4) t = "ocean";
      else if (dist > 0.75 || elevation < -0.2) t = "coast";
      else if (elevation < -0.05 && Math.abs(dx) > 0.3) t = "beach";
      else if (elevation > 0.55) t = "mountain";
      else if (temperature > 0.5 && moisture < -0.15 && x > MAP_W * 0.5) t = "desert";
      else if (moisture > 0.35 && elevation > 0.2) t = "deepForest";
      else if (moisture > 0.1) t = "forest";
      else if (moisture > -0.1) t = "meadow";
      else t = "plain";

      const variant = Math.floor(h(x, y) * TERRAIN[t].palette.length);
      row.push({
        type: t,
        variant,
        pop: 0,
        seed: h(x, y, 17)
      });
    }
    map.push(row);
  }
  return map;
}

// ─── GÉNÉRATION VILLES + ROUTES ───
function generateCities(map) {
  const cities = [];
  for (let i = 0; i < 14; i++) {
    let attempts = 0;
    while (attempts < 50) {
      const x = Math.floor(h(i, 99) * MAP_W);
      const y = Math.floor(h(i, 42) * MAP_H);
      const cell = map[y]?.[x];
      if (cell && TERRAIN[cell.type].buildable) {
        const tooClose = cities.some(c =>
          Math.abs(c.x - x) + Math.abs(c.y - y) < 4
        );
        if (!tooClose) {
          const size = 2 + Math.floor(h(i, 7) * 4);
          cities.push({ x, y, size, id: i });
          break;
        }
      }
      attempts++;
    }
  }
  return cities;
}

function generateRoads(cities) {
  const roads = [];
  if (cities.length === 0) return roads;
  const connected = new Set([0]);
  while (connected.size < cities.length) {
    let best = null;
    for (const i of connected) {
      for (let j = 0; j < cities.length; j++) {
        if (connected.has(j)) continue;
        const d = Math.abs(cities[i].x - cities[j].x) + Math.abs(cities[i].y - cities[j].y);
        if (!best || d < best.d) best = { from: i, to: j, d };
      }
    }
    if (best) {
      roads.push([cities[best.from], cities[best.to]]);
      connected.add(best.to);
    } else break;
  }
  for (let i = 0; i < 3; i++) {
    const a = Math.floor(h(i, 55) * cities.length);
    const b = Math.floor(h(i, 88) * cities.length);
    if (a !== b) roads.push([cities[a], cities[b]]);
  }
  return roads;
}

// ─── ÉVÉNEMENTS NARRATIFS (ancrés data réelle 2026→2030) ───
const EVENTS = [
  { year: 2026, id: "ai_job",     title: "Choc IA générative",
    desc: "40% des tâches bureau automatisables. Manifestations dans 12 capitales.",
    choices: [
      { label: "Taxer l'IA, UBI partiel",   effects: { inequality: -8, gdp: -3, happiness: +4 } },
      { label: "Laisser faire le marché",    effects: { inequality: +10, gdp: +5, happiness: -6 } },
      { label: "Reconversion massive état",  effects: { inequality: -4, gdp: -1, happiness: +2 } },
    ]},
  { year: 2026, id: "climate_cop", title: "COP31 à Belém",
    desc: "Engagement -50% émissions d'ici 2030. Signature ou retrait ?",
    choices: [
      { label: "Signer et investir (cher)",  effects: { climate: -6, gdp: -4, happiness: +3 } },
      { label: "Signer sans appliquer",      effects: { climate: -1, gdp: +0, happiness: -1 } },
      { label: "Refuser, souveraineté",      effects: { climate: +4, gdp: +2, happiness: -3 } },
    ]},
  { year: 2027, id: "water",       title: "Crise hydrique Sud-Europe",
    desc: "Sécheresse record. Espagne, Italie, Grèce en tension.",
    choices: [
      { label: "Dessalement massif",         effects: { climate: +3, gdp: -2, happiness: +2 } },
      { label: "Rationnement strict",        effects: { climate: -2, gdp: -1, happiness: -3 } },
      { label: "Migration interne planifiée",effects: { inequality: +3, gdp: -3, happiness: -1 } },
    ]},
  { year: 2027, id: "bric",        title: "Monnaie BRICS+ lancée",
    desc: "Alternative au dollar. Le bloc occidental perd du terrain.",
    choices: [
      { label: "Rejoindre le bloc",           effects: { gdp: +3, inequality: -2, happiness: +1 } },
      { label: "Bloc atlantique renforcé",    effects: { gdp: -2, inequality: +2, happiness: 0 } },
      { label: "Neutralité active",           effects: { gdp: +1, inequality: 0, happiness: +2 } },
    ]},
  { year: 2028, id: "agi",         title: "Annonce AGI par OpenAI",
    desc: "Capacités niveau expert humain dans 80% des domaines cognitifs.",
    choices: [
      { label: "Régulation internationale",   effects: { gdp: -3, inequality: -5, happiness: +4 } },
      { label: "Course ouverte",               effects: { gdp: +8, inequality: +10, happiness: -5 } },
      { label: "Moratoire 2 ans",              effects: { gdp: -5, inequality: -3, happiness: +1 } },
    ]},
  { year: 2028, id: "election",    title: "Cycles électoraux majeurs",
    desc: "France, USA, Inde. Montée des extrêmes partout.",
    choices: [
      { label: "Centre modéré consolidé",      effects: { happiness: +3, inequality: -2, gdp: +1 } },
      { label: "Virage populiste",              effects: { happiness: +5, inequality: +6, gdp: -2 } },
      { label: "Technocratie renforcée",       effects: { happiness: -3, inequality: -4, gdp: +3 } },
    ]},
  { year: 2029, id: "pandemic",    title: "Alerte pandémique H5N1",
    desc: "Mutation aviaire. OMS déclenche niveau 5.",
    choices: [
      { label: "Confinement préventif global",  effects: { gdp: -6, happiness: -4, climate: -2 } },
      { label: "Surveillance + vaccins ciblés", effects: { gdp: -2, happiness: +1, climate: 0 } },
      { label: "Minimiser, rester ouvert",      effects: { gdp: +1, happiness: -8, climate: 0 } },
    ]},
  { year: 2029, id: "fusion",      title: "Percée fusion nucléaire",
    desc: "Commercialisation possible en 2032. Investir maintenant ?",
    choices: [
      { label: "Investissement massif",          effects: { gdp: -4, climate: -5, happiness: +3 } },
      { label: "Partenariat privé léger",        effects: { gdp: -1, climate: -1, happiness: +1 } },
      { label: "Attendre maturité",              effects: { gdp: +0, climate: +2, happiness: 0 } },
    ]},
  { year: 2030, id: "final",       title: "Bilan décennal",
    desc: "Le monde de 2030 se cristallise. Dernière décision stratégique.",
    choices: [
      { label: "Grand plan de reconstruction",   effects: { gdp: -3, inequality: -6, climate: -3, happiness: +5 } },
      { label: "Status quo, consolidation",      effects: { gdp: +2, inequality: +1, climate: +1, happiness: -1 } },
      { label: "Fuite en avant tech",            effects: { gdp: +6, inequality: +8, climate: +5, happiness: -3 } },
    ]},
];

// ─── POLITIQUES JOUEUR (leviers permanents) ───
const POLICIES = [
  { id: "ubi",      label: "Revenu Universel",    cost: 3, effects: { inequality: -1.5, gdp: -0.5, happiness: +0.8 } },
  { id: "carbon",   label: "Taxe Carbone",         cost: 2, effects: { climate: -1.2, gdp: -0.8, happiness: -0.3 } },
  { id: "ai_reg",   label: "Régulation IA",        cost: 2, effects: { inequality: -0.8, gdp: -0.4, happiness: +0.4 } },
  { id: "edu",      label: "Éducation Massive",   cost: 2, effects: { gdp: +0.6, inequality: -0.6, happiness: +0.5 } },
  { id: "defense",  label: "Défense Renforcée",   cost: 3, effects: { gdp: +0.3, happiness: -0.4, climate: +0.5 } },
  { id: "green",    label: "Transition Verte",     cost: 3, effects: { climate: -1.5, gdp: -0.3, happiness: +0.3 } },
];

// ─── BASELINE DATA 2026 (réelle, sourcée) ───
const BASELINE = {
  population: 8200,        // 8.2 milliards (ONU 2026)
  gdp: 105,                // PIB mondial ~105 T$
  happiness: 52,           // World Happiness Report moyenne
  inequality: 38,          // Gini mondial ~0.38
  climate: 50,             // Index: 50 = trajectoire +2.7°C actuelle
  tech: 30,                // Progression IA/science
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function WorldSim2030() {
  const [map, setMap] = useState(() => generateMap());
  const [cities, setCities] = useState(() => {
    const m = generateMap();
    return generateCities(m);
  });
  const [roads, setRoads] = useState(() => []);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stats, setStats] = useState({ ...BASELINE });
  const [history, setHistory] = useState([{ ...BASELINE, tick: 0 }]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [resolvedEvents, setResolvedEvents] = useState(new Set());
  const [log, setLog] = useState([
    { tick: 0, type: "start", text: "2026 · Le monde en l'état. À vous de jouer." }
  ]);
  const [policies, setPolicies] = useState({});
  const [budget, setBudget] = useState(10);
  const [ended, setEnded] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);

  // Initialize cities + roads synchronized with map
  useEffect(() => {
    const c = generateCities(map);
    setCities(c);
    setRoads(generateRoads(c));
  }, []);

  // ─── Année/mois calculés ───
  const currentYear = START_YEAR + Math.floor(tick / TICKS_PER_YEAR);
  const currentMonth = (tick % TICKS_PER_YEAR) + 1;
  const progress = tick / (TICKS_PER_YEAR * (END_YEAR - START_YEAR + 1));

  // ─── Tick logic ───
  const runTick = useCallback(() => {
    if (ended) return;

    setTick(t => {
      const newTick = t + 1;
      const newYear = START_YEAR + Math.floor(newTick / TICKS_PER_YEAR);

      // Stats evolution
      setStats(prev => {
        let n = { ...prev };

        // Drift naturel (le monde se dégrade légèrement sans action)
        n.climate += 0.3;
        n.inequality += 0.1;
        n.happiness -= 0.05;
        n.gdp += 0.2;
        n.tech += 0.4;

        // Effet des politiques actives
        Object.keys(policies).forEach(pid => {
          if (policies[pid]) {
            const p = POLICIES.find(x => x.id === pid);
            if (p) {
              Object.entries(p.effects).forEach(([k, v]) => {
                n[k] = (n[k] || 0) + v;
              });
            }
          }
        });

        // Clamp
        n.happiness = clamp(n.happiness, 0, 100);
        n.inequality = clamp(n.inequality, 0, 100);
        n.climate = clamp(n.climate, 0, 100);
        n.tech = clamp(n.tech, 0, 100);
        n.gdp = Math.max(0, n.gdp);
        n.population = Math.max(0, n.population);

        // Pop dynamics
        if (n.happiness < 30) n.population -= 2;
        else if (n.happiness > 70) n.population += 3;

        // Check end conditions
        if (newYear > END_YEAR) {
          let verdict;
          if (n.happiness > 65 && n.inequality < 35 && n.climate < 55) verdict = "utopia";
          else if (n.happiness < 35 || n.climate > 80) verdict = "collapse";
          else verdict = "stasis";
          setEnded(verdict);
        }

        return n;
      });

      // Budget regen
      setBudget(b => Math.min(20, b + 0.3));

      // History
      setHistory(h => {
        const last = h[h.length - 1];
        const newEntry = { tick: newTick, ...stats };
        if (h.length > 60) return [...h.slice(1), newEntry];
        return [...h, newEntry];
      });

      // Event trigger
      const pending = EVENTS.find(e =>
        e.year === newYear &&
        !resolvedEvents.has(e.id) &&
        newTick % TICKS_PER_YEAR === 3
      );
      if (pending) {
        setActiveEvent(pending);
        setRunning(false);
      }

      return newTick;
    });
  }, [policies, resolvedEvents, stats, ended]);

  // ─── Game loop ───
  useEffect(() => {
    if (!running || activeEvent || ended) return;
    const interval = setInterval(runTick, TICK_MS / speed);
    return () => clearInterval(interval);
  }, [running, speed, runTick, activeEvent, ended]);

  // ─── Event resolution ───
  const resolveEvent = useCallback((choice) => {
    if (!activeEvent) return;
    setStats(prev => {
      const n = { ...prev };
      Object.entries(choice.effects).forEach(([k, v]) => {
        n[k] = clamp((n[k] || 0) + v, 0, k === "gdp" ? 999 : 100);
      });
      return n;
    });
    setResolvedEvents(s => new Set([...s, activeEvent.id]));
    setLog(l => [{
      tick,
      type: "event",
      text: `${currentYear} · ${activeEvent.title} → ${choice.label}`
    }, ...l].slice(0, 12));
    setActiveEvent(null);
  }, [activeEvent, tick, currentYear]);

  // ─── Policy toggle ───
  const togglePolicy = useCallback((pid) => {
    const p = POLICIES.find(x => x.id === pid);
    const isActive = policies[pid];
    if (!isActive && budget < p.cost) return;
    setPolicies(prev => ({ ...prev, [pid]: !isActive }));
    setBudget(b => isActive ? b + p.cost : b - p.cost);
    setLog(l => [{
      tick, type: "policy",
      text: `${currentYear} · Politique ${isActive ? "retirée" : "adoptée"} : ${p.label}`
    }, ...l].slice(0, 12));
  }, [policies, budget, tick, currentYear]);

  // ─── Sparkline helper ───
  const sparkline = (key) => {
    if (history.length < 2) return null;
    const vals = history.slice(-30).map(h => h[key] || 0);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    return vals.map((v, i) => ({
      x: (i / (vals.length - 1)) * 100,
      y: 100 - ((v - min) / range) * 100
    }));
  };

  const restart = () => {
    const newMap = generateMap();
    const newCities = generateCities(newMap);
    setMap(newMap);
    setCities(newCities);
    setRoads(generateRoads(newCities));
    setTick(0);
    setStats({ ...BASELINE });
    setHistory([{ ...BASELINE, tick: 0 }]);
    setResolvedEvents(new Set());
    setPolicies({});
    setBudget(10);
    setEnded(null);
    setActiveEvent(null);
    setLog([{ tick: 0, type: "start", text: "2026 · Nouvelle partie." }]);
    setRunning(false);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.ink,
      fontFamily: "ui-sans-serif, -apple-system, Inter, system-ui",
      padding: "24px",
      boxSizing: "border-box"
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ─── HEADER ─── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.line}`
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.inkSoft, textTransform: "uppercase" }}>
              World Sim · 2026 → 2030
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 500, margin: "4px 0 0", letterSpacing: -0.5 }}>
              {currentYear} <span style={{ color: C.inkSoft, fontSize: 20 }}>· mois {currentMonth.toString().padStart(2,"0")}</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              fontSize: 11, color: C.inkSoft, padding: "6px 10px",
              background: C.surface, borderRadius: 4, letterSpacing: 1
            }}>
              BUDGET · {budget.toFixed(1)}
            </div>
            {!ended && (
              <>
                <button onClick={() => setRunning(r => !r)} style={btnPrimary(running)}>
                  {running ? "⏸ Pause" : "▶ Lancer"}
                </button>
                <button onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)} style={btnGhost}>
                  ×{speed}
                </button>
              </>
            )}
            <button onClick={restart} style={btnGhost}>↻</button>
          </div>
        </div>

        {/* Progress bar fine */}
        <div style={{ height: 2, background: C.line, marginBottom: 24, position: "relative" }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: C.ink, transition: "width 0.6s"
          }} />
        </div>

        {/* ─── GRID 3 colonnes ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", gap: 20 }}>

          {/* ─── LEFT: STATS ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <StatCard label="Population" value={`${(stats.population / 1000).toFixed(2)}`} unit="Mds" spark={sparkline("population")} color={C.ink} />
            <StatCard label="PIB mondial" value={stats.gdp.toFixed(0)} unit="T$" spark={sparkline("gdp")} color={C.gold} />
            <StatCard label="Bonheur" value={stats.happiness.toFixed(0)} unit="/100" spark={sparkline("happiness")} color={C.sage} critical={stats.happiness < 35} />
            <StatCard label="Inégalités (Gini)" value={stats.inequality.toFixed(0)} unit="/100" spark={sparkline("inequality")} color={C.terracotta} critical={stats.inequality > 65} reverse />
            <StatCard label="Climat" value={stats.climate.toFixed(0)} unit="/100" spark={sparkline("climate")} color={C.ocean} critical={stats.climate > 80} reverse />
            <StatCard label="Technologie" value={stats.tech.toFixed(0)} unit="/100" spark={sparkline("tech")} color={C.plum} />
          </div>

          {/* ─── CENTER: MAP + LOG ─── */}
          <div>
            <div style={{
              background: C.surface, borderRadius: 6, padding: 16,
              border: `1px solid ${C.line}`
            }}>
              <div style={{
                fontSize: 10, letterSpacing: 2, color: C.inkSoft,
                textTransform: "uppercase", marginBottom: 12
              }}>
                Carte du monde
              </div>
              <svg
                viewBox={`0 0 ${MAP_W * TILE} ${MAP_H * TILE}`}
                style={{ width: "100%", height: "auto", display: "block", borderRadius: 4 }}
                onMouseLeave={() => setHoveredTile(null)}
                shapeRendering="geometricPrecision"
              >
                <defs>
                  {/* Subtle shadow for buildings */}
                  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
                    <feOffset dx="0.5" dy="0.8" result="offsetblur" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* ── LAYER 1: Base terrain tiles ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => {
                    const terrain = TERRAIN[cell.type];
                    const color = terrain.palette[cell.variant];
                    return (
                      <rect
                        key={`t-${x}-${y}`}
                        x={x * TILE}
                        y={y * TILE}
                        width={TILE}
                        height={TILE}
                        fill={color}
                        onMouseEnter={() => setHoveredTile({ x, y, ...cell })}
                      />
                    );
                  })
                )}

                {/* ── LAYER 2: Ocean waves ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => {
                    if (!TERRAIN[cell.type].waves) return null;
                    if (cell.seed > 0.6) return null; // Only some tiles get waves
                    const wx = x * TILE + cell.seed * TILE * 0.5 + 3;
                    const wy = y * TILE + TILE * 0.5 + (cell.seed - 0.3) * 4;
                    return (
                      <path
                        key={`w-${x}-${y}`}
                        d={`M ${wx} ${wy} q 3 -1.5 6 0`}
                        stroke="#FFFFFF"
                        strokeWidth="0.6"
                        strokeOpacity="0.4"
                        fill="none"
                        strokeLinecap="round"
                      />
                    );
                  })
                )}

                {/* ── LAYER 3: Desert dunes ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => {
                    if (!TERRAIN[cell.type].dunes) return null;
                    if (cell.seed > 0.5) return null;
                    const dx = x * TILE + 2 + cell.seed * 10;
                    const dy = y * TILE + TILE * 0.55 + cell.seed * 3;
                    return (
                      <path
                        key={`d-${x}-${y}`}
                        d={`M ${dx} ${dy} q 4 -2 8 0`}
                        stroke="#B8964A"
                        strokeWidth="0.7"
                        strokeOpacity="0.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    );
                  })
                )}

                {/* ── LAYER 4: Mountain peaks ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => {
                    if (!TERRAIN[cell.type].peaks) return null;
                    const px = x * TILE + TILE * 0.5;
                    const py = y * TILE + TILE * 0.5;
                    const size = 4 + cell.seed * 3;
                    return (
                      <g key={`m-${x}-${y}`}>
                        <path
                          d={`M ${px - size} ${py + size * 0.6} L ${px} ${py - size * 0.8} L ${px + size} ${py + size * 0.6} Z`}
                          fill="#6B6257"
                          opacity="0.7"
                        />
                        {/* Snow cap */}
                        <path
                          d={`M ${px - size * 0.35} ${py - size * 0.2} L ${px} ${py - size * 0.8} L ${px + size * 0.35} ${py - size * 0.2} Z`}
                          fill="#F5F1E8"
                          opacity="0.85"
                        />
                      </g>
                    );
                  })
                )}

                {/* ── LAYER 5: Grass tufts on plains/meadows ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => {
                    if (!TERRAIN[cell.type].grass) return null;
                    // 2-3 tiny grass marks per eligible tile
                    const marks = [];
                    for (let i = 0; i < 3; i++) {
                      const hh = h(x, y, i * 13);
                      if (hh < 0.35) continue;
                      const gx = x * TILE + hh * TILE * 0.85 + 1;
                      const gy = y * TILE + h(x, y, i * 19) * TILE * 0.85 + 1;
                      marks.push(
                        <circle
                          key={`g-${x}-${y}-${i}`}
                          cx={gx}
                          cy={gy}
                          r={0.6}
                          fill={cell.type === "meadow" ? "#8FA570" : "#BFA87A"}
                          opacity="0.6"
                        />
                      );
                    }
                    return marks;
                  })
                )}

                {/* ── LAYER 6: Trees (forests) ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => {
                    if (!TERRAIN[cell.type].trees) return null;
                    const treeCount = cell.type === "deepForest" ? 4 : 3;
                    const trees = [];
                    for (let i = 0; i < treeCount; i++) {
                      const hx = h(x, y, i * 31);
                      const hy = h(x, y, i * 47);
                      const tx = x * TILE + 3 + hx * (TILE - 6);
                      const ty = y * TILE + 3 + hy * (TILE - 6);
                      const treeSize = 1.8 + h(x, y, i * 7) * 1.4;
                      const isDark = cell.type === "deepForest";
                      trees.push(
                        <g key={`tr-${x}-${y}-${i}`}>
                          {/* Shadow */}
                          <ellipse
                            cx={tx + 0.5}
                            cy={ty + treeSize * 0.3 + 0.8}
                            rx={treeSize * 0.9}
                            ry={treeSize * 0.35}
                            fill="#000"
                            opacity="0.12"
                          />
                          {/* Tree canopy */}
                          <circle
                            cx={tx}
                            cy={ty}
                            r={treeSize}
                            fill={isDark ? "#556B4A" : "#6E8C55"}
                          />
                          {/* Highlight */}
                          <circle
                            cx={tx - treeSize * 0.3}
                            cy={ty - treeSize * 0.3}
                            r={treeSize * 0.4}
                            fill={isDark ? "#7A9668" : "#9BB77F"}
                            opacity="0.7"
                          />
                        </g>
                      );
                    }
                    return trees;
                  })
                )}

                {/* ── LAYER 7: Roads connecting cities ── */}
                {roads.map((road, i) => {
                  const [a, b] = road;
                  const x1 = a.x * TILE + TILE / 2;
                  const y1 = a.y * TILE + TILE / 2;
                  const x2 = b.x * TILE + TILE / 2;
                  const y2 = b.y * TILE + TILE / 2;
                  // Courbe légère Bézier
                  const mx = (x1 + x2) / 2 + (h(i, 3) - 0.5) * 20;
                  const my = (y1 + y2) / 2 + (h(i, 9) - 0.5) * 20;
                  return (
                    <g key={`road-${i}`}>
                      <path
                        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                        stroke="#2A2A2A"
                        strokeWidth="1.2"
                        strokeOpacity="0.25"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                        stroke="#F5F1E8"
                        strokeWidth="0.4"
                        strokeOpacity="0.6"
                        strokeDasharray="2 3"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {/* ── LAYER 8: Cities (buildings) ── */}
                {cities.map((city) => {
                  const cx = city.x * TILE + TILE / 2;
                  const cy = city.y * TILE + TILE / 2;
                  const buildings = [];
                  // Size determines number of buildings (2-5)
                  const count = city.size * 2 + 2;
                  for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2 + h(city.id, i) * 0.5;
                    const r = 3 + h(city.id, i * 3) * city.size * 2;
                    const bx = cx + Math.cos(angle) * r;
                    const by = cy + Math.sin(angle) * r;
                    const bw = 2.5 + h(city.id, i * 5) * 2;
                    const bh = 3 + h(city.id, i * 7) * 3;
                    // Colors vary: some warm (terracotta), some cool (plum), most neutral
                    const hue = h(city.id, i * 11);
                    const fill = hue < 0.15 ? "#D4876A" :
                                 hue < 0.3  ? "#C9A14B" :
                                 hue < 0.45 ? "#8A6B8E" :
                                              "#5A554E";
                    buildings.push(
                      <rect
                        key={`b-${city.id}-${i}`}
                        x={bx - bw / 2}
                        y={by - bh}
                        width={bw}
                        height={bh}
                        fill={fill}
                        filter="url(#softShadow)"
                        rx="0.3"
                      />
                    );
                  }
                  // Central landmark for bigger cities
                  if (city.size >= 4) {
                    buildings.push(
                      <rect
                        key={`bc-${city.id}`}
                        x={cx - 1.5}
                        y={cy - 6}
                        width={3}
                        height={7}
                        fill="#2A2A2A"
                        filter="url(#softShadow)"
                        rx="0.3"
                      />
                    );
                  }
                  return <g key={`city-${city.id}`}>{buildings}</g>;
                })}

                {/* ── LAYER 9: Hover highlight ── */}
                {hoveredTile && (
                  <rect
                    x={hoveredTile.x * TILE}
                    y={hoveredTile.y * TILE}
                    width={TILE}
                    height={TILE}
                    fill="none"
                    stroke={C.ink}
                    strokeWidth="1.2"
                    pointerEvents="none"
                  />
                )}

                {/* ── LAYER 10: Invisible hover grid (mouse capture) ── */}
                {map.map((row, y) =>
                  row.map((cell, x) => (
                    <rect
                      key={`hv-${x}-${y}`}
                      x={x * TILE}
                      y={y * TILE}
                      width={TILE}
                      height={TILE}
                      fill="transparent"
                      onMouseEnter={() => setHoveredTile({ x, y, ...cell })}
                      style={{ cursor: "pointer" }}
                    />
                  ))
                )}
              </svg>
              {hoveredTile && (
                <div style={{
                  fontSize: 11, color: C.inkSoft, marginTop: 8,
                  fontFamily: "ui-monospace, monospace"
                }}>
                  [{hoveredTile.x.toString().padStart(2, "0")}, {hoveredTile.y.toString().padStart(2, "0")}] · {hoveredTile.type}
                </div>
              )}
            </div>

            {/* Log */}
            <div style={{
              marginTop: 16, background: C.surface, borderRadius: 6,
              padding: 16, border: `1px solid ${C.line}`, maxHeight: 180, overflowY: "auto"
            }}>
              <div style={{
                fontSize: 10, letterSpacing: 2, color: C.inkSoft,
                textTransform: "uppercase", marginBottom: 10
              }}>
                Journal
              </div>
              {log.map((entry, i) => (
                <div key={i} style={{
                  fontSize: 12, color: i === 0 ? C.ink : C.inkSoft,
                  padding: "4px 0", borderBottom: i < log.length - 1 ? `1px solid ${C.line}` : "none",
                  fontFamily: "ui-monospace, monospace"
                }}>
                  <span style={{
                    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                    background: entry.type === "event" ? C.terracotta : entry.type === "policy" ? C.plum : C.sage,
                    marginRight: 10
                  }} />
                  {entry.text}
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: POLICIES ─── */}
          <div style={{
            background: C.surface, borderRadius: 6, padding: 16,
            border: `1px solid ${C.line}`
          }}>
            <div style={{
              fontSize: 10, letterSpacing: 2, color: C.inkSoft,
              textTransform: "uppercase", marginBottom: 12
            }}>
              Politiques actives
            </div>
            {POLICIES.map(p => {
              const active = !!policies[p.id];
              const canAfford = active || budget >= p.cost;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePolicy(p.id)}
                  disabled={!canAfford}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px",
                    background: active ? C.ink : "transparent",
                    color: active ? C.bg : canAfford ? C.ink : C.line,
                    border: `1px solid ${active ? C.ink : C.line}`,
                    borderRadius: 4, marginBottom: 8,
                    cursor: canAfford ? "pointer" : "not-allowed",
                    fontSize: 12, transition: "all 0.15s",
                    fontFamily: "inherit"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 500 }}>{p.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.7, fontFamily: "ui-monospace, monospace" }}>
                      {p.cost}₵
                    </span>
                  </div>
                </button>
              );
            })}
            <div style={{ marginTop: 16, fontSize: 10, color: C.inkSoft, lineHeight: 1.6 }}>
              Chaque politique draine le budget tant qu'elle est active.<br/>
              Le budget régénère lentement via le PIB.
            </div>
          </div>
        </div>

        {/* ─── EVENT MODAL ─── */}
        {activeEvent && (
          <Modal>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.terracotta, textTransform: "uppercase", marginBottom: 8 }}>
              Événement · {activeEvent.year}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 12px", letterSpacing: -0.3 }}>
              {activeEvent.title}
            </h2>
            <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {activeEvent.desc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeEvent.choices.map((c, i) => (
                <button key={i} onClick={() => resolveEvent(c)} style={btnChoice}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: C.inkSoft, fontFamily: "ui-monospace, monospace" }}>
                    {Object.entries(c.effects).map(([k, v]) =>
                      `${k.slice(0, 3)} ${v > 0 ? "+" : ""}${v}`
                    ).join(" · ")}
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* ─── ENDING MODAL ─── */}
        {ended && (
          <Modal>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
              2030 · Bilan
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 500, margin: "0 0 16px", letterSpacing: -0.5 }}>
              {ended === "utopia" && "Utopie raisonnée"}
              {ended === "stasis" && "Monde en équilibre fragile"}
              {ended === "collapse" && "Effondrement partiel"}
            </h2>
            <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              {ended === "utopia" && "Vous avez maintenu le bonheur, réduit les inégalités et contenu le climat. Rare. Rigoureux. Reproductible ?"}
              {ended === "stasis" && "Le monde tourne. Ni catastrophe, ni transformation. La décennie suivante dira si c'était assez."}
              {ended === "collapse" && "Les indicateurs ont cédé. Le monde n'est pas fini mais les prochaines années seront douloureuses."}
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
              padding: 16, background: C.bg, borderRadius: 4, marginBottom: 20
            }}>
              <FinalStat label="Bonheur" value={stats.happiness.toFixed(0)} />
              <FinalStat label="Inégalités" value={stats.inequality.toFixed(0)} />
              <FinalStat label="Climat" value={stats.climate.toFixed(0)} />
              <FinalStat label="PIB" value={stats.gdp.toFixed(0)} unit="T$" />
            </div>
            <button onClick={restart} style={{ ...btnPrimary(false), width: "100%" }}>
              Rejouer la décennie
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════
function StatCard({ label, value, unit, spark, color, critical, reverse }) {
  return (
    <div style={{
      background: C.surface, padding: 14, borderRadius: 6,
      border: `1px solid ${critical ? C.terracotta : C.line}`
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, color: C.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 500, color: critical ? C.terracotta : C.ink, letterSpacing: -0.5 }}>
          {value}
        </span>
        <span style={{ fontSize: 11, color: C.inkSoft }}>{unit}</span>
      </div>
      {spark && spark.length > 1 && (
        <svg viewBox="0 0 100 30" style={{ width: "100%", height: 24, display: "block" }} preserveAspectRatio="none">
          <polyline
            points={spark.map(p => `${p.x},${p.y * 0.3}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}

function Modal({ children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(42, 42, 42, 0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: 20
    }}>
      <div style={{
        background: C.bg, padding: 32, borderRadius: 8,
        maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
      }}>
        {children}
      </div>
    </div>
  );
}

function FinalStat({ label, value, unit }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 1.5, color: C.inkSoft, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>
        {value}<span style={{ fontSize: 11, color: C.inkSoft, marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE HELPERS
// ═══════════════════════════════════════════════════════════════
const btnPrimary = (active) => ({
  padding: "8px 16px",
  background: active ? C.terracotta : C.ink,
  color: C.bg,
  border: "none",
  borderRadius: 4,
  fontSize: 12,
  letterSpacing: 0.5,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background 0.15s"
});

const btnGhost = {
  padding: "8px 12px",
  background: "transparent",
  color: C.ink,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "border-color 0.15s"
};

const btnChoice = {
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  background: C.surface,
  color: C.ink,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s"
};
