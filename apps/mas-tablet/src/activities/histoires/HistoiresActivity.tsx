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
  {
    id: "grenouille",
    title: "La petite grenouille verte",
    emoji: "🐸",
    primary: "#43A047",
    secondary: "#1B5E20",
    pages: [
      { emoji: "🐸", text: "Dans la mare vivait une toute petite grenouille bien verte et bien douce." },
      { emoji: "🌿", text: "Chaque matin, elle sautait de nénuphar en nénuphar en chantant." },
      { emoji: "🦟", text: "Elle attrapait les moustiques avec sa longue et rapide langue rose." },
      { emoji: "☔", text: "Quand il pleuvait, elle levait la tête et criait : « Coâ, coâ, coâ ! »" },
      { emoji: "🌞", text: "Et quand le soleil revenait, elle s'étirait doucement sur sa grande feuille." },
      { emoji: "💚", text: "La petite grenouille était heureuse, reine de sa jolie mare. Coâ !" },
    ],
  },
  {
    id: "lapin",
    title: "Le lapin du jardin",
    emoji: "🐰",
    primary: "#F06292",
    secondary: "#880E4F",
    pages: [
      { emoji: "🐰", text: "Dans le grand jardin vivait un lapin aux longues oreilles blanches et douces." },
      { emoji: "🥕", text: "Il adorait grignoter les carottes oranges et les feuilles de salade." },
      { emoji: "🌺", text: "Il courait parmi les fleurs colorées en faisant de grands bonds joyeux." },
      { emoji: "🐦", text: "Les oiseaux chantaient et le lapin écoutait, les oreilles bien dressées." },
      { emoji: "🌙", text: "Le soir, il rentrait dans son terrier bien douillet et bien chaud." },
      { emoji: "🐾", text: "Bonne nuit, petit lapin ! Demain, de nouvelles aventures t'attendent !" },
    ],
  },
  {
    id: "coccinelle",
    title: "La coccinelle voyageuse",
    emoji: "🐞",
    primary: "#E53935",
    secondary: "#B71C1C",
    pages: [
      { emoji: "🐞", text: "Il y avait une belle coccinelle rouge avec sept points noirs sur le dos." },
      { emoji: "🌻", text: "Elle aimait voler de fleur en fleur dans le jardin ensoleillé." },
      { emoji: "☁️", text: "Un jour, le vent l'emporta très loin, très haut au-dessus des nuages." },
      { emoji: "🌈", text: "Elle vit un magnifique arc-en-ciel et des prairies dorées à perte de vue." },
      { emoji: "🏠", text: "Mais son cœur lui disait : « Rentre chez toi, c'est là que tu es heureuse. »" },
      { emoji: "🌺", text: "La coccinelle revint au jardin, plus heureuse que jamais d'être à la maison !" },
    ],
  },
  {
    id: "nuage",
    title: "Le petit nuage blanc",
    emoji: "☁️",
    primary: "#5C6BC0",
    secondary: "#283593",
    pages: [
      { emoji: "☁️", text: "Haut dans le ciel bleu flottait un tout petit nuage blanc et doux." },
      { emoji: "🌬️", text: "Le vent le promenait doucement au-dessus des maisons et des prés verts." },
      { emoji: "🌧️", text: "Quand les fleurs avaient soif, le nuage leur envoyait de la pluie douce." },
      { emoji: "🌸", text: "Les fleurs levaient la tête, souriaient et disaient merci au petit nuage." },
      { emoji: "🌅", text: "Au coucher du soleil, le nuage devenait rose, puis orange, puis violet." },
      { emoji: "⭐", text: "Et la nuit, le nuage se reposait, bercé tendrement par les étoiles. Dors bien !" },
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
      <div
        className="flex flex-col items-center justify-start w-full h-full gap-6 px-8 py-6 overflow-y-auto"
        style={{
          background: "linear-gradient(160deg, #4a148c 0%, #6a1b9a 40%, #7b1fa2 100%)",
        }}
      >
        <div className="text-center pt-2">
          <div className="text-6xl mb-2">📖</div>
          <h2 className="font-masque font-bold text-white text-4xl drop-shadow-lg">Histoires</h2>
          <p className="font-masque text-white/70 text-xl mt-1">
            {available
              ? "Choisis une histoire à écouter 📖"
              : "Choisis une histoire à lire 📖"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 w-full max-w-[1000px] pb-4">
          {HISTOIRES.map((s) => (
            <button
              key={s.id}
              onClick={() => openStory(s)}
              className={[
                "flex items-center gap-4 px-6 py-5 rounded-[2rem] relative overflow-hidden",
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
              <span className="relative text-5xl drop-shadow-lg flex-shrink-0" role="img">{s.emoji}</span>
              <span className="relative font-masque font-bold text-white text-xl leading-tight">
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {!available && (
          <p className="font-masque text-white/50 text-base text-center max-w-[600px] pb-4">
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
