import { RunnableSequence } from "@langchain/core/runnables";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { loadTridentDeepPrompt } from "./prompt";

export const loadTridentDeepChain = async ({
  embeddings,
  llm,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentDeepPrompt(embeddings);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
