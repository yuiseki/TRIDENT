import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";

export const loadDateTimeChainTool = async (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "qa-date-time",
    description:
      "useful for when you need to ask questions related date and time. Input: a question related date and time, for example: 'How many days ago was March 19, 1978?'",
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        `You are an Helpful assistant respond question about date and time as accurately as possible. Current date and time is ${new Date().toUTCString()}. Question: {text}\nLet's think step by step.`
      ),
    }),
  });
};
