import { LLMChain } from "langchain/chains";
import { loadTridentSuggestPrompt } from "./prompt";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { Embeddings } from "langchain/embeddings/base";

export const loadTridentSuggestChain = async ({
  embeddings,
  llm,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
}): Promise<LLMChain> => {
  const prompt = await loadTridentSuggestPrompt(embeddings);
  const chain = new LLMChain({
    llm: llm,
    prompt: prompt,
  });
  return chain;
};
