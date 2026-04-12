# ADR: Introduce a `TridentFlowGraph` Planning Layer Inspired by Spatial-Agent

- Status: Proposed
- Date: 2026-04-12

## Context

TRIDENT already has a practical end-to-end pipeline for map generation, but its planning contract is still a flat LLM-generated text format.

This ADR uses the term **GeoFlow Graph** in the sense used by the Spatial-Agent paper (`arXiv:2601.16965`): a typed geospatial reasoning graph grounded in GIScience concepts and functional roles.

It does **not** refer to the unrelated `GeoFlow` / `Flow` AOV workflow framework from `arXiv:2508.04719`.

To avoid that naming collision in TRIDENT's own code and docs, this ADR proposes the local name `TridentFlowGraph`.

The current execution path is:

1. `POST /api/ai/surface` selects an ability from conversation history.
2. `POST /api/ai/inner` generates a text block containing `TitleOfMap`, `Area`, `AreaWithConcern`, `EmojiForConcern`, `ColorForConcern`, and `ConfirmHelpful`.
3. `parseInnerResJson()` extracts those lines by string matching.
4. The client fans out each `Area` / `AreaWithConcern` line to `POST /api/ai/deep`.
5. The Deep layer converts each line into an Overpass query.
6. The client executes Overpass, converts the result with `osmtogeojson`, and renders it.

This architecture is visible in:

- `src/app/page.tsx`
- `src/app/api/ai/surface/route.ts`
- `src/app/api/ai/inner/route.ts`
- `src/app/api/ai/deep/route.ts`
- `src/utils/trident/parseInnerResJson.ts`
- `src/utils/langchain/chains/loadTridentInnerChain/prompt.ts`
- `src/utils/langchain/chains/loadTridentDeepChain/index.ts`

There are also older extractor chains that already point toward more structured intermediate representations:

- `src/utils/langchain/chains/loadAreaExtractorChain/index.ts`
- `src/utils/langchain/chains/loadConcernPlaceExtractorChain/index.ts`
- `src/utils/langchain/chains/loadAreaWithConcernExtractorChain/index.ts`

The current flat text contract is workable for simple queries, but it has structural limits:

- it cannot explicitly represent multi-step spatial reasoning
- it cannot be statically validated before Overpass execution
- it relies on brittle line-based parsing instead of typed contracts
- it makes debugging and caching harder than necessary
- it forces the Inner layer to mix user intent, planning, styling, and execution hints in one prompt output

This becomes a bottleneck for Spatial-Agent-style graph planning tasks such as:

- derive one region from another
- express ordered spatial operations
- validate whether a plan is executable before calling Overpass
- preserve plan structure for debugging, replay, and evaluation

## Decision

TRIDENT should introduce a new planning layer called `TridentFlowGraph`, inspired by Spatial-Agent's GeoFlow Graph formulation, **above** the existing `AreaWithConcern` execution contract.

The key decision is:

- keep `AreaWithConcern` as the initial execution IR
- add `TridentFlowGraph` as a new validated planning IR upstream
- compile `TridentFlowGraph` into today's `Area` / `AreaWithConcern` lines during the first migration phase

In other words, `TridentFlowGraph` is not a full replacement for the current Deep layer on day one. It is a new, typed planning layer that feeds the existing downstream pipeline.

## Why this direction

This is the lowest-risk path that matches the current codebase.

It preserves:

- the current Surface ability selection
- the current Deep prompt and Overpass generation path
- the current client rendering flow in `src/app/page.tsx`
- the current styling contract built around concern names

It adds:

- a typed graph plan
- static validation before execution
- a compiler step from graph to legacy execution units
- a path to later replace the legacy execution contract without breaking the UI first

## Current Architecture Findings

### 1. TRIDENT is already a three-step planner/executor, but only implicitly

The existing `surface -> inner -> deep` architecture already separates:

- ability selection
- map planning
- geospatial execution

However, the planning layer is encoded as prompt text rather than a typed IR.

### 2. `AreaWithConcern` is the real execution boundary today

The decisive handoff is not the entire Inner output. It is the subset extracted by `parseInnerResJson()`:

- `Area: ...`
- `AreaWithConcern: ...`

Those lines are what the Deep layer actually consumes.

That means `TridentFlowGraph` should first target the boundary **before** those lines are produced.

