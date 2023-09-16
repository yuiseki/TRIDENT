import { Tool } from "langchain/tools";

import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";

export const loadReflectionTool = async (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "reflection",
    description: `useful for when you can not imagine action. Input: all previous agent_scratchpad.`,
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        `You are an Helpful assistant to choose tool.\nLet's think step by step.\n{text}`
      ),
    }),
  });
};
