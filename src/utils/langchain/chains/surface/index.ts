import { BaseLanguageModel } from "langchain/dist/base_language";
import { loadTridentSurfacePrompt } from "./prompt";
import { ConversationChain, LLMChain } from "langchain/chains";
import { BaseMemory, BufferMemory } from "langchain/memory";
import { Embeddings } from "langchain/embeddings/base";

export const loadTridentSurfaceChain = async ({
  embeddings,
  llm,
  memory,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
  memory?: BaseMemory;
}): Promise<LLMChain> => {
  if (memory === undefined) {
    memory = new BufferMemory();
  }
  const prompt = await loadTridentSurfacePrompt(embeddings);
  const chain = new ConversationChain({
    llm: llm,
    prompt: prompt,
    memory: memory,
  });
  return chain;
};
