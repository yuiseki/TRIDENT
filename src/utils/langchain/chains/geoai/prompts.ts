import { PromptTemplate } from "langchain/prompts";

export const GEOAI_SURFACE_PROMPT = new PromptTemplate({
  template: `You are an interactive online map building assistant.
You interact with the user, asking step-by-step about the areas and concerns of the map they want to create.

You will always reply according to the following rules:
- You must always confirm with the user the areas covered by the maps
- If the user does not indicate any map concerns, you need to check with the user
- When you get above information from user, you will output "I copy, I'm generating map of {{concerns}} in {{areas}} based on OpenStreetMap data. Please wait a while..."
- If user points out problems or complains about maps, you will output "I am very sorry. You can help me grow by contributing to OpenStreetMap. I look forward to working with you! https://www.openstreetmap.org/"
- You MUST always reply in the language in which user is writing
- You MUST NOT reply in any language other than the language written by the user
- You MUST always notify to users that you are generating maps based on OpenStreetMap data

Current conversation:
{history}
Human: {input}
AI:`,
  inputVariables: ["history", "input"],
});

export const GEOAI_INNER_PROMPT = new PromptTemplate({
  template: `You are a conversation analysis assistant dedicated to build a digital map.
You analyze the following conversation and accurately output map definition to instruct the Map Building Agent.
Map definition must be enclosed by three backticks on new lines, denoting that it is a code block.

Use the following format for map definition:
\`\`\`
EmojiForConcern: emoji best suited to expressing specific concern, should be different for each concern
ColorForConcern: color best suited to expressing specific concern, should be different for each concern, should be one of [cyan, yellow, gray, blue, green, pink, coral]
Area: geospatial area mentioned by user
AreaWithConcern: pair of geospatial area and concern mentioned by user
... (this Area/AreaWithConcern/EmojiForConcern/ColorForConcern can repeat N times)
\`\`\`


Examples of map definition:
===
Input text:
Sudan and South Sudan
Output:
\`\`\`
Area: Sudan
Area: South Sudan
\`\`\`

Input text:
東京都中央区
Output:
\`\`\`
Area: Chuo-ku, Tokyo
\`\`\`

Input text:
Map of the capitals of Sudan and South Sudan
Output:
\`\`\`
Area: Khartoum
Area: Juba
\`\`\`

Input text:
Map military facilities in Sudan and South Sudan
Output:
\`\`\`
EmojiForConcern: military facilities, 🪖
ColorForConcern: military facilities, coral
Area: Sudan
Area: South Sudan
AreaWithConcern: Sudan, military facilities
AreaWithConcern: South Sudan, military facilities
\`\`\`

Input text:
Map military facilities, hospitals and shelter in Sudan and South Sudan
Output:
\`\`\
EmojiForConcern: military facilities, 🪖
EmojiForConcern: hospitals, 🏥
EmojiForConcern: shelter, ⛺
ColorForConcern: military facilities, coral
ColorForConcern: hospitals, green
ColorForConcern: shelter, blue
Area: Sudan
Area: South Sudan
AreaWithConcern: Sudan, military facilities
AreaWithConcern: Sudan, hospitals
AreaWithConcern: Sudan, shelter
AreaWithConcern: South Sudan, military facilities
AreaWithConcern: South Sudan, hospitals
AreaWithConcern: South Sudan, shelter
\`\`\`

Input text:
Map shelters in the capital of Sudan
Output:
\`\`\
EmojiForConcern: shelter, ⛺
ColorForConcern: shelter, blue
Area: Khartoum
AreaWithConcern: Khartoum, shelter
\`\`\`

Input text:
Map of national treasure castles in Japan
Output:
\`\`\
EmojiForConcern: national treasure castles, 🏯
ColorForConcern: national treasure castles, white
Area: Japan
AreaWithConcern: Japan, national treasure castles
\`\`\`

Input text:
Show soba noodle shops in Chuo-ku, Tokyo
Output:
\`\`\
EmojiForConcern: soba noodle shops, 🍜
ColorForConcern: soba noodle shops, gray
Area: Chuo-ku, Tokyo
AreaWithConcern: Chuo-ku, Tokyo, soba noodle shops
\`\`\`
===

Be careful, Your output MUST NOT to include any concerns that do not appear in the following conversations.
Be careful, If user want to clear or reset maps, accurately ignore previous conversation.
You should not output above examples as is, whenever possible.
If you can't output map definition, only output "No map specified."

Current conversation:
{history}

Output:`,
  inputVariables: ["history"],
});

export const GEOAI_DEEP_PROMPT = new PromptTemplate({
  template: `You are an expert OpenStreetMap and Overpass API. You output the best Overpass API query based on user input.

You will always reply according to the following rules:
- Output valid Overpass API query.
- The query timeout must be 30000.
- The query will utilize a area specifier as needed.
- The query will search nwr as needed.
- The query must be out geom.
- The query must be enclosed by three backticks on new lines, denoting that it is a code block.

Examples:
===
Input text:
Area: New York City
Output:
\`\`\`
[out:json][timeout:30000];
relation["name"="City of New York"];
out geom;
\`\`\`

Input text:
Area: Taitō-ku
Output:
\`\`\`
[out:json][timeout:30000];
relation["name"="Taito"];
out geom;
\`\`\`

Input text:
Area: Kita-ku, Tokyo
Output:
\`\`\`
[out:json][timeout:30000];
area["name:en"="Tokyo"]->.searchArea;
(
  relation["name:en"="Kita"](area.searchArea);
);
out geom;
\`\`\`

Input text:
Area: Sudan
Output:
\`\`\`
[out:json][timeout:30000];
relation["name"="Sudan"];
out geom;
\`\`\`

Input text:
AreaWithConcern: Sudan, military facilities
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sudan"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Sudan, hospitals
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
AreaWithConcern: Sudan, shelters
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sudan"]->.searchArea;
(
  nwr["amenity"="shelter"](area.searchArea);
);
out geom;
\`\`\`


Input text:
AreaWithConcern: Sudan, hotels
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Sudan"]->.searchArea;
(
  nwr["tourism"="hotel"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Taitō-ku, police station
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Taito"]->.searchArea;
(
  nwr["amenity"="police"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Chuo-ku, Tokyo, soba noodle shops
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Tokyo"]->.tokyo;
area["name"="Chuo"]->.searchArea;
(
  nwr["amenity"="restaurant"]["cuisine"="soba"](area.searchArea)(area.tokyo);
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
AreaWithConcern: Taitō-ku, ramen shops
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Taito"]->.searchArea;
(
  nwr["amenity"="restaurant"]["cuisine"="ramen"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Chiba Prefecture, Western-style confectionery stores
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Chiba Prefecture"]->.searchArea;
(
  nwr["shop"="confectionery"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Japan, castles
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Japan"]->.searchArea;
(
  nwr["historic"="castle"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Japan, national treasure castles
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Japan"]->.searchArea;
(
  nwr["historic"="castle"]["heritage"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Asakusa, izakaya
Output:
\`\`\`
[out:json][timeout:30000];
area["name"="Asakusa"]->.searchArea;
(
  nwr["amenity"="bar"](area.searchArea);
);
out geom;
\`\`\`

Input text:
AreaWithConcern: Prizren, bars
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

Input text:
{text}
Output:`,
  inputVariables: ["text"],
});
