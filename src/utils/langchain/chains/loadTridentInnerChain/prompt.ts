import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import {
  ChatPromptTemplate,
  FewShotPromptTemplate,
} from "@langchain/core/prompts";
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

/**
 * How many retrieved examples to put in front of the model.
 *
 * Measured on Qwen3-0.6B, the model the Pi runs as its inner layer, over the
 * ten cases in text2geoql-dataset/src/benchmark_inner.py:
 *
 *   5 examples   7/10 correct
 *   0 examples   4/10 correct   area falls from 10/10 to 6/10
 *
 * Without them the model loses the shape of the answer entirely, so the
 * default stays at five. The knob exists to ask the question again after
 * fine-tuning, when a model that has learnt the format may not need them.
 */
/**
 * The prompt the fine-tuned inner model was trained against.
 *
 * Duplicated verbatim in text2geoql-dataset's
 * examples/lora_finetune/dataset.py as INNER_SYSTEM_PROMPT. The two must not
 * drift. The deep layer taught this the expensive way: a fine-tuned model
 * asked in words it was never trained on answers worse than the base model,
 * and the failure looks like a bad fine-tune rather than a mismatched prompt.
 *
 * Two rules are stated here rather than left to examples, because both were
 * measured as failures of the base model: four-level areas coming back as two,
 * and Japanese input answered in Korean or Chinese.
 */
export const TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT =
  "You turn a human's request for a map into TRIDENT's intermediate language. " +
  "Reply with exactly these six lines and nothing else:\n" +
  "ConfirmHelpful: a short confirmation, in the same language the human wrote in\n" +
  "TitleOfMap: a title for the map\n" +
  "Area: the administrative area, smallest first, then each larger area " +
  "containing it, separated by commas\n" +
  "AreaWithConcern: the same area, then the thing being looked for\n" +
  "EmojiForConcern: the thing being looked for, then one emoji\n" +
  "ColorForConcern: the thing being looked for, then one colour name\n" +
  "Keep every level of the area the human named. Do not shorten " +
  '"Chuo Ward, Niigata, Niigata Prefecture, Japan" to "Chuo, Niigata".';

export type TridentInnerPromptStyle = "fewshot" | "finetuned";

/**
 * Which inner prompt to build. Few-shot unless explicitly asked otherwise, so
 * an unset or misspelled variable keeps the behaviour that works with a base
 * model rather than silently stripping the examples it depends on.
 */
export const resolveTridentInnerPromptStyle = (
  env: Record<string, string | undefined>
): TridentInnerPromptStyle =>
  env.TRIDENT_INNER_PROMPT_STYLE === "finetuned" ? "finetuned" : "fewshot";

/** The fine-tuned prompt: the system line and the human's words, nothing else. */
export const loadTridentInnerFinetunedPrompt = () =>
  ChatPromptTemplate.fromMessages([
    ["system", TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT],
    ["human", "{input}"],
  ]);

export const resolveInnerExampleCount = (
  env: Record<string, string | undefined>
): number => {
  const raw = env.TRIDENT_INNER_EXAMPLES;
  // Digits only. parseInt would read "3.5" as 3 and quietly change the
  // experiment rather than saying the value was not understood.
  if (raw === undefined || !/^\d+$/.test(raw)) return 5;
  return Number.parseInt(raw, 10);
};

export const loadTridentInnerPrompt = async (vectorStore: VectorStore) => {
  const k = resolveInnerExampleCount(process.env);
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: vectorStore,
    k,
    inputKeys: ["input"],
  });

  const dynamicPrompt = new FewShotPromptTemplate({
    ...(k > 0
      ? { exampleSelector }
      : { examples: [] as Array<Record<string, string>> }),
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
