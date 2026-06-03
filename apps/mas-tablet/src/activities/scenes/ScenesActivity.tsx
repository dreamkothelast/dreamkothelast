import { useEffect, useRef, useCallback, useState } from "react";
import { useAudio } from "../../hooks/useAudio";
import { Icon } from "../../components/Icon";
import type { ActivityProps } from "../../types";

// ── Définitions de scènes ───────────────────────────────────────────────────

type SceneId = "foret" | "ocean" | "etoiles" | "prairie";

interface SceneConfig {
  id: SceneId;
  label: string;
  icon: string;
  tileColors: { primary: string; secondary: string };
  bgTop: string;
  bgBottom: string;
  particleColors: string[];
  hint: string;
  noteHz: number;
}

const SCENES: SceneConfig[] = [
  {
    id: "foret",
    label: "Forêt",
    icon: "pine",
    tileColors: { primary: "#388E3C", secondary: "#1B5E20" },
    bgTop: "#0d2b0d",
    bgBottom: "#1a4a1a",
    particleColors: ["#8FD94B", "#C4EE8A", "#FFD700", "#ADFF2F", "#90EE90"],
    hint: "Touche pour faire apparaître des lucioles",
    noteHz: 261.6,
  },
  {
    id: "ocean",
    label: "Océan",
    icon: "wave",
    tileColors: { primary: "#0288D1", secondary: "#01579B" },
    bgTop: "#020c1a",
    bgBottom: "#0a2a4a",
    particleColors: ["#4FC3F7", "#81D4FA", "#80D8FF", "#B3E5FC", "#E1F5FE"],
    hint: "Touche pour créer des vagues",
    noteHz: 293.7,
  },
  {
    id: "etoiles",
    label: "Étoiles",
    icon: "star",
    tileColors: { primary: "#5C35C9", secondary: "#311B92" },
    bgTop: "#020007",
    bgBottom: "#0d0826",
    particleColors: ["#FFD700", "#FFFACD", "#FFF8DC", "#FFEC8B", "#E6E6FA"],
    hint: "Touche pour allumer des étoiles filantes",
    noteHz: 440.0,
  },
  {
    id: "prairie",
    label: "Prairie",
    icon: "flower",
    tileColors: { primary: "#E91E8C", secondary: "#880E4F" },
    bgTop: "#0f1f00",
    bgBottom: "#1a3300",
    particleColors: ["#FF69B4", "#FFB6C1", "#FF85C2", "#DDA0DD", "#EE82EE"],
    hint: "Touche pour faire voler des pétales",
    noteHz: 392.0,
  },
];

// ── Types de particules ─────────────────────────────────────────────────────

interface Particle {
  scene: SceneId;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  alpha: number;
  age: number;
  maxAge: number;
  phase: number; // oscillation phase
}

