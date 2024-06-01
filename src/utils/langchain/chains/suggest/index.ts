import { loadTridentSuggestPrompt } from "./prompt";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { VectorStore } from "@langchain/core/vectorstores";

export const loadTridentSuggestChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentSuggestPrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
