import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette MAS Tablette
        creme: "#FFF6E9",
        ciel: "#6EC6F0",
        soleil: "#FFD23F",
        corail: "#FF7A6B",
        vert: "#8FD94B",
        brun: "#4A3B2F",
        // Nuances supplémentaires
        "ciel-clair": "#C5E9F8",
        "ciel-fonce": "#3DA8D8",
        "corail-clair": "#FFB5AD",
        "soleil-clair": "#FFE88C",
        "vert-clair": "#C4EE8A",
      },
      fontFamily: {
        // Fredoka self-hosted (voir src/assets/fonts/), fallback système
        masque: ["Fredoka", "Baloo 2", "Quicksand", "Comic Sans MS", "cursive"],
      },
      borderRadius: {
        mas: "1.5rem",
        "mas-xl": "2.5rem",
        "mas-2xl": "3rem",
      },
      boxShadow: {
        // Ombres douces type cel-shading
        tuile: "0 6px 0 rgba(74,59,47,0.15), 0 10px 20px rgba(74,59,47,0.1)",
        "tuile-press": "0 2px 0 rgba(74,59,47,0.15), 0 4px 8px rgba(74,59,47,0.1)",
        focus: "0 0 0 5px #FFD23F, 0 0 0 8px #4A3B2F",
      },
      animation: {
        bounce: "mas-bounce 0.6s ease-in-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        celebration: "celebration 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "mas-bounce": {
          "0%, 100%": { transform: "scaleY(1)" },
          "30%": { transform: "scaleY(0.88) scaleX(1.08)" },
          "60%": { transform: "scaleY(1.12) scaleX(0.94)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wiggle: {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-8deg) scale(1.1)" },
          "75%": { transform: "rotate(8deg) scale(1.1)" },
          "100%": { transform: "rotate(0deg) scale(1)" },
        },
        celebration: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
