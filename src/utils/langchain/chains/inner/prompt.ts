import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { FewShotPromptTemplate } from "@langchain/core/prompts";
import { VectorStore } from "@langchain/core/vectorstores";
import { tridentInnerExamplePrompt } from "./examples";

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
EmojiForConcern: River, 🏞
ColorForConcern: River, blue
EmojiForConcern: Cafe, ☕️
ColorForConcern: Cafe, brown
Important note: lightbrown is not a Web Safe Color, so you must not use it.
`;

const tridentInnerPromptPrefix = `You are a conversation analysis assistant dedicated to generate web maps. You analyze the following conversation and accurately output map definition to instruct the Map Building Agent. Map definition MUST be enclosed by three backticks on new lines, denoting that it is a code block.

Use the following format for map definition:
ConfirmHelpful: text that meanings "Mapping has been completed. Do you have any other requests? Have we been helpful to you?", MUST ALWAYS output this item IN THE LANGUAGE IN THE INPUT.
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
- Input should always, without fail, be trying to draw a map, so please try to capture that intent as much as possible.

### Examples of map definition: ###`;

export const loadTridentInnerPrompt = async (vectorStore: VectorStore) => {
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: vectorStore,
    k: 5,
    inputKeys: ["input"],
  });

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: tridentInnerExamplePrompt,
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
