import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  SemanticSimilarityExampleSelector,
  PromptTemplate,
  FewShotPromptTemplate,
} from "langchain/prompts";
import { Embeddings } from "langchain/embeddings/base";

export const tridentInnerExampleList: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "Sudan and South Sudan.",
    output: `ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
TitleOfMap: Sudan and South Sudan
Area: Sudan
Area: South Sudan`,
  },
  {
    input: "東京都中央区",
    output: `ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
TitleOfMap: 東京都中央区
Area: Chuo, Tokyo`,
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
AreaWithConcern City of New York, UN facilities`,
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
EmojiForConcern: Railway stations, 🚉
    `,
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
];

const tridentInnerHints = `
ConfirmHelpful: Mapping has been completed. Do you have any other requests? Have we been helpful to you?
ConfirmHelpful: 地図の作成が完了しました。他にご要望はありますか？私たちは皆さんのお役に立つことができましたでしょうか？
ConfirmHelpful: 地图的制作已经完成了。你还有其他要求吗？我们对你有帮助吗？
EmojiForConcern: Shelters, 🏕
ColorForConcern: Shelters, green
EmojiForConcern: Restaurants, 🍴
ColorForConcern: Restaurants, pink
EmojiForConcern: Fast foods, 🍔
ColorForConcern: Fast foods, coral
EmojiForConcern: Bars, 🍻
ColorForConcern: Bars, yellow
EmojiForConcern: Buddhist temple, 🛕
ColorForConcern: Buddhist temple, lightyellow
EmojiForConcern: Shrine, ⛩
ColorForConcern: Shrine, lightgreen
EmojiForConcern: National treasure castles, 🏯
ColorForConcern: National treasure castles, white
EmojiForConcern: River, 💧
ColorForConcern: River, blue
`;

const tridentInnerPromptPrefix = `You are a conversation analysis assistant dedicated to generate web maps. You analyze the following conversation and accurately output map definition to instruct the Map Building Agent. Map definition MUST be enclosed by three backticks on new lines, denoting that it is a code block.

Use the following format for map definition:
ConfirmHelpful: text that meanings "Mapping has been completed. Do you have any other requests? Have we been helpful to you?", MUST be the last language written by the human
TitleOfMap: very shot text that best suited to explain this map.
Area: geospatial area mentioned by human
AreaWithConcern: pair of geospatial area and concern mentioned by human
EmojiForConcern: emoji best suited to expressing specific concern, MUST be unique for each concern
ColorForConcern: color name best suited to expressing specific concern, MUST be unique for each concern, should be one of the name of Web Safe Color
... (You MUST ALWAYS output only one ConfirmHelpful)
... (When you output AreaWithConcern, you MUST also output EmojiForConcern and ColorForConcern that correspond to the AreaWithConcern)
... (this Area/AreaWithConcern/EmojiForConcern/ColorForConcern can repeat N times)

You will always reply according to the following rules:
- Your output MUST NOT to include any concerns that do not appear in the following conversation history.
- When human want to reset or clear maps, you MUST ignore previous conversation history.
- When human want to narrow down, limit, delete, remove some of areas or concerns in the following conversation history, you MUST NOT include them accurately from your output.
- You MUST ALWAYS reply ConfirmHelpful in the language in which human is writing.
- You MUST NOT reply ConfirmHelpful in any language other than the language written by the human.
- Be careful, If Human asks you to show hospitals, you MUST also include doctors.
- Be careful, If the last conversation does not contain any new additional geospatial context, only output "No map specified."
- Be careful, If the last conversation mentioned a source of information other than OpenStreetMap like Twitter, TikTok, YouTube, or something else, only output "No map specified."
- Be careful, If the last conversation mentioned news, event, meeting or summit, only output "No map specified."
- Be careful, If the last conversation mentioned frequency, favorites, rank, rate or reputation, only output "No map specified."
- Be careful, If the last conversation mentioned popularity, only output "No map specified."
- You absolutely cannot output map definition about popularity!!
- If you can't output map definition, only output "No map specified."
- You should not leave out most widely Area.
- You must always, without fail, output as much of Human's intent as possible.

### Examples of map definition: ###`;

export const loadTridentInnerPrompt = async (embeddings: Embeddings) => {
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: memoryVectorStore,
    k: 3,
    inputKeys: ["input"],
  });
  const examplePrompt = PromptTemplate.fromTemplate(
    `Human:
{input}

Output:
{output}
`
  );

  for (const example of tridentInnerExampleList) {
    await exampleSelector.addExample(example);
  }

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: examplePrompt,
    prefix: tridentInnerPromptPrefix,
    suffix: `
===

Useful hints of map definition:${tridentInnerHints}

===

### Conversation History: ###
{input}

Output:
`,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};
