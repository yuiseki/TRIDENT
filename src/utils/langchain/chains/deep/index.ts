import { LLMChain } from "langchain/chains";
import { loadTridentDeepPrompt } from "./prompt";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { Embeddings } from "langchain/embeddings/base";

export const loadTridentDeepChain = async ({
  embeddings,
  llm,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
}): Promise<LLMChain> => {
  const prompt = await loadTridentDeepPrompt(embeddings);
  const chain = new LLMChain({
    llm: llm,
    prompt: prompt,
  });
  return chain;
};
