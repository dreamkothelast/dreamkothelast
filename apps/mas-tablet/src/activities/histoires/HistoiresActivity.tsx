import { useState, useCallback, useEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import { useSpeech } from "../../hooks/useSpeech";
import type { ActivityProps } from "../../types";

// ── Données des histoires ─────────────────────────────────────────────────────

interface Page {
  emoji: string;
  text: string;
}

interface Histoire {
  id: string;
  title: string;
  emoji: string;
  primary: string;
  secondary: string;
  pages: Page[];
}

const HISTOIRES: Histoire[] = [
  {
    id: "petit-chat",
    title: "Le petit chat curieux",
    emoji: "🐱",
    primary: "#FF9800",
    secondary: "#E65100",
    pages: [
      { emoji: "🐱", text: "Il était une fois un petit chat tout doux qui s'appelait Minou." },
      { emoji: "🌳", text: "Un matin, Minou sortit dans le jardin. Le soleil brillait très fort." },
      { emoji: "🦋", text: "Il vit un joli papillon bleu qui dansait dans les fleurs." },
      { emoji: "🌸", text: "Minou voulut jouer avec lui. Il sauta, sauta, encore et encore !" },
      { emoji: "😺", text: "Le papillon se posa sur son nez. Minou ferma les yeux et ronronna." },
      { emoji: "❤️", text: "Et le soir, Minou s'endormit, heureux de sa belle journée. Bonne nuit, Minou !" },
    ],
  },
  {
    id: "etoile",
    title: "La petite étoile",
    emoji: "⭐",
    primary: "#3F51B5",
    secondary: "#1A237E",
    pages: [
      { emoji: "⭐", text: "Tout là-haut dans le ciel vivait une petite étoile qui brillait." },
      { emoji: "🌙", text: "La nuit, elle veillait sur tous les enfants endormis." },
      { emoji: "✨", text: "Elle envoyait sa douce lumière par la fenêtre, comme un câlin." },
      { emoji: "😴", text: "Quand un enfant avait peur, l'étoile clignait pour le rassurer." },
      { emoji: "🌟", text: "« Dors tranquille », disait-elle. « Je suis là, je te protège. »" },
      { emoji: "💙", text: "Et chaque matin, l'étoile s'endormait, contente d'avoir veillé. Doux rêves !" },
    ],
  },
  {
    id: "ours",
    title: "Le gros ours câlin",
    emoji: "🐻",
    primary: "#795548",
    secondary: "#3E2723",
    pages: [
      { emoji: "🐻", text: "Dans la forêt vivait un gros ours tout doux qui adorait les câlins." },
      { emoji: "🌲", text: "Chaque jour, il se promenait entre les grands arbres verts." },
      { emoji: "🍯", text: "Il aimait beaucoup le miel doré, sucré et délicieux." },
      { emoji: "🐝", text: "Les abeilles étaient ses amies. Elles bourdonnaient autour de lui." },
      { emoji: "🤗", text: "Le soir, l'ours faisait un grand câlin à tous ses amis de la forêt." },
      { emoji: "💤", text: "Puis il se blottissait dans sa grotte bien chaude pour dormir. À demain !" },
    ],
  },
  {
    id: "bateau",
    title: "Le petit bateau",
    emoji: "⛵",
    primary: "#00ACC1",
    secondary: "#006064",
    pages: [
      { emoji: "⛵", text: "Il y avait un petit bateau blanc qui voguait sur la mer bleue." },
      { emoji: "🌊", text: "Les vagues le berçaient doucement, comme un berceau." },
      { emoji: "🐬", text: "Des dauphins joueurs nageaient tout autour en sautant dans l'eau." },
      { emoji: "🐟", text: "Sous la mer, des poissons colorés brillaient comme des bijoux." },
      { emoji: "🌅", text: "Le soleil se couchait, peignant le ciel en rose et orange." },
      { emoji: "⚓", text: "Le petit bateau rentra au port, fatigué mais heureux. Quelle belle journée !" },
    ],
  },
];

const PAGE_PAUSE = 900; // pause après la narration avant d'avancer (ms)

export function HistoiresActivity({ volume = 0.7, reducedMotion, onCelebrate }: ActivityProps) {
  const { playClick, playTone } = useAudio(volume);
  const { available, parler, stop } = useSpeech(Math.min(1, volume + 0.25));

  const [view, setView] = useState<"list" | "reading">("list");
  const [story, setStory] = useState<Histoire | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  useEffect(() => () => { clearTimers(); stop(); }, [clearTimers, stop]);

  // Narre une page, puis avance automatiquement
  const narratePage = useCallback((s: Histoire, idx: number) => {
    const page = s.pages[idx];
    parler(page.text, {
      rate: 0.9,
      pitch: 1.05,
      onEnd: () => {
        advanceTimerRef.current = setTimeout(() => {
          const next = idx + 1;
          if (next >= s.pages.length) {
            playTone(523.2, 0.4, "sine", 1);
            setTimeout(onCelebrate, 500);
          } else {
            setPageIdx(next);
          }
        }, PAGE_PAUSE);
      },
    });
  }, [parler, playTone, onCelebrate]);

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
    stop();
    const next = pageIdx + dir;
    if (next < 0 || next >= story.pages.length) return;
    setPaused(false);
    setPageIdx(next);
  }, [story, pageIdx, clearTimers, stop]);

  const goBack = useCallback(() => {
    clearTimers();
    stop();
    setView("list");
    setStory(null);
  }, [clearTimers, stop]);

  // ── Vue liste ─────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-8 py-6 bg-gradient-to-b from-[#FFF3E0] to-[#FFF8F0]">
        <div className="text-center">
          <div className="text-7xl mb-2">📖</div>
          <h2 className="font-masque font-bold text-brun text-4xl">Histoires</h2>
          <p className="font-masque text-brun/60 text-xl mt-1">
            {available
              ? "Choisis une histoire à écouter 👇"
              : "Choisis une histoire à lire 👇"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-[900px]">
          {HISTOIRES.map((s) => (
            <button
              key={s.id}
              onClick={() => openStory(s)}
              className={[
                "flex items-center gap-5 px-6 py-6 rounded-[2rem]",
                "shadow-[0_6px_20px_rgba(0,0,0,0.25)]",
                "cursor-pointer select-none text-left",
                "transition-all duration-200 hover:scale-[1.03] active:scale-95",
                "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
              ].join(" ")}
              style={{ backgroundColor: s.primary }}
            >
              <span className="text-6xl drop-shadow-lg flex-shrink-0" role="img">{s.emoji}</span>
              <span className="font-masque font-bold text-white text-2xl leading-tight">
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {!available && (
          <p className="font-masque text-brun/40 text-base text-center max-w-[600px]">
            💡 Pour activer la voix qui raconte, ajoutez une voix française dans
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
      <div className="flex items-center justify-between px-8 py-4 gap-4">
        <button
          onClick={goBack}
          className="font-masque font-bold text-brun text-xl px-6 py-3 rounded-[1.5rem] bg-white/70 hover:bg-white active:scale-95 transition-all min-w-[120px] min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img">{story.emoji}</span>
          <span className="font-masque font-bold text-brun text-2xl">{story.title}</span>
        </div>

        {available ? (
          <button
            onClick={togglePause}
            className="font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] min-w-[120px] min-h-[56px] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
            style={{ backgroundColor: story.primary }}
          >
            {paused ? "▶ Lire" : "⏸ Pause"}
          </button>
        ) : (
          <div className="min-w-[120px]" />
        )}
      </div>

      {/* Illustration + texte */}
      <div className="flex-1 flex flex-col items-center justify-center px-12 gap-8">
        <div
          className={reducedMotion ? "" : "animate-[slide-up_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"}
          key={`emoji-${pageIdx}`}
        >
          <span className="text-[clamp(7rem,18vw,14rem)] leading-none drop-shadow-2xl" role="img">
            {page.emoji}
          </span>
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
      <div className="flex items-center justify-center gap-6 pb-8">
        <button
          onClick={() => goPage(-1)}
          disabled={pageIdx === 0}
          className="font-masque font-bold text-brun text-2xl w-[80px] h-[80px] rounded-full bg-white/80 hover:bg-white active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
          aria-label="Page précédente"
        >
          ←
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
          className="font-masque font-bold text-brun text-2xl w-[80px] h-[80px] rounded-full bg-white/80 hover:bg-white active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brun"
          aria-label="Page suivante"
        >
          →
        </button>
      </div>
    </div>
  );
}
