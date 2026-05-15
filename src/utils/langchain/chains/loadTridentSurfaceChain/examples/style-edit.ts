// Surface examples for the style-edit ability: the user wants charites to
// edit the MapLibre style YAML files (e.g. "remove buildings", "color borders
// yellow"). Included only when OpenAI backend is active.
//
// NOTE: the downstream charites flow is not yet wired into page.tsx
// (see ADR-0001 Phase 3 / 4). Until then this set is intentionally empty so
// the surface chain never classifies an input as style-edit.

export const surfaceStyleEditExamples: Array<{
  input: string;
  output: string;
}> = [];
