import { useEffect, useState } from "react";

type MascotState = "idle" | "celebrate" | "wave" | "happy";

interface MascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
}

/**
 * Mascotte placeholder — personnage cartoon rond et amical.
 * À remplacer par l'asset final (voir README : src/assets/images/mascotte.svg).
 * Respecte reduced-motion : animations désactivées si prefers-reduced-motion.
 */
export function Mascot({ state = "idle", size = 180, className = "" }: MascotProps) {
  const [frame, setFrame] = useState(0);

  // Animation douce de la bouche selon l'état
  useEffect(() => {
    if (state === "idle") { setFrame(0); return; }
    const id = setInterval(() => setFrame((f) => (f + 1) % 3), 400);
    return () => clearInterval(id);
  }, [state]);

  const bodyColor = "#FFD23F";
  const bodyBorder = "#4A3B2F";
  const cheekColor = "#FF7A6B";
  const eyeColor = "#4A3B2F";

  // Bouche selon l'état : sourire neutre / grand sourire / O de surprise
  const mouthPath =
    state === "celebrate"
      ? "M 28 62 Q 50 78 72 62"
      : state === "wave"
      ? "M 32 62 Q 50 72 68 62"
      : "M 35 62 Q 50 70 65 62";

  // Bras selon l'état
  const armLeft =
    state === "celebrate"
      ? "M 18 75 Q 5 55 10 40"
      : state === "wave"
      ? "M 18 75 Q 2 60 8 44"
      : "M 18 82 Q 5 90 8 100";
  const armRight =
    state === "celebrate"
      ? "M 82 75 Q 95 55 90 40"
      : "M 82 82 Q 95 90 92 100";

  const isAnimated = state !== "idle";

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 130"
        width={size}
        height={size}
        className={isAnimated ? "animate-[float_2s_ease-in-out_infinite]" : ""}
        style={{ overflow: "visible" }}
      >
        {/* Ombre au sol */}
        <ellipse cx="50" cy="128" rx="28" ry="5" fill="rgba(74,59,47,0.12)" />

        {/* Corps principal — rond et dodu */}
        <circle
          cx="50"
          cy="75"
          r="38"
          fill={bodyColor}
          stroke={bodyBorder}
          strokeWidth="3.5"
        />

        {/* Ventre (zone claire) */}
        <ellipse cx="50" cy="82" rx="22" ry="18" fill="#FFE88C" />

        {/* Bras gauche */}
        <path
          d={armLeft}
          stroke={bodyColor}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={armLeft}
          stroke={bodyBorder}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bras droit */}
        <path
          d={armRight}
          stroke={bodyColor}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={armRight}
          stroke={bodyBorder}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Œil gauche */}
        <circle cx="36" cy="68" r="7" fill="white" stroke={bodyBorder} strokeWidth="2.5" />
        <circle
          cx="37.5"
          cy={state === "celebrate" ? "66.5" : "68"}
          r="3.5"
          fill={eyeColor}
        />
        <circle cx="38.5" cy="66.5" r="1.2" fill="white" />

        {/* Œil droit */}
        <circle cx="64" cy="68" r="7" fill="white" stroke={bodyBorder} strokeWidth="2.5" />
        <circle
          cx="62.5"
          cy={state === "celebrate" ? "66.5" : "68"}
          r="3.5"
          fill={eyeColor}
        />
        <circle cx="63.5" cy="66.5" r="1.2" fill="white" />

        {/* Joues */}
        <ellipse cx="26" cy="75" rx="8" ry="5.5" fill={cheekColor} opacity="0.55" />
        <ellipse cx="74" cy="75" rx="8" ry="5.5" fill={cheekColor} opacity="0.55" />

        {/* Bouche */}
        <path
          d={mouthPath}
          stroke={bodyBorder}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Oreilles / antennes selon frame */}
        {state === "celebrate" && frame === 1 && (
          <>
            <circle cx="32" cy="40" r="6" fill={cheekColor} stroke={bodyBorder} strokeWidth="2.5" />
            <circle cx="68" cy="40" r="6" fill={cheekColor} stroke={bodyBorder} strokeWidth="2.5" />
          </>
        )}

        {/* Étoiles de célébration — petites étoiles SVG (pas d'emoji) */}
        {state === "celebrate" && (
          <>
            <path
              className="animate-[float_1.5s_ease-in-out_infinite]"
              fill="#FFC93C"
              stroke="#F4A100"
              strokeWidth="1"
              strokeLinejoin="round"
              d="M14 22 L17 30 L25 31 L19 36 L21 44 L14 39 L7 44 L9 36 L3 31 L11 30 Z"
            />
            <path
              className="animate-[float_1.8s_ease-in-out_infinite_0.3s]"
              fill="#FFE07A"
              d="M82 20 C84 27 86 29 92 31 C86 33 84 35 82 42 C80 35 78 33 72 31 C78 29 80 27 82 20 Z"
            />
          </>
        )}
      </svg>
    </div>
  );
}
