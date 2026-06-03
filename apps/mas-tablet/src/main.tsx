import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { APP_NAME } from "./appName";
import "./index.css";

// Titre de l'onglet / fenêtre selon la version buildée (Évelio ou MAS Tablette)
document.title = APP_NAME;

// Point d'entrée unique — aucun StrictMode pour éviter les double-renders
// qui perturbent les AudioContext (politique autoplay).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
