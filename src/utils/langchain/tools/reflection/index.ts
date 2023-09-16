import { Tool } from "langchain/tools";

import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";

export const loadReflectionTool = async (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "reflection",
    description: `useful for when you can not imagine action. Input: list of your tools and your question.`,
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        `You are an Helpful assistant to advice to use one of the tools.\nLet's think step by step.\n{text}`
      ),
    }),
  });
};
