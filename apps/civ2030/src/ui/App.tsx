import { lazy, Suspense, useState } from "react";
import { ENGINE_VERSION, turnToDate } from "../engine";

// La V2 god-sim reste jouable en attendant la Phase 1 (carte hex 4X).
const WorldSim2030 = lazy(() => import("../../legacy/worldsim-v2.jsx"));

export function App() {
  const [showV2, setShowV2] = useState(false);
  const start = turnToDate(1);

  if (showV2) {
    return (
      <>
        <button
          onClick={() => setShowV2(false)}
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 100,
            padding: "6px 12px",
            background: "#2A2A2A",
            color: "#F5F1E8",
            border: "none",
            borderRadius: 4,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Quitter la V2
        </button>
        <Suspense
          fallback={<p style={{ padding: "2rem", opacity: 0.6 }}>Chargement de World Sim 2030…</p>}
        >
          <WorldSim2030 />
        </Suspense>
      </>
    );
  }

  return (
    <main
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      <h1 style={{ fontWeight: 600, letterSpacing: "0.02em" }}>Civilization 2030</h1>
      <p style={{ opacity: 0.7 }}>
        Phase 0 — cadrage terminé. Engine v{ENGINE_VERSION}, départ {start.label}.
      </p>
      <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>La carte hexagonale 4X arrive en Phase 1.</p>
      <button
        onClick={() => setShowV2(true)}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          background: "#2A2A2A",
          color: "#F5F1E8",
          border: "none",
          borderRadius: 4,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        ▶ Jouer à World Sim 2030 (V2 god-sim)
      </button>
    </main>
  );
}
