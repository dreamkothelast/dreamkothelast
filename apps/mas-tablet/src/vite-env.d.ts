/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Nom affiché de l'application — voir src/appName.ts. */
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
