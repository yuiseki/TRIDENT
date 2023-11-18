import { PromptTemplate } from "langchain/prompts";

const tridentDeepExamples = `
`;

const tridentDeepHints = `
Embassies: nwr["office"="diplomatic"]
Hotels: nwr["tourism"="hotel"]
Church: nwr["building"="church"]
Mosque: nwr["building"="mosque"]
Shrine: nwr["amenity"="place_of_worship"]["religion"="shinto"]
Temples: nwr["amenity"="place_of_worship"]["religion"="buddhist"]
Important note: Never use "religion"="buddhism". It is wrong. Use "religion"="buddhist" instead.
Izakaya: nwr["amenity"="bar"]
Company: nwr["office"="company"]
Factories: nwr["landuse"="industrial"]
Important note: Never use "landuse"="factory". It is wrong. Use "landuse"="industrial" instead.
National treasure castles: nwr["historic"="castle"]["heritage"]
Pizza shops: nwr["amenity"="fast_food"]["cuisine"="pizza"]
Important note: Pizza shops are fast food, not restaurants!
Domino's Pizza: nwr["name"~"Domino"]["cuisine"="pizza"]
Seven-Eleven: nwr["name"~"7-Eleven"]
Soba noodle shops: nwr["amenity"="restaurant"]["cuisine"="soba"]
Ramen shops: nwr["amenity"="restaurant"]["cuisine"="ramen"]
Western-style confectionery stores: nwr["shop"="confectionery"]
`;
const bboxQueryExample = `
Input text:
BoundingBoxWithConcern: bbox[[35.7062,139.7596,35.7235,139.7853]], parks
Output:
\`\`\`
[out:json][timeout:30000];
nwr["leisure"="park"](35.7062,139.7596,35.7235,139.7853);
out geom;
\`\`\`
`;
export const TRIDENT_DEEP_PROMPT = new PromptTemplate({
  template: `You are an expert OpenStreetMap and Overpass API. You output the best Overpass API query based on input text.

You will always reply according to the following rules:
- Output valid Overpass API query.
- The query timeout MUST be 30000.
- The query will utilize a area specifier as needed.
- The query will search nwr as needed.
- The query MUST be out geom.
- The query MUST be enclosed by three backticks on new lines, denoting that it is a code block.

Examples:
===
Input text:
Area: Sudan
Output:
\`\`\`
[out:json][timeout:30000];
relation["boundary"="administrative"]["name"="Sudan"];
out geom;
\`\`\`

Input text:
Area: Lebanon
Output:
\`\`\`
[out:json][timeout:30000];
relation["boundary"="administrative"]["name"="Lebanon"];
out geom;
\`\`\`

Input text:
Area: New York City
Output:
\`\`\`
[out:json][timeout:30000];
relation["boundary"="administrative"]["name"="City of New York"];
out geom;
\`\`\`

Input text:
Area: Tokyo
Output:
\`\`\`
[out:json][timeout:30000];
relation["boundary"="administrative"]["name"="Tokyo"];
out geom;
\`\`\`

Input text:
Area: Taito, Tokyo
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Tokyo"]->.searchArea;
(
  relation["boundary"="administrative"]["name"="Taito"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Area: Kita, Tokyo
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Tokyo"]->.searchArea;
(
  relation["boundary"="administrative"]["name"="Kita"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Area: Urayasu, Chiba
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Chiba Prefecture"]->.searchArea;
(
  relation["boundary"="administrative"]["name"="Urayasu"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Area: Prizren, Kosovo
Output:
\`\`\`
[out:json][timeout:30000];
relation[boundary="administrative"]["name"="Municipality of Prizren"];
out geom;
\`\`\`

Input text:
AreaWithConcern: Sudan, Hospitals
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sudan"]->.searchArea;
(
  nwr["amenity"="hospital"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Sudan, Shelters
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sudan"]->.searchArea;
(
  nwr["amenity"="shelter"](area.searchArea);
  nwr["amenity"="refugee_site"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Urayasu, Chiba, Hospitals
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Chiba Prefecture"]->.chiba;
area["name"="Urayasu"]->.searchArea;
(
  nwr["amenity"="hospital"](area.searchArea)(area.chiba);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Taito, Tokyo, Hotels
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Tokyo"]->.tokyo;
area["name"="Taito"]->.searchArea;
(
  nwr["tourism"="hotel"](area.searchArea)(area.tokyo);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Tokyo, Tokyo University campuses
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Tokyo"]->.searchArea;
(
  nwr["name"~"University of Tokyo"]["amenity"="university"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Juba, South Sudan, Military facilities
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="South Sudan"]->.sudan;
area["name"="Juba"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea)(area.sudan);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: New York City, UN facilities
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["name"~"United Nations"]["building"="yes"](area.searchArea);
  nwr["name"~"United Nations"]["building:part"="yes"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Gaza Strip, UN facilities
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Gaza Strip"]->.searchArea;
(
  nwr["name"~"UN"](area.searchArea);
  nwr["name"~"UN"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Prizren, Bars
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Municipality of Prizren"]->.searchArea;
(
  nwr["amenity"="bar"](area.searchArea);
);
out geom;
\`\`\`
===

Useful hints:${tridentDeepHints}

Input text:
{text}
Output:`,
  inputVariables: ["text"],
});
