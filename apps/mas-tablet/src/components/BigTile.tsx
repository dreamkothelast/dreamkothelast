import type { ActivityDefinition } from "../types";
import { Icon } from "./Icon";

interface BigTileProps {
  activity: ActivityDefinition;
  onClick: () => void;
  tabIndex?: number;
}

export function BigTile({ activity, onClick, tabIndex = 0 }: BigTileProps) {
  return (
    <button
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={`Jouer à ${activity.title}`}
      className={[
        "relative flex flex-col items-stretch overflow-hidden",
        "min-h-[200px] w-full",
        "rounded-[2rem]",
        "cursor-pointer select-none",
        "transition-all duration-200",
        "shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]",
        "active:scale-95 active:shadow-[0_3px_10px_rgba(0,0,0,0.35)]",
        "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
        "hover:scale-[1.05] hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)]",
      ].join(" ")}
      style={{ backgroundColor: activity.colors.primary }}
    >
      {/* Glass shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(150deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)",
          borderRadius: "inherit",
        }}
      />

      {/* Icon area */}
      <div className="relative flex-1 flex items-center justify-center py-7">
        <Icon
          name={activity.icon}
          size={104}
          className="select-none motion-safe:animate-[float_3s_ease-in-out_infinite] drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* Title band */}
      <div
        className="relative px-4 py-4 text-center"
        style={{
          background: `linear-gradient(to bottom, ${activity.colors.secondary}ee, ${activity.colors.secondary})`,
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <span className="font-masque font-bold text-white text-[1.35rem] leading-tight drop-shadow-sm block">
          {activity.title}
        </span>
      </div>
    </button>
  );
}
