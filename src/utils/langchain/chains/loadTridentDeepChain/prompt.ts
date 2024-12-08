import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { FewShotPromptTemplate } from "@langchain/core/prompts";
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
- The query timeout MUST be 30000.
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
