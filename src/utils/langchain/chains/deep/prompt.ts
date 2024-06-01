import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { Embeddings } from "@langchain/core/embeddings";
import { VectorStore } from "@langchain/core/vectorstores";

export const tridentDeepExampleList: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "Area: Sudan",
    output: `[out:json][timeout:30000];
relation["boundary"="administrative"]["admin_level"=2]["name:en"="Sudan"];
out geom;`,
  },
  {
    input: "Area: Lebanon",
    output: `[out:json][timeout:30000];
relation["boundary"="administrative"]["admin_level"=2]["name:en"="Lebanon"];
out geom;`,
  },
  {
    input: "Area: Kosovo",
    output: `[out:json][timeout:30000];
relation["boundary"="administrative"]["admin_level"=2]["name:en"="Kosovo"];
out geom;`,
  },
  {
    input: "Area: Nepal",
    output: `[out:json][timeout:30000];
relation["boundary"="administrative"]["admin_level"=2]["name:en"="Nepal"];
out geom;`,
  },
  {
    input: "Area: New York City",
    output: `[out:json][timeout:30000];
relation["boundary"="administrative"]["admin_level"=5]["name"="City of New York"];
out geom;`,
  },
  {
    input: "Area: Tokyo",
    output: `[out:json][timeout:30000];
relation["boundary"="administrative"]["admin_level"=4]["name:en"="Tokyo"];
out geom;`,
  },
  {
    input: "Area: Kanto region",
    output: `[out:json][timeout:30000];
relation["type"="boundary"]["name:en"="Kanto"];
out geom;`,
  },
  {
    input: "Area: Taito, Tokyo",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Taito"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Kita, Tokyo",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Kita"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Kanazawa, Ishikawa Prefecture",
    output: `[out:json][timeout:30000];
area["name:en"="Ishikawa Prefecture"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Kanazawa"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Prizren, Kosovo",
    output: `[out:json][timeout:30000];
area["name:en"="Kosovo"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Municipality of Prizren"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Mandera County, Kenya",
    output: `[out:json][timeout:30000];
area["name:en"="Kenya"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Mandera County"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Western Province, Sri Lanka",
    output: `[out:json][timeout:30000];
area["name:en"="Sri Lanka"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Western Province"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Jajarkot, Karnali Province, Nepal",
    output: `[out:json][timeout:30000];
area["name:en"="Nepal"]->.outer;
area["name:en"="Karnali Province"]->.inner;
(
  relation["boundary"="administrative"]["name:en"="Jajarkot"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "Area: Rukum District, Karnali Province, Nepal",
    output: `[out:json][timeout:30000];
area["name:en"="Nepal"]->.outer;
area["name:en"="Karnali Province"]->.inner;
(
  relation["boundary"="administrative"]["name:en"="Western Rukum District"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "Nepal, UNICEF facilities",
    output: `[out:json][timeout:30000];
area["name:en"="Nepal"]->.searchArea;
(
  nwr["name"~"UNICEF"](area.searchArea);
  nwr["name:en"~"UNICEF"](area.searchArea);
);
out geom;`,
  },
  {
    input: "Area: Acapulco, Guerrero State, Mexico",
    output: `[out:json][timeout:30000];
area["name"="México"]->.outer;
area["name"="Guerrero"]->.inner;
(
  relation["boundary"="administrative"]["name"="Acapulco de Juárez"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "Area: Somali Region, Ethiopia, Genale River",
    output: `[out:json][timeout:30000];
area["name:en"="Ethiopia"]->.outer;
area["name:en"="Somali Region"]->.inner;
(
  nwr["name:en"="Genale river"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Somali Region, Ethiopia, Shelters",
    output: `[out:json][timeout:30000];
area["name:en"="Ethiopia"]->.outer;
area["name:en"="Somali Region"]->.inner;
(
  nwr["amenity"="shelter"](area.inner)(area.outer);
  nwr["amenity"="refugee_site"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Jajarkot, Karnali Province, Nepal, Shelters",
    output: `[out:json][timeout:30000];
area["name:en"="Nepal"]->.outer;
area["name:en"="Karnali Province"]->.inner;
area["name:en"="Jajarkot"]->.inner2;
(
  nwr["amenity"="shelter"](area.inner2)(area.inner)(area.outer);
  nwr["amenity"="refugee_site"](area.inner2)(area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Sudan, Hospitals",
    output: `[out:json][timeout:30000];
area["name"="Sudan"]->.searchArea;
(
  nwr["amenity"="hospital"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Sudan, Shelters",
    output: `[out:json][timeout:30000];
area["name:en"="Sudan"]->.searchArea;
(
  nwr["amenity"="shelter"](area.searchArea);
  nwr["amenity"="refugee_site"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Kurunegala District, Sri Lanka, Hospitals",
    output: `[out:json][timeout:30000];
area["name:en"="Sri Lanka"]->.outer;
area["name:en"="Kurunegala District"]->.inner;
(
  nwr["amenity"="hospital"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Hotels",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["tourism"="hotel"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Tokyo, University campuses",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.searchArea;
(
  nwr["amenity"="university"](area.searchArea);
);
out geom;`,
  },

  {
    input: "AreaWithConcern: Tokyo, Tokyo University campuses",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.searchArea;
(
  nwr["name"~"University of Tokyo"]["amenity"="university"](area.searchArea);
  nwr["name:en"~"University of Tokyo"]["amenity"="university"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Juba, South Sudan, Military facilities",
    output: `[out:json][timeout:30000];
area["name:en"="South Sudan"]->.outer;
area["name:en"="Juba"]->.inner;
(
  nwr["landuse"="military"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: New York City, UN facilities",
    output: `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["name"~"United Nations"]["building"="yes"](area.searchArea);
  nwr["name"~"United Nations"]["building:part"="yes"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Gaza Strip, UN facilities",
    output: `[out:json][timeout:30000];
area["name:en"="Gaza Strip"]->.searchArea;
(
  nwr["name"~"UN"](area.searchArea);
  nwr["name:en"~"UN"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Prizren, Kosovo, Bars",
    output: `[out:json][timeout:30000];
area["name:en"="Municipality of Prizren"]->.searchArea;
(
  nwr["amenity"="bar"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Kosovo, Embassies",
    output: `[out:json][timeout:30000];
area["name:en"="Kosovo"]->.searchArea;
(
  nwr["office"="diplomatic"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Ramen shops",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["amenity"="restaurant"]["cuisine"="ramen"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Soba noodle shops",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["amenity"="restaurant"]["cuisine"="soba"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Pizza shops",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["amenity"="fast_food"]["cuisine"="pizza"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Sushi shops",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["amenity"="fast_food"]["cuisine"="sushi"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Izakaya",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["amenity"="bar"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Western-style confectionery stores",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["shop"="confectionery"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Seven-Eleven",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["name"~"7-Eleven"](area.inner)(area.outer);
  nwr["name:en"~"7-Eleven"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Company",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["office"="company"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Taito, Tokyo, Factories",
    output: `[out:json][timeout:30000];
area["name:en"="Tokyo"]->.outer;
area["name:en"="Taito"]->.inner;
(
  nwr["landuse"="industrial"](area.inner)(area.outer);
);
out geom;`,
  },
  {
    input: "Area: Chuo, Kobe",
    output: `[out:json][timeout:30000];
area["name:en"="Kobe"]->.searchArea;
(
  relation["boundary"="administrative"]["name:en"="Chuo Ward"](area.searchArea);
);
out geom;`,
  },
  {
    input: "AreaWithConcern: Chuo, Kobe, Ramen shops",
    output: `[out:json][timeout:30000];
area["name:en"="Kobe"]->.outer;
area["name:en"="Chuo Ward"]->.inner;
(
  nwr["amenity"="restaurant"]["cuisine"="ramen"](area.inner)(area.outer);
);
out geom;
    `,
  },
];

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
    inputKeys: ["input"],
  });
  const examplePrompt = PromptTemplate.fromTemplate(
    `Input:
{input}

Output:
\`\`\`
{output}
\`\`\`
`
  );

  for (const example of tridentDeepExampleList) {
    await exampleSelector.addExample(example);
  }

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: examplePrompt,
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
