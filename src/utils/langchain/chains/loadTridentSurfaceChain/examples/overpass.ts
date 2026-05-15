// Surface examples for the overpass-api ability: the user wants to render a
// POI / region on the map using OpenStreetMap data. Always included.

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
];
