import { useEffect, useRef, useCallback } from "react";
import { useAudio } from "../../hooks/useAudio";
import { Icon } from "../../components/Icon";
import type { ActivityProps } from "../../types";

// Palette de couleurs chaudes et douces pour les bulles
const BUBBLE_COLORS = [
  "#FFD23F", // soleil
  "#6EC6F0", // ciel
  "#FF7A6B", // corail
  "#8FD94B", // vert
  "#C5E9F8", // ciel clair
  "#FFB5AD", // corail clair
  "#FFE88C", // soleil clair
  "#C4EE8A", // vert clair
  "#F0B4F0", // lilas doux
  "#B4D4FF", // bleu pâle
];

interface Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  phase: "grow" | "float" | "fade";
  age: number;
  maxAge: number;  // en frames
}

/**
 * Activité Sensorielle — niveau Cause à Effet.
 *
 * Toucher n'importe où → bulle colorée qui naît, flotte et disparaît doucement.
 * Pas de bonne/mauvaise réponse. Apaisant, type Snoezelen.
 * Sons générés via Web Audio API (pentatonique, jamais dissonant).
 */
export function SensoryActivity({
  intensity,
  reducedMotion,
  volume = 0.7,
}: ActivityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const rafRef = useRef<number>(0);
  const { playBubble, resume } = useAudio(volume);

  // Vitesse d'animation selon intensité et reduced-motion
  const speedMult = reducedMotion ? 0.3 : intensity === "vif" ? 1.4 : 1.0;

  // Initialise le canvas en plein écran
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Boucle d'animation des bulles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubblesRef.current = bubblesRef.current.filter((b) => {
        b.age++;
        // Phases de vie d'une bulle
        if (b.phase === "grow") {
          if (b.age > 12) b.phase = "float";
          b.r = Math.min(b.r + 2.5 * speedMult, 60 + Math.random() * 40);
        } else if (b.phase === "float") {
          if (b.age > b.maxAge) b.phase = "fade";
        } else {
          // fade : diminue opacité
          b.alpha -= 0.025 * speedMult;
          if (b.alpha <= 0) return false; // supprimer
        }

        // Mouvement flottant
        b.x += b.vx * speedMult;
        b.y += b.vy * speedMult;
        // Légère oscillation sinusoïdale
        b.x += Math.sin(b.age * 0.04) * 0.5;

        // Dessin de la bulle
        ctx.save();
        ctx.globalAlpha = Math.max(0, b.alpha);

        // Corps de la bulle
        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.3,
          b.y - b.r * 0.3,
          b.r * 0.1,
          b.x,
          b.y,
          b.r
        );
        grad.addColorStop(0, "rgba(255,255,255,0.85)");
        grad.addColorStop(0.5, b.color + "CC");
        grad.addColorStop(1, b.color + "44");

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Contour doux type cel-shading
        ctx.strokeStyle = b.color + "88";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Reflet blanc (style bulle de savon)
        ctx.beginPath();
        ctx.arc(
          b.x - b.r * 0.32,
          b.y - b.r * 0.32,
          b.r * 0.22,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();

        ctx.restore();
        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speedMult]);

  // Création d'une bulle à la position touchée
  const spawnBubble = useCallback(
    (x: number, y: number) => {
      resume();
      playBubble();

      const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8; // surtout vers le haut
      const speed = (0.6 + Math.random() * 0.8) * speedMult;

      bubblesRef.current.push({
        x,
        y,
        r: 10,
        vx: Math.cos(angle) * speed * 0.4,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 0.9,
        phase: "grow",
        age: 0,
        maxAge: 80 + Math.floor(Math.random() * 60),
      });

      // Spawn de 2-3 petites bulles satellites
      const count = intensity === "vif" ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = 20 + Math.random() * 30;
        bubblesRef.current.push({
          x: x + Math.cos(ang) * r * 0.3,
          y: y + Math.sin(ang) * r * 0.3,
          r: 6,
          vx: Math.cos(ang) * speed * 0.6,
          vy: -speed * 0.5,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          alpha: 0.75,
          phase: "grow",
          age: 0,
          maxAge: 50 + Math.floor(Math.random() * 40),
        });
      }
    },
    [playBubble, resume, speedMult, intensity]
  );

  // Gestionnaires d'événements — toute la surface est réactive
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      spawnBubble(e.clientX - rect.left, e.clientY - rect.top);
    },
    [spawnBubble]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Spawn seulement si bouton/doigt appuyé (pressure > 0 ou buttons > 0)
      if (e.pressure === 0 && e.buttons === 0) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Limite la fréquence de spawn en mouvement (une bulle tous les ~80ms)
      if (Math.random() > 0.25) return;
      spawnBubble(e.clientX - rect.left, e.clientY - rect.top);
    },
    [spawnBubble]
  );

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-gradient-to-b from-[#EBF7FF] to-[#FFF6E9]">
      {/* Titre discret en haut, centré */}
      <div className="absolute top-0 left-0 right-0 flex justify-center items-center gap-3 pt-8 pointer-events-none z-10">
        <Icon name="bubbles" size={36} className="select-none" />
        <p className="font-masque text-brun/40 text-2xl select-none">
          Touche l&apos;écran pour faire apparaître des bulles
        </p>
        <Icon name="bubbles" size={36} className="select-none" />
      </div>

      {/* Canvas plein écran — toute la surface est réactive */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ cursor: "crosshair" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        role="application"
        aria-label="Surface de jeu sensoriel — toucher pour créer des bulles colorées"
        tabIndex={0}
        onKeyDown={(e) => {
          // Accessibilité switch : espace ou entrée → bulle au centre
          if (e.key === " " || e.key === "Enter") {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              spawnBubble(
                rect.width / 2 + (Math.random() - 0.5) * 200,
                rect.height / 2 + (Math.random() - 0.5) * 150
              );
            }
          }
        }}
      />
    </div>
  );
}
