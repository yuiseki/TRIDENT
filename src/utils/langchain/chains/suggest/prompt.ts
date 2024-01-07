import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  SemanticSimilarityExampleSelector,
  PromptTemplate,
  FewShotPromptTemplate,
} from "langchain/prompts";
import { Embeddings } from "langchain/embeddings/base";

export const tridentSuggestExampleList: Array<{
  input: string;
  output: string;
}> = [
  {
    input: "台東区",
    output: `台東区のラーメン屋を表示して
台東区の駅を表示して
台東区の公園を表示して
台東区の病院を表示して`,
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
- You SHOULD output 4 lines of text.
- Your output MUST be the list of suggestions of the maps based on the input.

### Examples: ###`;

export const loadTridentSuggestPrompt = async (embeddings: Embeddings) => {
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: memoryVectorStore,
    k: 3,
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
