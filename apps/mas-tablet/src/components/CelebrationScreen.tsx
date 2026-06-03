import { useEffect, useRef } from "react";
import { Mascot } from "./Mascot";
import { BigButton } from "./BigButton";
import { Icon } from "./Icon";

interface CelebrationScreenProps {
  onHome: () => void;
  onContinue?: () => void;
  message?: string;
  reducedMotion?: boolean;
}

/**
 * Écran de félicitations apaisant — renforcement positif uniquement.
 * Confettis dessinés sur Canvas (pas de lib externe, pas de flash).
 */
export function CelebrationScreen({
  onHome,
  onContinue,
  message = "Bravo !",
  reducedMotion = false,
}: CelebrationScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confettis simples : cercles et carrés colorés qui tombent lentement
    const COLORS = ["#FFD23F", "#6EC6F0", "#FF7A6B", "#8FD94B", "#C5E9F8", "#FFE88C"];
    const pieces = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 0.8 + Math.random() * 1.2,     // lent et apaisant
      drift: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      isRect: Math.random() > 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        if (p.isRect) {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Déplacement
        p.y += p.speed;
        p.x += p.drift;
        p.rot += p.rotSpeed;
        // Réapparition en haut si hors écran
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-creme"
      role="alertdialog"
      aria-modal="true"
      aria-label={message}
    >
      {/* Confettis (canvas derrière le contenu) */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full"
          aria-hidden="true"
        />
      )}

      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-8 px-4 animate-[celebration_0.6s_cubic-bezier(0.34,1.56,0.64,1)]">
        <Mascot state="celebrate" size={220} />

        <div className="text-center">
          <p className="font-masque font-bold text-brun text-4xl sm:text-6xl drop-shadow-sm">
            {message}
          </p>
          <p className="font-masque text-brun/60 text-xl sm:text-3xl mt-3">
            C&apos;est terminé, tu as bien travaillé !
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4">
          <BigButton
            onClick={onHome}
            color="bg-ciel"
            className="text-2xl px-10 py-5"
            aria-label="Retour à l'accueil"
          >
            <Icon name="home" size={36} className="mr-3" />
            Accueil
          </BigButton>

          {onContinue && (
            <BigButton
              onClick={onContinue}
              color="bg-vert"
              className="text-2xl px-10 py-5"
              aria-label="Rejouer"
            >
              <Icon name="refresh" size={36} className="mr-3" />
              Rejouer
            </BigButton>
          )}
        </div>
      </div>
    </div>
  );
}
