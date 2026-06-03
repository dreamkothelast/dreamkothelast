import { Icon } from "./Icon";

interface HomeButtonProps {
  onClick: () => void;
}

/**
 * Bouton Accueil — toujours visible, haut-gauche.
 * Grande cible tactile (min 80×80 px), fort contraste.
 */
export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{ top: "max(1rem, var(--safe-top))", left: "max(1rem, var(--safe-left))" }}
      className={[
        "fixed z-50",
        "min-w-[64px] min-h-[64px] sm:min-w-[80px] sm:min-h-[80px] px-3 sm:px-4",
        "flex items-center gap-2",
        "bg-creme border-4 border-brun/30 rounded-mas-xl shadow-tuile",
        "font-masque font-bold text-brun text-xl",
        "cursor-pointer select-none",
        "transition-all duration-200 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-[5px] focus-visible:ring-soleil",
        "hover:brightness-105",
      ].join(" ")}
      aria-label="Retour à l'accueil"
    >
      <Icon name="home" size={30} className="w-6 h-6 sm:w-[30px] sm:h-[30px]" />
      <span className="hidden sm:inline text-lg leading-tight">Accueil</span>
    </button>
  );
}
