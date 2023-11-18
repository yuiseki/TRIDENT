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
area["name"="Kosovo"]->.searchArea;
(
  relation["boundary"="administrative"]["name"="Municipality of Prizren"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Area: Mandera County, Kenya
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Kenya"]->.searchArea;
(
  relation["boundary"="administrative"]["name"="Mandera County"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Western Province, Sri Lanka
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sri Lanka"]->.searchArea;
(
  relation["boundary"="administrative"]["name"="Western Province"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Area: Jajarkot, Karnali Province, Nepal
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Nepal"]->.outer;
area["name"="Karnali Province"]->.inner;
(
  relation["boundary"="administrative"]["name"="Jajarkot"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
Area: Rukum District, Karnali Province, Nepal
Output:
\`\`\`
[out:json][timeout:30000];
area["name:en"="Nepal"]->.outer;
area["name:en"="Karnali Province"]->.inner;
(
  relation["boundary"="administrative"]["name:en"="Western Rukum District"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
Area: Acapulco, Guerrero State, Mexico
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="México"]->.outer;
area["name"="Guerrero"]->.inner;
(
  relation["boundary"="administrative"]["name"="Acapulco de Juárez"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
Somali Region, Ethiopia, Genale River
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Ethiopia"]->.outer;
area["name"="Somali Region"]->.inner;
(
  nwr["name"="Genale river"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
Somali Region, Ethiopia, Shelters
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Ethiopia"]->.outer;
area["name"="Somali Region"]->.inner;
(
  nwr["amenity"="shelter"](area.inner)(area.outer);
  nwr["amenity"="refugee_site"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
Jajarkot, Karnali Province, Nepal, Shelters
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Nepal"]->.outer;
area["name"="Karnali Province"]->.inner;
area["name"="Jajarkot"]->.inner2;
(
  nwr["amenity"="shelter"](area.inner2)(area.inner)(area.outer);
  nwr["amenity"="refugee_site"](area.inner2)(area.inner)(area.outer);
);
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
AreaWithConcern: Kurunegala District, Sri Lanka, Hospitals
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sri Lanka"]->.outer;
area["name"="Kurunegala District"]->.inner;
(
  nwr["amenity"="hospital"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Urayasu, Chiba, Hospitals
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Chiba Prefecture"]->.outer;
area["name"="Urayasu"]->.inner;
(
  nwr["amenity"="hospital"](area.inner)(area.outer);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Taito, Tokyo, Hotels
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Tokyo"]->.outer;
area["name"="Taito"]->.inner;
(
  nwr["tourism"="hotel"](area.inner)(area.outer);
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
area["name"="South Sudan"]->.outer;
area["name"="Juba"]->.inner;
(
  nwr["landuse"="military"](area.inner)(area.outer);
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
