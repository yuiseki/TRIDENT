import { loadTridentSuggestPrompt } from "./prompt";
import { RunnableSequence } from "@langchain/core/runnables";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

export const loadTridentSuggestChain = async ({
  embeddings,
  llm,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentSuggestPrompt(embeddings);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};
