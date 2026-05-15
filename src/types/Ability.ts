// Surface-layer classification output. Some values are only emitted when the
// inference backend is OpenAI (see surface examples composition in
// loadTridentSurfaceChain/examples/index.ts).
export type Ability =
  | "apology"
  | "ask-more"
  | "overpass-api"
  | "base-style-switch" // OpenAI-only: change to a preset map style
  | "style-edit"; // OpenAI-only: charites-driven YAML style edit (not yet wired)
