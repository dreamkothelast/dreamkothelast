import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Point d'entrée unique — aucun StrictMode pour éviter les double-renders
// qui perturbent les AudioContext (politique autoplay).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
