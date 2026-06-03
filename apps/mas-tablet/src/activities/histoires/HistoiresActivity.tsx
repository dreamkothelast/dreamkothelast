import { useState, useCallback, useEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import { useSpeech } from "../../hooks/useSpeech";
import { useOnlineTTS } from "../../hooks/useOnlineTTS";
import { Icon } from "../../components/Icon";
import voiceContent from "../../data/voiceContent.json";
import type { ActivityProps } from "../../types";

// ── Données des histoires (source unique partagée avec le générateur de voix) ──

interface Page {
  icon: string;
  text: string;
}

interface Histoire {
  id: string;
  title: string;
  icon: string;
  primary: string;
  secondary: string;
  pages: Page[];
}

const HISTOIRES: Histoire[] = voiceContent.histoires;

const PAGE_PAUSE = 900; // pause après la narration avant d'avancer (ms)

export function HistoiresActivity({ volume = 0.7, reducedMotion, onCelebrate }: ActivityProps) {
  const { playClick, playTone } = useAudio(volume);
  const { available, parler, stop: stopSpeech } = useSpeech(Math.min(1, volume + 0.25));
  const { speak: onlineSpeak, playBundled, stop: onlineStop, isConfigured } = useOnlineTTS(Math.min(1, volume + 0.25));

  const [view, setView] = useState<"list" | "reading">("list");
  const [story, setStory] = useState<Histoire | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  const stopVoice = useCallback(() => {
    onlineStop();
    stopSpeech();
  }, [onlineStop, stopSpeech]);

  useEffect(() => () => { clearTimers(); stopVoice(); }, [clearTimers, stopVoice]);

  // Narre une page.
  // Priorité : 1) clip Piper embarqué (naturel, hors-ligne) 2) voix IA en ligne
  //            3) voix Windows  4) avance directe
  const narratePage = useCallback((s: Histoire, idx: number) => {
    const page = s.pages[idx];
    const onEnd = () => {
      advanceTimerRef.current = setTimeout(() => {
        const next = idx + 1;
        if (next >= s.pages.length) {
          playTone(523.2, 0.4, "sine", 1);
          setTimeout(onCelebrate, 500);
        } else {
          setPageIdx(next);
        }
      }, PAGE_PAUSE);
    };
    const voiceFallback = () => {
      if (isConfigured()) {
        onlineSpeak(page.text, { onEnd, speed: 0.9 }).then(ok => {
          if (!ok) { available ? parler(page.text, { rate: 0.9, pitch: 1.05, onEnd }) : onEnd(); }
        });
      } else if (available) {
        parler(page.text, { rate: 0.9, pitch: 1.05, onEnd });
      } else {
        onEnd();
      }
    };

    playBundled(page.text, { onEnd }).then(ok => { if (!ok) voiceFallback(); });
  }, [available, parler, onlineSpeak, playBundled, isConfigured, playTone, onCelebrate]);

  // Quand la page change pendant la lecture, narre-la
  useEffect(() => {
    if (view !== "reading" || !story || paused) return;
    narratePage(story, pageIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, story, pageIdx]);

  const openStory = useCallback((s: Histoire) => {
    playClick();
    setStory(s);
    setPageIdx(0);
    setPaused(false);
    setView("reading");
  }, [playClick]);

  const togglePause = useCallback(() => {
    if (!story) return;
    if (paused) {
      setPaused(false);
      narratePage(story, pageIdx);
    } else {
      setPaused(true);
      clearTimers();
      stop();
    }
  }, [paused, story, pageIdx, narratePage, clearTimers, stop]);

  const goPage = useCallback((dir: -1 | 1) => {
    if (!story) return;
    clearTimers();
    stopVoice();
    const next = pageIdx + dir;
    if (next < 0 || next >= story.pages.length) return;
    setPaused(false);
    setPageIdx(next);
  }, [story, pageIdx, clearTimers, stop]);

  const goBack = useCallback(() => {
    clearTimers();
    stopVoice();
    setView("list");
    setStory(null);
  }, [clearTimers, stop]);

  // ── Vue liste ─────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div
        className="mas-scroll flex flex-col items-center justify-start w-full h-full gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-6"
        style={{
          background: "linear-gradient(160deg, #4a148c 0%, #6a1b9a 40%, #7b1fa2 100%)",
        }}
      >
        <div className="text-center pt-2 flex flex-col items-center">
          <Icon name="book" size={64} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow-lg" />
          <h2 className="font-masque font-bold text-white text-2xl sm:text-4xl drop-shadow-lg">Histoires</h2>
          <p className="font-masque text-white/70 text-base sm:text-xl mt-1 text-center">
            {available
              ? "Choisis une histoire à écouter"
              : "Choisis une histoire à lire"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 w-full max-w-[1000px] pb-4">
          {HISTOIRES.map((s) => (
            <button
              key={s.id}
              onClick={() => openStory(s)}
              className={[
                "flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] relative overflow-hidden",
                "shadow-[0_6px_20px_rgba(0,0,0,0.4)]",
                "cursor-pointer select-none text-left",
                "transition-all duration-200 hover:scale-[1.03] active:scale-95",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-white",
              ].join(" ")}
              style={{ backgroundColor: s.primary }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
                  borderRadius: "inherit",
                }}
              />
              <Icon name={s.icon} size={64} className="w-12 h-12 sm:w-16 sm:h-16 relative drop-shadow-lg flex-shrink-0" />
              <span className="relative font-masque font-bold text-white text-lg sm:text-xl leading-tight">
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {!available && (
          <p className="font-masque text-white/50 text-base text-center max-w-[600px] pb-4">
            Pour activer la voix qui raconte, ajoutez une voix française dans
            Windows (Paramètres → Heure et langue → Voix).
          </p>
        )}
      </div>
    );
  }

  // ── Vue lecture ───────────────────────────────────────────────────────────
  if (!story) return null;
  const page = story.pages[pageIdx];

  return (
    <div
      className="flex flex-col w-full h-full select-none"
      style={{ background: `linear-gradient(165deg, ${story.primary}26 0%, ${story.primary}0a 100%)` }}
    >
      {/* Barre du haut */}
      <div className="flex items-center justify-between px-3 sm:px-8 py-3 sm:py-4 gap-2 sm:gap-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 font-masque font-bold text-brun text-lg sm:text-xl px-4 sm:px-6 py-3 rounded-[1.5rem] bg-white/70 hover:bg-white active:scale-95 transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
        >
          <Icon name="arrow-left" size={26} /> <span className="hidden sm:inline">Retour</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Icon name={story.icon} size={40} className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
          <span className="font-masque font-bold text-brun text-lg sm:text-2xl truncate">{story.title}</span>
        </div>

        {available ? (
          <button
            onClick={togglePause}
            className="flex items-center justify-center gap-2 font-masque font-bold text-white text-lg sm:text-xl px-4 sm:px-6 py-3 rounded-[1.5rem] min-h-[56px] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            style={{ backgroundColor: story.primary }}
          >
            <Icon name={paused ? "play" : "pause"} size={24} /> <span className="hidden sm:inline">{paused ? "Lire" : "Pause"}</span>
          </button>
        ) : (
          <div className="w-12 sm:min-w-[120px]" />
        )}
      </div>

      {/* Illustration + texte */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-12 gap-4 sm:gap-8">
        <div
          className={reducedMotion ? "" : "animate-[slide-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"}
          key={`icon-${pageIdx}`}
        >
          <Icon name={page.icon} size={220} className="drop-shadow-2xl" style={{ width: "clamp(7rem,18vw,14rem)", height: "auto" }} />
        </div>

        <p
          key={`text-${pageIdx}`}
          className={[
            "font-masque font-bold text-brun text-center leading-snug max-w-[1100px]",
            "text-[clamp(2rem,4.5vw,3.5rem)]",
            reducedMotion ? "" : "animate-[slide-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)]",
          ].join(" ")}
        >
          {page.text}
        </p>
      </div>

      {/* Navigation pages */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 pb-5 sm:pb-8">
        <button
          onClick={() => goPage(-1)}
          disabled={pageIdx === 0}
          className="flex items-center justify-center text-brun w-16 h-16 sm:w-[80px] sm:h-[80px] rounded-full bg-white/80 hover:bg-white active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
          aria-label="Page précédente"
        >
          <Icon name="arrow-left" size={38} />
        </button>

        {/* Points de progression */}
        <div className="flex items-center gap-3">
          {story.pages.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === pageIdx ? 22 : 12,
                height: i === pageIdx ? 22 : 12,
                backgroundColor: i <= pageIdx ? story.primary : `${story.primary}40`,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => goPage(1)}
          disabled={pageIdx === story.pages.length - 1}
          className="flex items-center justify-center text-brun w-16 h-16 sm:w-[80px] sm:h-[80px] rounded-full bg-white/80 hover:bg-white active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
          aria-label="Page suivante"
        >
          <Icon name="arrow-right" size={38} />
        </button>
      </div>
    </div>
  );
}
