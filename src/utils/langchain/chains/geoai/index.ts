import { ConversationChain } from "langchain/chains";
import { GEOAI_MIDDLE_PROMPT, GEOAI_SURFACE_PROMPT } from "./prompts";
import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { BaseMemory, BufferMemory } from "langchain/memory";
import { Tool } from "langchain/tools";
import { GeoAIDeepPromptTemplate } from "../../agents/geoai";

export const loadGeoAISurfaceChain = ({
  llm,
  memory,
}: {
  llm: BaseLanguageModel;
  memory?: BaseMemory;
}): LLMChain => {
  if (memory === undefined) {
    memory = new BufferMemory();
  }
  const chain = new ConversationChain({
    llm: llm,
    prompt: GEOAI_SURFACE_PROMPT,
    memory: memory,
  });
  return chain;
};

export const loadGeoAIMiddleChain = ({
  llm,
  memory,
}: {
  llm: BaseLanguageModel;
  memory?: BaseMemory;
}): LLMChain => {
  if (memory === undefined) {
    memory = new BufferMemory();
  }
  const chain = new ConversationChain({
    llm: llm,
    prompt: GEOAI_MIDDLE_PROMPT,
    memory: memory,
  });
  return chain;
};

export const loadGeoAIDeepChain = ({
  llm,
  tools,
}: {
  llm: BaseLanguageModel;
  tools: Tool[];
}): LLMChain => {
  const chain = new LLMChain({
    llm: llm,
    prompt: new GeoAIDeepPromptTemplate({
      tools,
      inputVariables: ["input", "agent_scratchpad"],
    }),
  });
  return chain;
};
