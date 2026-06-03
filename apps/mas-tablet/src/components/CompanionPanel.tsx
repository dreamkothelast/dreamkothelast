import { useRef, useCallback, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Settings, Difficulty, Intensity, ImageTheme } from "../types";
import { BigButton } from "./BigButton";
import { Icon } from "./Icon";
import { OnlineTTSConfig } from "../hooks/useOnlineTTS";

interface CompanionPanelProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onClose: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  timerActive: boolean;
}

function Row({ label, icon, children }: { label: string; icon?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-brun/10 last:border-0">
      <span className="font-masque text-brun text-xl min-w-[200px] inline-flex items-center gap-2">
        {icon && <Icon name={icon} size={24} />}
        {label}
      </span>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

interface OptionButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: string;
  iconColor?: string;
}
function OptionButton({ label, active, onClick, icon, iconColor }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2",
        "min-w-[100px] min-h-[56px] px-4 py-2 rounded-mas border-3",
        "font-masque font-semibold text-lg text-brun",
        "transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-[5px] focus-visible:ring-soleil",
        active
          ? "bg-soleil border-brun/40 shadow-tuile-press scale-95"
          : "bg-creme border-brun/20 shadow-tuile hover:brightness-105",
      ].join(" ")}
      aria-pressed={active}
    >
      {icon && <Icon name={icon} size={22} style={iconColor ? { color: iconColor } : undefined} />}
      {label}
    </button>
  );
}

/**
 * Panneau accompagnant — ouvert par appui long (1,5 s) sur le coin bas-droit.
 * Réglages : minuteur, difficulté, volume, intensité visuelle, thème.
 */
