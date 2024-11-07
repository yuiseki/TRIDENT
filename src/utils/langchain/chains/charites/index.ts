import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import {
  Example,
  FewShotPromptTemplate,
  PromptTemplate,
} from "@langchain/core/prompts";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { VectorStore } from "@langchain/core/vectorstores";

export const setupCharitesDynamicPrompt = async (
  examples: Example[],
  vectorStore: VectorStore
) => {
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: vectorStore,
    k: 5,
    inputKeys: ["input"],
  });
  for (const example of examples) {
    await exampleSelector.addExample(example);
  }

  const examplePrompt = PromptTemplate.fromTemplate(
    `Input:
{input}

Output:
{output}
`
  );

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: examplePrompt,
    prefix: `You are a YAML file generator. You generate a YAML file based on the examples and input text.
Remember to rewrite the example appropriately according to the intent of the Input, not as is!
You must always, without fail, choose the File name of this style from among the Examples.
You must always, without fail, output YAML based on Examples.
You must always, without fail, does not change File name of this style.
Inputの言語にかかわらず、常に必ず、英語で出力してください。
Even if the language of Input is not English, you must always, without fail, output in English.
You must always, without fail, output in English.
You must not output in Japanese, Chinese, Korean, Arabic, French, German, Spanish, Portuguese, Russian, or any other language.
Do not generate any output that is not in Examples.
You must always, without fail, output with an approach that overwrites existing files whenever possible.
You always, invariably, do not create new files.
You always invariably edit the file shown in the example.
# path: から始まる行は、常に必ず例に登場するものでなければならない。

Examples:`,
    suffix: `===
Input:
{input}

Remember,
You must always, without fail, output in English.
You must always, without fail, output with an approach that overwrites existing files whenever possible.
You always, invariably, do not create new files.
You always invariably edit the file shown in the example.
# path: から始まる行は、常に必ず例に登場するものでなければならない。


Output:
`,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};

export const loadCharitesChain = async ({
  llm,
  vectorStore,
  examples,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
  examples: Example[];
}): Promise<RunnableSequence<any, any>> => {
  const dynamicPrompt = await setupCharitesDynamicPrompt(examples, vectorStore);
  const chain = RunnableSequence.from([dynamicPrompt, llm]);
  return chain;
};
