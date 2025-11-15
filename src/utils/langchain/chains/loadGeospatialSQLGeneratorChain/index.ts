import { Embeddings } from "@langchain/core/embeddings";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { FewShotPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { examples } from "./examples.ts";

const setupDynamicPrompt = async (embeddings: Embeddings) => {
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: memoryVectorStore,
    k: 3,
    inputKeys: ["input"],
  });
  for (const example of examples) {
    await exampleSelector.addExample(example);
  }

  const promptForExample = PromptTemplate.fromTemplate(
    `Input:
{input}

Output:
\`\`\`
{output}
\`\`\`
`
  );

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: exampleSelector,
    examplePrompt: promptForExample,
    prefix: `You are an expert of PostgreSQL and PostGIS. You output the best PostgreSQL query based on given table schema and input text.

You will always reply according to the following rules:
- Output valid PostgreSQL query.
- The query MUST be return name, value and geom columns.
- The query MUST be enclosed by three backticks on new lines, denoting that it is a code block.

### Examples: ###`,
    suffix: `
-----

### Table Schema: ###
{tableSchema}

Input text:
{input}

Output:
`,
    inputVariables: ["tableSchema", "input"],
  });
  return dynamicPrompt;
};

export const loadGeospatialSQLGeneratorChain = async ({
  llm,
  embeddings,
}: {
  llm: BaseLanguageModel;
  embeddings: Embeddings;
}): Promise<RunnableSequence<any, any>> => {
  const dynamicPrompt = await setupDynamicPrompt(embeddings);
  const chain = RunnableSequence.from([dynamicPrompt, llm]);
  return chain;
};