export function CompanionPanel({
  settings,
  onUpdate,
  onClose,
  onStartTimer,
  onStopTimer,
  timerActive,
}: CompanionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const [apiKey, setApiKey]       = useState(() => OnlineTTSConfig.getKey());
  const [keyVisible, setKeyVisible] = useState(false);
  const [cacheCount, setCacheCount] = useState(() => OnlineTTSConfig.getCacheCount());

  const handleApiKeyChange = useCallback((val: string) => {
    setApiKey(val);
    OnlineTTSConfig.setKey(val);
  }, []);

  const handleClearCache = useCallback(() => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("mas-tts-v1-")) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
      setCacheCount(0);
    } catch {}
  }, []);

  const keyType = OnlineTTSConfig.keyType(apiKey);
  const isKeyValid = keyType !== "none";

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const DURATIONS: { label: string; value: number | null }[] = [
    { label: "Désactivé", value: null },
    { label: "5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
  ];

  const DIFFICULTIES: { label: string; value: Difficulty; color: string }[] = [
    { label: "Cause-effet", value: "cause-effet", color: "#43A047" },
    { label: "Facile", value: "facile", color: "#1E88E5" },
    { label: "Normal", value: "normal", color: "#F9A825" },
  ];

  const VOLUMES: { label: string; value: number; icon: string }[] = [
    { label: "Silence", value: 0, icon: "volume-mute" },
    { label: "Doux", value: 0.4, icon: "volume-low" },
    { label: "Normal", value: 0.7, icon: "volume-high" },
    { label: "Fort", value: 1, icon: "megaphone" },
  ];

  const THEMES: { label: string; value: ImageTheme; icon: string }[] = [
    { label: "Animaux", value: "animaux", icon: "dog" },
    { label: "Objets", value: "objets", icon: "teddy" },
    { label: "Nourriture", value: "nourriture", icon: "apple" },
    { label: "Instruments", value: "instruments", icon: "guitar" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brun/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Panneau accompagnant"
      onKeyDown={handleKey}
    >
      <div
        ref={panelRef}
        className={[
          "relative bg-creme rounded-mas-2xl border-4 border-brun/20",
          "shadow-[0_20px_60px_rgba(74,59,47,0.25)]",
          "w-[90vw] max-w-[820px] max-h-[90vh] overflow-y-auto",
          "p-8 flex flex-col gap-2",
          "animate-[slide-up_0.4s_cubic-bezier(0.34,1.56,0.64,1)]",
        ].join(" ")}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-masque font-bold text-brun text-4xl inline-flex items-center gap-3">
            <Icon name="gear" size={36} /> Réglages
          </h2>
          <button
            onClick={onClose}
            className={[
              "min-w-[56px] min-h-[56px] rounded-full",
              "bg-corail text-white font-masque font-bold text-2xl",
              "border-3 border-brun/20 shadow-tuile",
              "transition-all duration-200 hover:brightness-105 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-[5px] focus-visible:ring-soleil",
            ].join(" ")}
            aria-label="Fermer le panneau"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Minuteur de session */}
        <Row label="Minuteur" icon="clock">
          {DURATIONS.map((d) => (
            <OptionButton
              key={String(d.value)}
              label={d.label}
              active={settings.timerDuration === d.value}
              onClick={() => onUpdate({ timerDuration: d.value })}
            />
          ))}
        </Row>

        {/* Démarrer / arrêter le minuteur */}
        <Row label="">
          {timerActive ? (
            <BigButton onClick={onStopTimer} color="bg-corail-clair" className="px-6 py-3 text-lg inline-flex items-center gap-2">
              <Icon name="stop" size={22} /> Arrêter le minuteur
            </BigButton>
          ) : (
            <BigButton
              onClick={onStartTimer}
              color="bg-vert-clair"
              className="px-6 py-3 text-lg inline-flex items-center gap-2"
              disabled={!settings.timerDuration}
            >
              <Icon name="play" size={22} /> Démarrer le minuteur
            </BigButton>
          )}
        </Row>

        {/* Niveau de difficulté */}
        <Row label="Niveau" icon="target">
          {DIFFICULTIES.map((d) => (
            <OptionButton
              key={d.value}
              label={d.label}
              active={settings.difficulty === d.value}
              onClick={() => onUpdate({ difficulty: d.value })}
              icon="dot"
              iconColor={d.color}
            />
          ))}
        </Row>

        {/* Volume */}
        <Row label="Volume" icon="volume-high">
          {VOLUMES.map((v) => (
            <OptionButton
              key={v.value}
              label={v.label}
              active={settings.volume === v.value}
              onClick={() => onUpdate({ volume: v.value })}
              icon={v.icon}
            />
          ))}
        </Row>

        {/* Intensité visuelle */}
        <Row label="Intensité" icon="palette">
          <OptionButton
            label="Doux"
            active={settings.intensity === "doux"}
            onClick={() => onUpdate({ intensity: "doux" as Intensity })}
            icon="flower"
          />
          <OptionButton
            label="Vif"
            active={settings.intensity === "vif"}
            onClick={() => onUpdate({ intensity: "vif" as Intensity })}
            icon="sparkle"
          />
        </Row>

        {/* Animations réduites */}
        <Row label="Accessibilité" icon="accessibility">
          <OptionButton
            label="Animations réduites"
            active={settings.reducedMotion}
            onClick={() => onUpdate({ reducedMotion: !settings.reducedMotion })}
            icon="check"
          />
        </Row>

        {/* Thème d'images */}
        <Row label="Thème" icon="image">
          {THEMES.map((t) => (
            <OptionButton
              key={t.value}
              label={t.label}
              active={settings.theme === t.value}
              onClick={() => onUpdate({ theme: t.value })}
              icon={t.icon}
            />
          ))}
        </Row>

        {/* Voix IA (OpenAI TTS) */}
        <Row label="Voix IA" icon="mic">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type={keyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="sk-…  (clé API OpenAI)"
                spellCheck={false}
                autoComplete="off"
                className={[
                  "font-masque text-brun text-base px-4 py-3 rounded-mas border-3",
                  "bg-creme focus:outline-none focus:ring-[5px] focus:ring-soleil",
                  "min-w-[260px] flex-1",
                  isKeyValid ? "border-green-500/60" : "border-brun/20",
                ].join(" ")}
              />
              <button
                onClick={() => setKeyVisible(v => !v)}
                className="min-w-[56px] min-h-[56px] rounded-mas border-3 border-brun/20 bg-creme flex items-center justify-center active:scale-95 transition-all"
                aria-label={keyVisible ? "Masquer la clé" : "Afficher la clé"}
              >
                <Icon name={keyVisible ? "eye-off" : "eye"} size={28} />
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className={[
                "font-masque text-base px-3 py-1 rounded-full inline-flex items-center gap-2",
                isKeyValid
                  ? "bg-green-100 text-green-800"
                  : "bg-brun/10 text-brun/50",
              ].join(" ")}>
                {isKeyValid
                  ? (
                    <>
                      <Icon name="check" size={16} />
                      Voix IA active ({keyType === "huggingface" ? "HuggingFace" : "OpenAI"}) — {cacheCount} ligne{cacheCount !== 1 ? "s" : ""} en cache
                    </>
                  )
                  : "Sans token : voix Windows locale"}
              </span>

              {cacheCount > 0 && (
                <button
                  onClick={handleClearCache}
                  className="font-masque text-base text-brun/50 underline active:scale-95 transition-all inline-flex items-center gap-1"
                >
                  <Icon name="trash" size={16} /> Vider le cache
                </button>
              )}
            </div>

            <div className="font-masque text-brun/50 text-sm leading-snug max-w-[600px] flex flex-col gap-1">
              <p>
                <strong>Option gratuite</strong> — Créez un compte sur{" "}
                <span className="text-brun/70">huggingface.co</span> puis
                allez dans Settings → Access Tokens → New Token (lecture seule).
                Collez le token <span className="font-bold">hf_…</span> ici.
              </p>
              <p>
                L'audio est mis en cache : téléchargé une seule fois avec le WiFi,
                puis relu hors-ligne indéfiniment.
              </p>
            </div>
          </div>
        </Row>
      </div>
    </div>
  );
}
