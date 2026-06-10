import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "legacy"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/engine/**/*.ts", "src/data/**/*.ts"],
    rules: {
      // L'engine doit rester pur : aucune dépendance UI/DOM.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "react/*", "react-dom/*", "../render/*", "../ui/*", "*.css"],
              message:
                "src/engine et src/data doivent rester purs (zéro dépendance UI/DOM/rendu). Voir ARCHITECTURE.md.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "window", message: "Engine pur : pas de DOM." },
        { name: "document", message: "Engine pur : pas de DOM." },
        { name: "localStorage", message: "Engine pur : la persistance vit dans src/ui." },
      ],
    },
  },
);
