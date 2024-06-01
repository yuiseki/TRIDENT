import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { loadTridentInnerPrompt } from "./prompt";
import { VectorStore } from "@langchain/core/vectorstores";

export const loadTridentInnerChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentInnerPrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
