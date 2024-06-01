import { Embeddings } from "@langchain/core/embeddings";
import { loadTridentSurfacePrompt } from "./prompt";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { BaseMemory } from "@langchain/core/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

export const loadTridentSurfaceChain = async ({
  embeddings,
  llm,
  memory,
}: {
  embeddings: Embeddings;
  llm: BaseLanguageModel;
  memory?: BaseMemory;
}): Promise<ConversationChain> => {
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
