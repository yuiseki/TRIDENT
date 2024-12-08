import { loadTridentSurfacePrompt } from "./prompt";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { VectorStore } from "@langchain/core/vectorstores";

export const loadTridentSurfaceChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentSurfacePrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
