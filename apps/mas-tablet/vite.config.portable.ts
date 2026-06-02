import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Config de build PORTABLE — tout est inliné dans un seul index.html.
 * Permet le double-clic direct (file://) sans serveur ni Rust.
 * Usage : npm run build:portable
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify("0.1.0"),
  },
  build: {
    outDir: "dist-portable",
    assetsInlineLimit: 100000000,   // inline TOUT (polices, images)
    cssCodeSplit: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
