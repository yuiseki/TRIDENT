// Surface examples for the overpass-api ability: the user wants to render a
// POI / region on the map using OpenStreetMap data. Always included.
//
// Keep an English example beside every Japanese one. The example selector
// retrieves by semantic similarity, which matches on subject and ignores
// language, so an English question about Taito used to pull the Japanese
// Taito examples and the model answered in Japanese. On the Pi the pool is
// only this file plus general.ts (the style abilities are gated to the OpenAI
// backend), and it had one English example out of eighteen, so an English
// question had almost no chance of retrieving one. The prompt already says
// five times to answer in the human's language; a 1.7B model follows the
// examples in front of it rather than the instruction.

export const surfaceOverpassExamples: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "Show map of New York City.",
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows the city of New York based on OpenStreetMap data. Please wait a while...`,
  },
  {
    input: "ニューヨークの地図を表示して",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいてニューヨーク市を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "显示纽约地图",
    output: `Ability: overpass-api
Reply: 知道了。我正在生成基于OpenStreetMap数据的纽约市地图。请稍等……`,
  },
  {
    input: "日本を表示して",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて日本を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "南スーダンを表示して",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて南スーダンを表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "スーダンを表示して",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいてスーダンを表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "石川県を表示して",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて石川県を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "台東区を表示して",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: `台東区を表示して
ラーメン屋を表示して`,
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区のラーメン屋を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: `台東区を表示して
ラーメン屋を表示して
蕎麦屋を表示して`,
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区のラーメン屋と蕎麦屋を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "台東区のラーメン屋を教えて",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区のラーメン屋を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: `台東区の人口を教えて
ラーメン屋を表示して`,
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区のラーメン屋を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: `台東区を表示して
ラーメン屋を表示して
墨田区まで広げて`,
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区と文京区のラーメン屋を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: "Show me ramen shops in Taito, Tokyo",
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows ramen shops in Taito, Tokyo based on OpenStreetMap data. Please wait a while...`,
  },
  {
    input: "Show me cafes in Taito, Tokyo",
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows cafes in Taito, Tokyo based on OpenStreetMap data. Please wait a while...`,
  },
  {
    input: "Show map of Japan.",
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows Japan based on OpenStreetMap data. Please wait a while...`,
  },
  {
    input: "Show map of Ishikawa Prefecture.",
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows Ishikawa Prefecture based on OpenStreetMap data. Please wait a while...`,
  },
  {
    input: `Show map of Taito, Tokyo
Show me ramen shops`,
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows ramen shops in Taito, Tokyo based on OpenStreetMap data. Please wait a while...`,
  },
  {
    input: `Show map of Taito, Tokyo
Show me ramen shops
Show me soba restaurants`,
    output: `Ability: overpass-api
Reply: I copy. I'm generating maps that shows ramen shops and soba restaurants in Taito, Tokyo based on OpenStreetMap data. Please wait a while...`,
  },
];
