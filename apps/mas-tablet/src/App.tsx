import { useState, useCallback } from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { GameShell } from "./components/GameShell";
import { CelebrationScreen } from "./components/CelebrationScreen";
import { CompanionPanel } from "./components/CompanionPanel";
import { useSettings } from "./hooks/useSettings";
import { useSessionTimer } from "./hooks/useSessionTimer";
import { useAudio } from "./hooks/useAudio";
import { useBackButton } from "./hooks/useBackButton";
import { ACTIVITIES } from "./registry";
import type { Screen } from "./types";

/**
 * Application MAS Tablette — machine d'état principale.
 *
 * Écrans : home → activity | celebration → home
 * Overlay : companion (panneau accompagnant, toujours accessible)
 *
 * 100 % hors-ligne : aucun appel réseau, aucune dépendance externe à l'exécution.
 */
export default function App() {
  const { settings, updateSettings } = useSettings();
  const { playPreAlert, playCelebration } = useAudio(settings.volume);

  // Machine d'état de navigation
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const [companionOpen, setCompanionOpen] = useState(false);

  // Navigation
  const goHome = useCallback(() => setScreen({ type: "home" }), []);

  const openActivity = useCallback((id: string) => {
    setScreen({ type: "activity", id });
  }, []);

  // Bouton « retour » Android : ferme le panneau ouvert, sinon revient à
  // l'accueil. Sans effet sur la version Windows (pas de bouton retour).
  // Le hook rappelle toujours la version la plus récente de ce callback,
  // qui lit donc l'état courant directement.
  useBackButton(() => {
    if (companionOpen) {
      setCompanionOpen(false);
    } else if (screen.type !== "home") {
      goHome();
    }
  });

  const openCelebration = useCallback(() => {
    playCelebration();
    const currentId = screen.type === "activity" ? screen.id : "sensory";
    setScreen({ type: "celebration", fromActivityId: currentId });
  }, [screen, playCelebration]);

  // Minuteur de session
  const { phase, label, isActive, start, stop } = useSessionTimer(
    settings.timerDuration,
    () => playPreAlert(),
    () => {
      // Fin de session → écran de félicitations
      openCelebration();
    }
  );

  // Activité courante
  const currentActivity =
    screen.type === "activity"
      ? ACTIVITIES.find((a) => a.id === screen.id) ?? null
      : null;

  const ActivityComponent = currentActivity?.component ?? null;

  return (
    <>
      {/* ── Écran d'accueil ─────────────────────────────────────────── */}
      {screen.type === "home" && (
        <GameShell
          onHome={goHome}
          onOpenCompanion={() => setCompanionOpen(true)}
          timerLabel={label}
          timerPhase={phase}
          timerActive={isActive}
          bgColor="bg-creme"
          showHome={false}
        >
          <HomeScreen
            onSelectActivity={openActivity}
            volume={settings.volume}
            reducedMotion={settings.reducedMotion}
          />
        </GameShell>
      )}

      {/* ── Activité en cours ──────────────────────────────────────── */}
      {screen.type === "activity" && ActivityComponent && (
        <GameShell
          onHome={goHome}
          onOpenCompanion={() => setCompanionOpen(true)}
          timerLabel={label}
          timerPhase={phase}
          timerActive={isActive}
          bgColor="bg-creme"
          reserveControls
        >
          <ActivityComponent
            difficulty={settings.difficulty}
            intensity={settings.intensity}
            reducedMotion={settings.reducedMotion}
            theme={settings.theme}
            onCelebrate={openCelebration}
            onHome={goHome}
            volume={settings.volume}
          />
        </GameShell>
      )}

      {/* ── Écran de célébration ───────────────────────────────────── */}
      {screen.type === "celebration" && (
        <CelebrationScreen
          onHome={goHome}
          onContinue={
            screen.fromActivityId
              ? () => openActivity(screen.fromActivityId)
              : undefined
          }
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* ── Panneau accompagnant (overlay) ─────────────────────────── */}
      {companionOpen && (
        <CompanionPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setCompanionOpen(false)}
          onStartTimer={() => {
            start();
            setCompanionOpen(false);
          }}
          onStopTimer={() => {
            stop();
            setCompanionOpen(false);
          }}
          timerActive={isActive}
        />
      )}
    </>
  );
}
