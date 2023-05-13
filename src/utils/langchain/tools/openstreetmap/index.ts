import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";

export const loadAreaDetermineTool = async (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "osm-area-determine",
    description:
      "useful for when you need to determine the geospatial area in OpenStreetMap. Input: English text that need to determine the geospatial area in OpenStreetMap.",
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        `You are an expert OpenStreetMap and Overpass API. You are an AI that determines the target geospatial area of the input text. You must output only a valid English name in the area query of the Overpass API.

Examples:
===
Input text: Police Stations and Police Boxes in New York City
Output: New York

Input Text: Hospitals and Schools in Taito-ku
Output: Taito

Input Text: Ramen Restaurant in Kameido
Output: Koto

Input Text: Hotels in Kyoto
Output: Kyoto

Input Text: Shelter in the capital of Sudan
Output: Khartoum

Input Text: Military Facilities in South Sudan
Output: South Sudan
===

Input text: {text}
Output:`
      ),
    }),
  });
};

export const loadTagsDetermineTool = async (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "osm-tags-determine",
    description:
      "useful when you need to determine tags in OpenStreetMap. Input: English text that need to determine tags in OpenStreetMap.",
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        `You are an expert OpenStreetMap and Overpass API. You are an AI that determines the tags in OpenStreetMap for the input text. You must outputs only valid tags of the Overpass API.

Examples:
===
Input text: Police Stations and Police Boxes in New York City
Output:
"amenity"="police"

Input Text: Hospitals and Schools in Taito-ku
Output:
"amenity"="hospital"
"amenity"="school"

Input Text: Ramen Restaurant in Kameido
Output:
"amenity"="restaurant"
"cuisine"="noodle"

Input Text: Hotels in Kyoto
Output:
"tourism"="hotel"

Input Text: Shelter in the capital of Sudan
Output:
"amenity"="shelter"

Input Text: Military Facilities in South Sudan
Output:
"landuse"="military"
===

Input text: {text}
Output:`
      ),
    }),
  });
};

export const loadOverpassQueryBuilderTool = async (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "overpass-query-builder",
    description:
      "Useful when you need to query of the Overpass API. Input: Text that must contains English name of target area and list of tags, You can get these texts by using the output of tool osm-area-determine and tool osm-tags-determine.",
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        `You are an expert OpenStreetMap and Overpass API. You output the best Overpass API query based on user input.

You will always reply according to the following rules:
- The text of a valid Overpass API query.
- The query timeout must be 30000.
- The query utilize a area specifier.
- The query will search nwr.
- The query must be out geom.
- Must output valid Overpass API queries as many as possible.
- All queries must be enclosed by three backticks on new lines, denoting that it is a code block.
- Must expands all possible patterns of Overpass API query with and without :en for area and tags.
- Must output Overpass API query at the end to retrieve the region that also expands all variant names for fallback.

Examples:
===

Input text:
New York
"amenity"="police"
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="New York"]->.searchArea;
(
  nwr["amenity"="police"](area.searchArea);
);
out geom;
\`\`\`

Input Text:
Taito
"amenity"="hospital"
"amenity"="school"
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Taito"]->.searchArea;
(
  nwr["amenity"="hospital"](area.searchArea);
  nwr["amenity"="school"](area.searchArea);
);
out geom;
\`\`\`

Input Text:
Koto
"amenity"="restaurant"
"cuisine"="noodle"
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Koto"]->.searchArea;
(
  nwr["amenity"="restaurant"](area.searchArea);
  nwr["cuisine"="noodle"](area.searchArea);
);
out geom;
\`\`\`

Input Text:
Kyoto
"tourism"="hotel"
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Koto"]->.searchArea;
(
  nwr["tourism"="hotel"](area.searchArea);
);
out geom;
\`\`\`

Input Text:
Khartoum
"amenity"="shelter"
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Khartoum"]->.searchArea;
(
  nwr["amenity"="shelter"](area.searchArea);
);
out geom;
\`\`\`

Input Text:
South Sudan
"landuse"="military"
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="South Sudan"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;
\`\`\`
===

Input text:
{text}
Output:`
      ),
    }),
  });
};
