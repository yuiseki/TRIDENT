import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";
import { Embeddings } from "@langchain/core/embeddings";

export const tridentSuggestExampleList: Array<{
  input: string;
  output: string;
}> = [
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本`,
    output: `台東区を表示して
東京都を表示して
日本を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して`,
    output: `ラーメン屋を表示して
カフェを表示して
駅を表示して
病院を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して
ラーメン屋を表示して`,
    output: `蕎麦屋を表示して
寿司屋を表示して
ハンバーガー屋を表示して
カレー屋を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して
カフェを表示して`,
    output: `公園を表示して
ベンチを表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して
公園を表示して`,
    output: `ベンチを表示して
川を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
東京都を表示して`,
    output: `台東区に絞り込んで
文京区に絞り込んで
関東に広げて
日本に広げて`,
  },
  {
    input: `input:
Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
東京都を表示して
関東に広げて
台東区に絞り込んで`,
    output: `ラーメン屋を表示して
駅を表示して
公園を表示して
病院を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
日本を表示して`,
    output: `首都に絞り込んで
首都を表示して
広島に絞り込んで
沖縄に絞り込んで`,
  },
  {
    input: "New York",
    output: `Show the pizza shops in New York
Show the train stations in New York
Show the parks in New York
Show the hospitals in New York`,
  },
];

const tridentSuggestPromptPrefix = `Your name is TRIDENT, You are an interactive web maps generating assistant.

You will always output according to the following rules:
- You MUST ALWAYS output IN THE LANGUAGE WHICH INPUT IS WRITING.
- You MUST NOT output in any language other than the language written by the input.
- You output with the most accurate grammar possible.
- You SHOULD output max 4 lines of text.
- Your output MUST be the list of suggestions of the maps based on the input.

### Examples: ###`;

export const loadTridentSuggestPrompt = async (
  embeddings: Embeddings
) => {
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: memoryVectorStore,
    k: 5,
    inputKeys: ["input"],
  });
  const examplePrompt = PromptTemplate.fromTemplate(
    `Input:
{input}

Output:
{output}
`
  );

  for (const example of tridentSuggestExampleList) {
    await exampleSelector.addExample(example);
  }

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: examplePrompt,
    prefix: tridentSuggestPromptPrefix,
    suffix: `
### Input text: ###

Input:
{input}

Output: `,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};
