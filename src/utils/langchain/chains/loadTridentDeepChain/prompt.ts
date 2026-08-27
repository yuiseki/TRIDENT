import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import {
  ChatPromptTemplate,
  FewShotPromptTemplate,
} from "@langchain/core/prompts";
import { VectorStore } from "@langchain/core/vectorstores";
import {
  tridentDeepExampleInputKeys,
  tridentDeepExamplePrompt,
} from "./examples";

const tridentDeepHints = `
Church: nwr["building"="church"]
Mosque: nwr["building"="mosque"]
Shrine: nwr["amenity"="place_of_worship"]["religion"="shinto"]
Temples: nwr["amenity"="place_of_worship"]["religion"="buddhist"]
Important note: Never use "religion"="buddhism". It is wrong. Use "religion"="buddhist" instead.

Factories: nwr["landuse"="industrial"]
Important note: Never use "landuse"="factory". It is wrong. Use "landuse"="industrial" instead.

Izakaya: nwr["amenity"="bar"]
Important note: Izakaya is just a bar. there is no special tag for Izakaya.

Pizza shops: nwr["amenity"="fast_food"]["cuisine"="pizza"]
Important note: Pizza shops are fast food, not restaurants!

Sushi shops: nwr["amenity"="fast_food"]["cuisine"="sushi"]
Important note: Sushi shops are fast food, not restaurants!

Domino's Pizza: nwr["name"~"Domino"]["cuisine"="pizza"]

National treasure castles: nwr["historic"="castle"]["heritage"]
`;

const tridentDeepPromptPrefix = `You are an expert OpenStreetMap and Overpass API. You output the best Overpass API query based on input text.

You will always reply according to the following rules:
- Output valid Overpass API query.
- The query timeout MUST be 30.
- The query will utilize a area specifier as needed.
- The query will search nwr as needed.
- The query MUST be out geom.
- The query MUST be enclosed by three backticks on new lines, denoting that it is a code block.

### Examples: ###
`;

export const loadTridentDeepPrompt = async (vectorStore: VectorStore) => {
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: vectorStore,
    k: 5,
    inputKeys: tridentDeepExampleInputKeys,
  });

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: tridentDeepExamplePrompt,
    prefix: tridentDeepPromptPrefix,
    suffix: `
===

Useful hints:${tridentDeepHints}

===

Input:
{input}

Output:
`,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};

// --- Fine-tuned deep model path -------------------------------------------
//
// qwen2.5-coder-0.5b-trident-deep-v4.2 was fine-tuned on a single short system
// prompt with no examples (see text2geoql-dataset src/dataset.py SYSTEM_PROMPT).
// Driving it with the few-shot prompt above puts it out of distribution: the
// hints table teaches "X shops = amenity + cuisine=X", and the model answers
// "Cafes" with restaurant + cuisine=cafe, which returns nothing from Overpass.
// The same prompt is fine for a large model, so this is a distribution
// mismatch rather than a prompt defect. Keep both and pick per deployment.

export const TRIDENT_DEEP_FINETUNED_SYSTEM_PROMPT =
  "You are an expert at generating Overpass QL queries for OpenStreetMap. " +
  "Given a location and a point-of-interest type in TRIDENT AreaWithConcern format, " +
  "output only a valid Overpass QL query with no explanation.\n" +
  "In TRIDENT AreaWithConcern format, areas are listed from smallest to largest: " +
  "the first token is the innermost (most specific) area, and each subsequent token " +
  "is a larger containing area. " +
  "Always use the first token as the inner filter variable and the second token as the outer filter variable.";

export type TridentDeepPromptStyle = "fewshot" | "finetuned";

/**
 * Which deep prompt to use. Defaults to "fewshot" so the existing OpenAI and
 * large-model deployments keep their current behaviour; opt in per deployment
 * with TRIDENT_DEEP_PROMPT_STYLE=finetuned when deep points at the fine-tuned
 * 0.5B model.
 */
export const resolveTridentDeepPromptStyle = (
  env: Record<string, string | undefined>
): TridentDeepPromptStyle =>
  env.TRIDENT_DEEP_PROMPT_STYLE === "finetuned" ? "finetuned" : "fewshot";

/**
 * Reproduces the fine-tuning prompt exactly: one system message, one human
 * message holding the raw AreaWithConcern line. No examples, no hints, no code
 * fence, and no mandated timeout.
 */
export const loadTridentDeepFinetunedPrompt = () =>
  ChatPromptTemplate.fromMessages([
    ["system", TRIDENT_DEEP_FINETUNED_SYSTEM_PROMPT],
    ["human", "{input}"],
  ]);