function makeParticle(scene: SceneId, x: number, y: number, cfg: SceneConfig, fromUser = false): Particle {
  const color = cfg.particleColors[Math.floor(Math.random() * cfg.particleColors.length)];
  const size = fromUser
    ? 6 + Math.random() * 14
    : scene === "etoiles" ? 2 + Math.random() * 5 : 5 + Math.random() * 12;

  if (scene === "foret") {
    return {
      scene, x, y, size, color,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.3 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      alpha: 0.8 + Math.random() * 0.2,
      age: 0, maxAge: 140 + Math.random() * 100,
      phase: Math.random() * Math.PI * 2,
    };
  }
  if (scene === "ocean") {
    return {
      scene, x, y, size, color,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.5 + Math.random() * 1.2),
      rotation: 0, rotSpeed: 0,
      alpha: 0.6 + Math.random() * 0.3,
      age: 0, maxAge: 120 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
    };
  }
  if (scene === "etoiles") {
    return {
      scene, x, y, size, color,
      vx: fromUser ? (Math.random() - 0.5) * 4 : 0,
      vy: fromUser ? -1 - Math.random() * 3 : 0,
      rotation: 0, rotSpeed: 0,
      alpha: 0.4 + Math.random() * 0.6,
      age: 0, maxAge: fromUser ? 90 + Math.random() * 60 : 200 + Math.random() * 300,
      phase: Math.random() * Math.PI * 2,
    };
  }
  // prairie
  return {
    scene, x, y, size, color,
    vx: 0.3 + Math.random() * 0.8,
    vy: -0.1 + (Math.random() - 0.5) * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1,
    alpha: 0.7 + Math.random() * 0.3,
    age: 0, maxAge: 150 + Math.random() * 100,
    phase: Math.random() * Math.PI * 2,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.alpha);
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  if (p.scene === "foret") {
    // Luciole / feuille ovale
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    glow.addColorStop(0, p.color + "FF");
    glow.addColorStop(0.5, p.color + "AA");
    glow.addColorStop(1, p.color + "00");
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    // Petit halo brillant
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.size * 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  } else if (p.scene === "ocean") {
    // Bulle irisée
    const grad = ctx.createRadialGradient(-p.size * 0.3, -p.size * 0.3, p.size * 0.1, 0, 0, p.size);
    grad.addColorStop(0, "rgba(255,255,255,0.8)");
    grad.addColorStop(0.4, p.color + "BB");
    grad.addColorStop(1, p.color + "22");
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = p.color + "88";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (p.scene === "etoiles") {
    // Étoile à 4 branches
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.size * 3;
    ctx.fillStyle = p.color;
    const s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, -s * 2);
    ctx.lineTo(s * 0.4, -s * 0.4);
    ctx.lineTo(s * 2, 0);
    ctx.lineTo(s * 0.4, s * 0.4);
    ctx.lineTo(0, s * 2);
    ctx.lineTo(-s * 0.4, s * 0.4);
    ctx.lineTo(-s * 2, 0);
    ctx.lineTo(-s * 0.4, -s * 0.4);
    ctx.closePath();
    ctx.fill();
  } else {
    // Pétale : ellipse légèrement arrondie
    const grad = ctx.createRadialGradient(0, 0, 0, 0, p.size * 0.5, p.size);
    grad.addColorStop(0, "#fff8");
    grad.addColorStop(0.3, p.color + "EE");
    grad.addColorStop(1, p.color + "55");
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

// ── Composant principal ─────────────────────────────────────────────────────

export function ScenesActivity({ reducedMotion, volume = 0.7, intensity }: ActivityProps) {
  const { playTone, resume } = useAudio(volume);
  const [activeScene, setActiveScene] = useState<SceneId | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const activeCfgRef = useRef<SceneConfig | null>(null);

  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
  }, []);

  // Lancer une scène
  const launchScene = useCallback((id: SceneId) => {
    setActiveScene(id);
    particlesRef.current = [];
    const cfg = SCENES.find((s) => s.id === id)!;
    activeCfgRef.current = cfg;
    playTone(cfg.noteHz, 0.4, "sine", 0.8);
  }, [playTone]);

  // Boucle animation — dépend de activeScene pour spawn ambiant
  useEffect(() => {
    if (!activeScene) return;
    const cfg = SCENES.find((s) => s.id === activeScene)!;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const speedMult = reducedMotion ? 0.4 : intensity === "vif" ? 1.3 : 1.0;
    const ambientIntervalMs = reducedMotion ? 800 : 300;

    // Spawn ambiant périodique
    const spawnAmbient = () => {
      const c = canvasRef.current;
      if (!c) return;
      const x = (() => {
        if (activeScene === "foret") return Math.random() * c.width;
        if (activeScene === "ocean") return Math.random() * c.width;
        if (activeScene === "etoiles") return Math.random() * c.width;
        return -20; // prairie — depuis la gauche
      })();
      const y = (() => {
        if (activeScene === "foret") return -20; // depuis le haut
        if (activeScene === "ocean") return c.height + 20; // depuis le bas
        if (activeScene === "etoiles") return Math.random() * c.height;
        return Math.random() * c.height; // prairie — hauteur aléatoire
      })();
      particlesRef.current.push(makeParticle(activeScene, x, y, cfg));
    };

    spawnTimerRef.current = window.setInterval(spawnAmbient, ambientIntervalMs);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fond dégradé
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, cfg.bgTop);
      bgGrad.addColorStop(1, cfg.bgBottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.age++;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
        p.rotation += p.rotSpeed * speedMult;
        p.phase += 0.04;

        // Oscillation latérale (forêt/prairie/ocean)
        if (p.scene !== "etoiles") {
          p.x += Math.sin(p.phase) * 0.4;
        }

        // Fade out sur la dernière portion de vie
        const lifeRatio = p.age / p.maxAge;
        if (lifeRatio > 0.7) {
          p.alpha -= 0.015 * speedMult;
        }
        // Étoile fixe : scintillement
        if (p.scene === "etoiles" && p.vx === 0) {
          p.alpha = 0.4 + 0.5 * Math.abs(Math.sin(p.phase));
        }

        if (p.alpha <= 0 || p.age > p.maxAge) return false;

        // Sortie par les bords
        if (
          p.x < -80 || p.x > canvas.width + 80 ||
          (p.scene !== "foret" && p.scene !== "prairie" && p.y < -80) ||
          p.y > canvas.height + 80
        ) return false;

        drawParticle(ctx, p);
        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(spawnTimerRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeScene, reducedMotion, intensity, resizeCanvas]);

  // Interaction utilisateur — burst de particules au tap
  const spawnBurst = useCallback(
    (x: number, y: number) => {
      if (!activeScene) return;
      const cfg = SCENES.find((s) => s.id === activeScene)!;
      resume();
      playTone(cfg.noteHz + Math.random() * 50, 0.3, "sine", 0.7);

      const count = reducedMotion ? 3 : 8;
      for (let i = 0; i < count; i++) {
        const bx = x + (Math.random() - 0.5) * 40;
        const by = y + (Math.random() - 0.5) * 40;
        particlesRef.current.push(makeParticle(activeScene, bx, by, cfg, true));
      }
    },
    [activeScene, reducedMotion, playTone, resume]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top);
    },
    [spawnBurst]
  );

  // ── Sélecteur de scènes (écran idle) ──────────────────────────────────────
  if (!activeScene) {
    return (
      <div className="mas-scroll flex flex-col items-center justify-center w-full h-full gap-5 sm:gap-8 px-4 sm:px-8 py-5 sm:py-8">
        <h2 className="font-masque font-bold text-brun text-2xl sm:text-4xl">Scènes Visuelles</h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-[900px]">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => launchScene(scene.id)}
              className={[
                "flex flex-col items-center justify-end overflow-hidden",
                "min-h-[140px] sm:min-h-[200px] w-full rounded-[1.5rem] sm:rounded-[2rem]",
                "cursor-pointer select-none transition-all duration-200",
                "shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
                "active:scale-95 hover:scale-[1.04]",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-white",
              ].join(" ")}
              style={{ backgroundColor: scene.tileColors.primary }}
            >
              <div className="flex-1 flex items-center justify-center py-4 sm:py-6">
                <Icon name={scene.icon} size={92} className="w-16 h-16 sm:w-[92px] sm:h-[92px] select-none motion-safe:animate-[float_3s_ease-in-out_infinite]" />
              </div>
              <div className="w-full px-3 py-3 sm:px-4 sm:py-4 text-center" style={{ backgroundColor: scene.tileColors.secondary }}>
                <span className="font-masque font-bold text-white text-lg sm:text-2xl">{scene.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Scène active (plein écran canvas) ─────────────────────────────────────
  const cfg = SCENES.find((s) => s.id === activeScene)!;

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      {/* Bouton retour aux scènes */}
      <button
        onClick={() => { setActiveScene(null); particlesRef.current = []; }}
        className={[
          "absolute top-4 left-1/2 -translate-x-1/2 z-20",
          "font-masque font-bold text-white/70 text-lg px-6 py-2 rounded-full",
          "hover:text-white hover:bg-white/10 transition-all",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white",
          "flex items-center gap-2",
        ].join(" ")}
      >
        <Icon name="arrow-left" size={22} /> Autres scènes
      </button>

      {/* Indication discrète */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <p className="font-masque text-white/30 text-xl text-center select-none">
          {cfg.hint}
        </p>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ cursor: "crosshair" }}
        onPointerDown={handlePointerDown}
        role="application"
        aria-label={`Scène visuelle : ${cfg.label}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            const c = canvasRef.current;
            if (c) spawnBurst(c.width / 2, c.height / 2);
          }
        }}
      />
    </div>
  );
}
