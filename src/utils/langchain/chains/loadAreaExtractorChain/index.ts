import { Embeddings } from "@langchain/core/embeddings";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { FewShotPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { areaExtractExamples } from "./examples.ts";

export const setupAreaExtractorDynamicPrompt = async (
  embeddings: Embeddings
) => {
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const concernPlaceExtractExampleSelector =
    new SemanticSimilarityExampleSelector({
      vectorStore: memoryVectorStore,
      k: 3,
      inputKeys: ["input"],
    });
  for (const example of areaExtractExamples) {
    await concernPlaceExtractExampleSelector.addExample(example);
  }

  const concernPlaceExtractorExamplePrompt = PromptTemplate.fromTemplate(
    `Input:
{input}

Output:
{output}
`
  );

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: concernPlaceExtractExampleSelector,
    examplePrompt: concernPlaceExtractorExamplePrompt,
    prefix: `You are a text mining system that extracts just only the areas from given input text.

### Rules ###

You will always reply according to the following rules:
- You MUST reply just only the name of areas.
- You MUST specify which country if the area is a state or province.
- You MUST ALWAYS respond in a Markdown list format.
- You MUST represent one area per one line.

Examples:`,
    suffix: `===
Input:
{input}

Output:
`,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};

export const loadAreaExtractorChain = async ({
  llm,
  embeddings,
}: {
  llm: BaseLanguageModel;
  embeddings: Embeddings;
}): Promise<RunnableSequence<any, any>> => {
  const dynamicPrompt = await setupAreaExtractorDynamicPrompt(embeddings);
  const chain = RunnableSequence.from([dynamicPrompt, llm]);
  return chain;
};
