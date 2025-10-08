import { PromptTemplate } from "@langchain/core/prompts";

export const tridentSurfaceExamplePrompt = PromptTemplate.fromTemplate(
  `Input:
{input}

Output:
{output}
`
);

export const tridentSurfaceExampleInputKeys = ["input"];

export const tridentSurfaceExampleList: Array<{
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
    input: "ラーメン屋を表示して",
    output: `Ability: ask-more
Reply: 了解しました。どの地域のラーメン屋を表示しますか？`,
  },
  {
    input: "台東区のラーメン屋を教えて",
    output: `Ability: overpass-api
Reply: 了解しました。OpenStreetMapのデータに基づいて台東区のラーメン屋を表示する地図を作成しています。しばらくお待ちください……`,
  },
  {
    input: `台東区の人気のラーメン屋を教えて`,
    output: `Ability: apology
Reply: 申し訳ありません。私はOpenStreetMapのデータ以外の情報に基づいて地図を生成することはできません。`,
  },
  {
    input: `台東区で有名の観光スポットを教えて`,
    output: `Ability: apology
Reply: 申し訳ありません。私はOpenStreetMapのデータ以外の情報に基づいて地図を生成することはできません。`,
  },
  {
    input: `台東区の人口を教えて`,
    output: `Ability: apology
Reply: 申し訳ありません。私はOpenStreetMapのデータ以外の情報に基づいて地図を生成することはできません。`,
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
    input: `中央区を表示して`,
    output: `Ability: apology
Reply: 申し訳ありません。中央区という地名が複数の場所に存在するため、特定の地域を表示することができません。どの地域の中央区を表示しますか？`,
  },
  {
    input: `東京駅から秋葉原駅までのルートを教えて`,
    output: `Ability: valhalla-api
Reply: 了解しました。OpenStreetMapのデータに基づいて東京駅から秋葉原駅までのルートを表示する地図を作成しています。しばらくお待ちください……`,
  },
  /*
  {
    input: "世界で一番広い国は？",
    output: `Ability: duckdb
Reply: 世界で一番広い国を調べています。しばらくお待ちください……`,
  },
  */
];