### 3. Styling is concern-driven, not graph-driven

The current UI styling contract uses concern names to look up:

- emoji
- color

This happens in `parseInnerResJson()` and then in the client state stored by `page.tsx`.

`TridentFlowGraph` compilation must therefore preserve concern identity when compiling to the existing render path.

### 4. Existing tests are too sparse and too LLM-dependent

Current tests mostly verify:

- the Surface route responds
- the Surface chain can be instantiated

They do not currently give deterministic coverage for:

- inner parsing
- execution plan validity
- multi-step spatial planning
- compilation to `AreaWithConcern`

This migration must add deterministic unit tests first, rather than relying on live LLM outputs.

## Proposed Architecture

### New IR: `TridentFlowGraph`

Introduce a typed planning graph with:

- typed nodes
- typed edges
- explicit functional roles
- explicit ordering/dependency information
- static validation before execution

The type should mirror Spatial-Agent's GeoFlow Graph idea closely enough to preserve its semantic benefits, but execution support can be phased in gradually.

Initial shape:

```ts
type TridentFlowGraph = {
  version: "v1";
  nodes: TridentFlowNode[];
  edges: TridentFlowEdge[];
  outputs: string[];
  metadata?: {
    title?: string;
    confirmMessage?: string;
    styles?: Record<string, { emoji?: string; color?: string }>;
  };
};
```

The important point is not the exact field names. The important point is that the planning contract becomes typed and validator-friendly.

### New compile boundary

Phase 1 adds a compiler:

`TridentFlowGraph -> LegacyExecutionPlan`

Where `LegacyExecutionPlan` is effectively:

- `Area[]`
- `AreaWithConcern[]`
- style metadata
- title / confirm message

This keeps the Deep layer unchanged at first.

### New validation boundary

Before any graph is compiled or executed, validate:

- graph well-formedness
- role compatibility
- missing dependencies
- unsupported node/edge combinations
- output reachability

The first implementation should explicitly aim for the two most important checks:

- structural graph validity
- execution-compatibility with the current `AreaWithConcern` compiler

The remaining graph validations can be phased in after that.

## Migration Plan

### Phase 0: Stabilize current contracts with deterministic tests

Before introducing `TridentFlowGraph` types, add tests for current behavior:

- `parseInnerResJson()`
- `parseSurfaceResJson()`
- `AreaWithConcern` extraction behavior from representative Inner outputs

This is necessary because the current planning contract is string-based and brittle. We need a locked baseline before refactoring.

Suggested test files:

- `src/utils/trident/parseInnerResJson.test.ts`
- `src/utils/trident/parseSurfaceResJson.test.ts`

### Phase 1: Introduce typed graph definitions and validators

Add:

- `src/types/TridentFlowGraph.ts`
- `src/lib/geoflow/validateTridentFlowGraph.ts`
- `src/lib/geoflow/validateTridentFlowGraph.test.ts`

The first validator release should support:

- unique node ids
- valid edge references
- acyclic execution ordering
- required-role presence for executable outputs
- rejection of graph constructs that cannot yet compile to `AreaWithConcern`

This phase should be fully deterministic and should not require an LLM.

### Phase 2: Add a compiler from graph to legacy execution units

Add:

- `src/lib/geoflow/compileFlowGraphToLegacyPlan.ts`
- `src/lib/geoflow/compileFlowGraphToLegacyPlan.test.ts`

This compiler should output a typed structure that directly replaces what `parseInnerResJson()` currently assembles:

- title
- confirm message
- styles
- lines or objects representing `Area` / `AreaWithConcern`

The first compiler should support only the subset of Spatial-Agent-style graph semantics that can cleanly map to today's Deep layer.

### Phase 3: Add a planner chain that emits graph JSON

Add a new chain, separate from the current Inner prompt:

- `src/utils/langchain/chains/loadTridentFlowPlannerChain/index.ts`

Responsibilities:

- produce a `TridentFlowGraph`
- avoid direct Overpass wording
- preserve concern identity
- keep stylistic metadata that the UI already needs

This chain should emit structured JSON, not free-form line-oriented text.

### Phase 4: Add a new API route for graph planning

Add:

- `src/app/api/ai/flow/route.ts`

Responsibilities:

