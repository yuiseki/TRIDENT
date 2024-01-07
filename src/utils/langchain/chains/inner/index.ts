import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { loadTridentInnerPrompt } from "./prompt";
import { Embeddings } from "langchain/embeddings/base";

export const loadTridentInnerChain = async ({
  embeddings,
  llm,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
}): Promise<LLMChain> => {
  const prompt = await loadTridentInnerPrompt(embeddings);
  const chain = new LLMChain({
    llm: llm,
    prompt: prompt,
  });
  return chain;
};
