import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Chemins relatifs : fonctionne dans Tauri ET en ouverture directe file://
  base: "./",

  // Tauri attend le dev-server sur ce port
  server: {
    port: 5173,
    strictPort: true,
    host: "localhost",
  },

  // Pas de hash dans les noms de fichiers en mode dev (facilite le débogage)
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  // Évite tout appel réseau implicite dans le build
  define: {
    __APP_VERSION__: JSON.stringify("0.1.0"),
  },
}));
