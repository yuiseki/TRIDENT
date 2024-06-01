import { RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { loadTridentDeepPrompt } from "./prompt";
import { VectorStore } from "@langchain/core/vectorstores";

export const loadTridentDeepChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentDeepPrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
