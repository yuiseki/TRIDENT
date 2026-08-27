import { PromptTemplate } from "@langchain/core/prompts";

export const tridentInnerExamplePrompt = PromptTemplate.fromTemplate(
  `Input:
{input}

Output:
{output}
`
);

export const tridentInnerExampleInputKeys = ["input"];

// 例の言語構成に注意すること。SemanticSimilarityExampleSelector は
// 内容で検索して言語を見ないので、英語の問いでも同じ地名の日本語の例を
// 引き当てる。ConfirmHelpful は入力言語で返す約束なのに、日本語の例が
// 手本として渡ると日本語で返る。プロンプトには言語の指定が入っているが、
// 0.6B は上の指示より目の前の例に従う。
//
// 表層で同じことが起きて 40 秒を失っていた (候補プール 18 件中 英語 1 件)。
// 日本語の例を消すのではなく英語の対を足して直した。ここも同じ方針。
export const tridentInnerExampleList: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "Sudan and South Sudan",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Sudan and South Sudan
Area: Sudan
Area: South Sudan`,
  },
  {
    input: "南スーダンを表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 南スーダン
Area: South Sudan`,
  },
  {
    input: "スーダンを表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: スーダン
Area: Sudan`,
  },
  {
    input: "東京都中央区",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 東京都中央区
Area: Chūō, Tokyo`,
  },
  {
    input: "静岡県伊豆市",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 静岡県伊豆市
Area: Izu, Shizuoka Prefecture`,
  },
  {
    input: "Show map of New York City",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: UN facilities in New York City
EmojiForConcern: UN facilities, 🇺🇳
ColorForConcern: UN facilities, lightblue
Area: City of New York
AreaWithConcern: City of New York, UN facilities`,
  },
  {
    input: "Area: Rukum District, Karnali Province, Nepal",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Rukum District, Karnali Province, Nepal
Area: Western Rukum District, Karnali Province, Nepal`,
  },
  {
    input: "Area: Mandera County, Kenya",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Mandera County, Kenya
Area: Mandera County, Kenya`,
  },
  {
    input: "スーダンと南スーダンの首都を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: スーダンと南スーダンの首都
Area: Khartoum, Sudan
Area: Juba, South Sudan`,
  },
  {
    input: "日本を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 日本
Area: Japan`,
  },
  {
    input: "石川県を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 石川県
Area: Ishikawa Prefecture`,
  },

  {
    input: `石川県を表示して
金沢市に絞り込んで`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 石川県金沢市
Area: Kanazawa, Ishikawa Prefecture`,
  },
  {
    input: `日本を表示して
台東区のラーメン屋だけ表示して`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区のラーメン屋
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow
Important note: When user asks to show only specific area with concerns after showing broader area, you MUST replace the broader area with the specific area, not add to it.`,
  },
  {
    input: `日本を表示して
台東区のラーメン屋だけを表示して
この地図を文京区まで広げて`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区と文京区のラーメン屋
Area: Taito, Tokyo
Area: Bunkyō, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
AreaWithConcern: Bunkyō, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow
Important note: When user asks to expand the map to another area, you MUST add the new area while keeping the existing area and concerns.`,
  },
  {
    input: `石川県を表示して
金沢市に絞り込んで
避難所を表示して`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 石川県金沢市の避難所
Area: Kanazawa, Ishikawa Prefecture
AreaWithConcern: Kanazawa, Ishikawa Prefecture, Shelters`,
  },
  {
    input: "台東区を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 東京都台東区
Area: Taito, Tokyo`,
  },
  {
    input: `台東区を表示して
病院を表示して`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区の病院
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Hospitals
EmojiForConcern: Hospitals, 🏥
ColorForConcern: Hospitals, pink
AreaWithConcern: Taito, Tokyo, Doctors
EmojiForConcern: Doctors, 🩺
ColorForConcern: Doctors, lightpink
Important note: If Human asks you to show hospitals, you MUST also include doctors.`,
  },
  {
    input: "台東区のラーメン屋を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区のラーメン屋と蕎麦屋
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow`,
  },
  {
    input: "台東区のラーメン屋",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区のラーメン屋と蕎麦屋
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow`,
  },
  {
    input: "台東区のラーメン屋と蕎麦屋を表示してください。",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区のラーメン屋と蕎麦屋
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow
EmojiForConcern: Taito, Tokyo, Soba noodle shops
EmojiForConcern: Soba noodle shops, 🍜
ColorForConcern: Soba noodle shops, lightgreen`,
  },
  {
    input: "台東区の駅を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区の駅
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Railway stations
EmojiForConcern: Railway stations, 🚉`,
  },
  {
    input: "文京区のラーメン屋を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 文京区のラーメン屋
Area: Bunkyō, Tokyo
AreaWithConcern: Bunkyō, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow`,
  },
  {
    input: "文京区の駅を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 文京区の駅
Area: Bunkyō, Tokyo
AreaWithConcern: Bunkyō, Tokyo, Railway stations
EmojiForConcern: Railway stations, 🚉`,
  },
  {
    input: `中央区の駅を表示して
東京都`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 東京都中央区の駅
Area: Chūō, Tokyo
AreaWithConcern: Chūō, Tokyo, Railway stations
EmojiForConcern: Railway stations, 🚉`,
  },
  {
    input: `中央区の駅を表示して
神戸市`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 神戸市中央区の駅
Area: Chuo Ward, Kobe
AreaWithConcern: Chuo Ward, Kobe, Railway stations
EmojiForConcern: Railway stations, 🚉`,
  },
  {
    input: `台東区を表示して
ラーメン屋を表示して
文京区まで広げて`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区と文京区のラーメン屋
Area: Taito, Tokyo
Area: Bunkyō, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
AreaWithConcern: Bunkyō, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, lightyellow`,
  },
  {
    input: `台東区を表示して
ラーメン屋を表示して
中央区まで広げて`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 台東区と中央区のラーメン屋
Area: Taito, Tokyo
Area: Chūō, Tokyo`,
  },
  {
    input: `レバノンを表示して
    大使館を表示して
    軍事施設も表示して`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: レバノンの大使館と軍事施設
Area: Lebanon
AreaWithConcern: Lebanon, Embassies
EmojiForConcern: Embassies, 🏢
ColorForConcern: Embassies, lightblue
AreaWithConcern: Lebanon, Military facilities
EmojiForConcern: Military facilities, 🪖
ColorForConcern: Military facilities, yellow`,
  },
  {
    input: "コソボの大使館を表示して",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: コソボの大使館
Area: Kosovo
AreaWithConcern: Kosovo, Embassies
EmojiForConcern: Embassies, 🏢
ColorForConcern: Embassies, lightblue`,
  },
  {
    input: `ネパールのユニセフの施設の地図を表示します。`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: ネパールのユニセフの施設
Area: Nepal
AreaWithConcern: Nepal, UNICEF facilities
EmojiForConcern: UNICEF facilities, 🏢
ColorForConcern: UNICEF facilities, lightblue`,
  },
  {
    input: `日本でソニーの名前を持つ会社・工場などを表示して`,
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 日本のソニー関連の会社と工場
Area: Japan
AreaWithConcern: Japan, Sony companies
EmojiForConcern: Sony companies, 🏢
ColorForConcern: Sony companies, blue
AreaWithConcern: Japan, Sony factories
EmojiForConcern: Sony factories, 🏭
ColorForConcern: Sony factories, lightgrey`,
  },
  {
    input:
      "Show AL Apartments and Innovation and Training Park Prizren in Municipality of Prizren, Kosovo.",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Apartment and Park in Municipality of Prizren
Area: Municipality of Prizren, Kosovo
AreaWithConcern: Municipality of Prizren, Kosovo, AL Apartments
EmojiForConcern: AL Apartments, 🏠
ColorForConcern: AL Apartments, cyan
AreaWithConcern: Municipality of Prizren, Kosovo, Innovation and Training Park Prizren
EmojiForConcern: Innovation and Training Park Prizren, 🏢
ColorForConcern: Innovation and Training Park Prizren, blue`,
  },
  {
    input: "Show me cafes in Hiroshima City",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Cafes in Hiroshima City
Area: Hiroshima City, Hiroshima Prefecture, Japan
AreaWithConcern: Hiroshima City, Hiroshima Prefecture, Japan, Cafes
EmojiForConcern: Cafes, ☕️
ColorForConcern: Cafes, brown`,
  },
  {
    input: "Show me cafes in Taito, Tokyo",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Cafes in Taito, Tokyo
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Cafes
EmojiForConcern: Cafes, ☕️
ColorForConcern: Cafes, brown`,
  },
  {
    input: "Show me ramen shops in Taito, Tokyo",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Ramen shops in Taito, Tokyo
Area: Taito, Tokyo
AreaWithConcern: Taito, Tokyo, Ramen shops
EmojiForConcern: Ramen shops, 🍜
ColorForConcern: Ramen shops, orange`,
  },
  {
    input: "Show me bakeries in Nishinari Ward, Osaka, Osaka Prefecture, Japan",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Bakeries in Nishinari Ward, Osaka
Area: Nishinari Ward, Osaka, Osaka Prefecture, Japan
AreaWithConcern: Nishinari Ward, Osaka, Osaka Prefecture, Japan, Bakeries
EmojiForConcern: Bakeries, 🥐
ColorForConcern: Bakeries, wheat`,
  },
  {
    input: "Show me airports in Chuo Ward, Niigata, Niigata Prefecture, Japan",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Airports in Chuo Ward, Niigata
Area: Chuo Ward, Niigata, Niigata Prefecture, Japan
AreaWithConcern: Chuo Ward, Niigata, Niigata Prefecture, Japan, Airports
EmojiForConcern: Airports, ✈️
ColorForConcern: Airports, skyblue`,
  },
];