- invoke flow planner chain
- parse JSON
- validate graph
- compile to legacy execution plan
- return both graph and compiled legacy plan

Suggested response shape:

```ts
{
  flow: TridentFlowGraph;
  legacyPlan: LegacyExecutionPlan;
}
```

This route should coexist with `/api/ai/inner` during migration.

### Phase 5: Switch the client to consume compiled legacy plans

Update `src/app/page.tsx` so that the overpass execution fan-out no longer depends on parsing raw Inner text.

Short term:

- call `/api/ai/flow`
- consume `legacyPlan`
- keep the current Deep route and current rendering path

Long term:

- remove the text-based Inner contract entirely

### Phase 6: Add graph-aware observability

Once the graph exists, TRIDENT should surface it for debugging:

- raw graph JSON
- validation results
- compiled execution units

This can begin as a developer-only debug panel or API response field.

## Data Model Principles

The following principles should constrain the implementation:

### 1. The graph is planner-facing, not renderer-facing

The graph should represent spatial intent and dependencies.

It should not directly encode:

- MapLibre rendering details
- GeoJSON payloads
- Overpass strings

Those belong to later stages.

### 2. Concern identity must remain stable

The current UI and styling model uses concern names as keys.

The compiler must preserve stable concern identity across:

- graph planning
- style assignment
- legacy execution compilation
- layer rendering

### 3. Unsupported graph features must fail early

Do not silently coerce unsupported graph constructs into approximate `AreaWithConcern` output.

If a graph cannot compile to the current Deep layer, validation should fail explicitly.

### 4. The first version should favor explicitness over flexibility

It is better to support a smaller executable subset with strong guarantees than to support a wide subset with hidden coercions and brittle fallbacks.

## Testing Strategy

`TridentFlowGraph` work should be test-first and mostly deterministic.

### Required deterministic test layers

1. Graph validation tests
2. Graph-to-legacy compiler tests
3. Legacy-plan-to-client contract tests
4. API route tests with mocked planner output

### Test sources

Use existing examples from:

- `src/utils/langchain/chains/loadTridentInnerChain/examples.ts`
- `src/utils/langchain/chains/loadTridentDeepChain/examples.ts`
- ReliefWeb-style scenarios already represented in public data

Turn those into:

- valid graph fixtures
- invalid graph fixtures
- expected legacy plan fixtures

### Avoid

- tests that depend on live Overpass
- tests that depend on live LLM output
- tests that only assert non-empty strings

Those are too weak for a planning-layer migration.

## Consequences

### Positive

- TRIDENT gets a validation boundary before Overpass execution
- multi-step spatial reasoning becomes representable
- planning becomes debuggable and replayable
- the current Deep/Overpass investment is preserved
- future replacement of `AreaWithConcern` becomes incremental instead of disruptive

### Negative

- one more intermediate layer must be maintained
- there will be a temporary dual-stack period (`inner` text plan and `flow` graph plan)
- the first compiler will only support a subset of graph semantics

## Alternatives Considered

### Alternative A: Replace Inner + Deep in one step

Rejected.

This is too risky because the current client, prompt examples, and Deep route all depend on the legacy line-based contract.

### Alternative B: Keep everything text-based and only tighten prompts

Rejected.

The main missing capability is not prompt quality. It is the lack of a typed, statically validated planning representation.

### Alternative C: Replace `AreaWithConcern` immediately

Rejected for the first phase.

`AreaWithConcern` is the cleanest stable execution boundary already present in the codebase. It should be kept temporarily while `TridentFlowGraph` is introduced upstream.

## Implementation Order

The recommended implementation order is:

1. add deterministic tests for current parsers
2. add `TridentFlowGraph` types
3. add validators
4. add graph-to-legacy compiler
5. add planner chain
6. add `/api/ai/flow`
7. migrate the client to `legacyPlan`
8. retire or reduce the old `/api/ai/inner` path

## Summary

TRIDENT should adopt a Spatial-Agent-inspired `TridentFlowGraph` as a **validated planning layer**, not as an immediate replacement for the entire existing map-generation pipeline.

The correct first move is:

- `Surface`
- `TridentFlowGraph` planner
- `validator`
- `compiler to AreaWithConcern`
- `Deep / Overpass`

This is the path that fits the current codebase, preserves working behavior, and creates a credible route toward more expressive geospatial reasoning.
