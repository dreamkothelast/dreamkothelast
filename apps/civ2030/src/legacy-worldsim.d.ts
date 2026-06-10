// Le single-file legacy est du JSX non typé, hors périmètre tsc (voir legacy/README.md).
declare module "*/legacy/worldsim-v2.jsx" {
  const WorldSim2030: import("react").ComponentType;
  export default WorldSim2030;
}
