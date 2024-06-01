import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { loadTridentInnerPrompt } from "./prompt";

export const loadTridentInnerChain = async ({
  embeddings,
  llm,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentInnerPrompt(embeddings);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
