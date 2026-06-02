import { useRef, type ReactNode, type KeyboardEvent } from "react";

interface BigButtonProps {
  onClick: () => void;
  children: ReactNode;
  color?: string;            // classe Tailwind de fond
  borderColor?: string;      // classe Tailwind de bordure
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * Bouton large accessible : min 80×80 px, focus visible, activable clavier/switch.
 */
export function BigButton({
  onClick,
  children,
  color = "bg-ciel",
  borderColor = "border-brun/30",
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}: BigButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onKeyDown={handleKey}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        "relative min-w-[80px] min-h-[80px]",
        "flex items-center justify-center",
        "rounded-mas-xl border-4",
        "font-masque font-semibold text-brun",
        "cursor-pointer select-none",
        "transition-all duration-200 active:scale-95 active:shadow-tuile-press",
        "shadow-tuile",
        // Focus très marqué pour accès contacteur
        "focus-visible:outline-none focus-visible:ring-[5px] focus-visible:ring-soleil focus-visible:ring-offset-2 focus-visible:ring-offset-brun",
        color,
        borderColor,
        disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-105",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
