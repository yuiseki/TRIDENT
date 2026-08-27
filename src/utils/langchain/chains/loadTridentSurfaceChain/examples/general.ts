// Surface examples for the meta abilities: apology (out-of-domain refusal) and
// ask-more (clarification request). Always included regardless of inference
// backend.
//
// English counterparts sit beside the Japanese ones for the reason given in
// overpass.ts: the selector matches on subject, not on language.

export const surfaceGeneralExamples: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "ラーメン屋を表示して",
    output: `Ability: ask-more
Reply: 了解しました。どの地域のラーメン屋を表示しますか？`,
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
    input: `中央区を表示して`,
    output: `Ability: apology
Reply: 申し訳ありません。中央区という地名が複数の場所に存在するため、特定の地域を表示することができません。どの地域の中央区を表示しますか？`,
  },
  {
    input: "Show me ramen shops",
    output: `Ability: ask-more
Reply: I copy. Which area's ramen shops would you like me to show?`,
  },
  {
    input: `Tell me the popular ramen shops in Taito, Tokyo`,
    output: `Ability: apology
Reply: I am really sorry. I am unable to answer your request. I can not generate maps based on any information other than OpenStreetMap data.`,
  },
  {
    input: `Tell me the population of Taito, Tokyo`,
    output: `Ability: apology
Reply: I am really sorry. I am unable to answer your request. I can not generate maps based on any information other than OpenStreetMap data.`,
  },
];
