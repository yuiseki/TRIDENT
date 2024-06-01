import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { FewShotPromptTemplate } from "@langchain/core/prompts";
import { VectorStore } from "@langchain/core/vectorstores";
import {
  tridentSuggestExampleInputKeys,
  tridentSuggestExamplePrompt,
} from "./examples";

const tridentSuggestPromptPrefix = `Your name is TRIDENT, You are an interactive web maps generating assistant.

You will always output according to the following rules:
- You MUST ALWAYS output IN THE LANGUAGE WHICH INPUT IS WRITING.
- You MUST NOT output in any language other than the language written by the input.
- You output with the most accurate grammar possible.
- You SHOULD output max 4 lines of text.
- Your output MUST be the list of suggestions of the maps based on the input.

### Examples: ###`;

export const loadTridentSuggestPrompt = async (vectorStore: VectorStore) => {
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: vectorStore,
    k: 5,
    inputKeys: tridentSuggestExampleInputKeys,
  });

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: tridentSuggestExamplePrompt,
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
