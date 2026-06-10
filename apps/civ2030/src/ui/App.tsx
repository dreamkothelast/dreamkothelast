import { ENGINE_VERSION, turnToDate } from "../engine";

export function App() {
  const start = turnToDate(1);
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
      <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>La carte arrive en Phase 1.</p>
    </main>
  );
}
