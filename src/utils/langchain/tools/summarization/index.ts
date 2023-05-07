import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";

const summarizationPrompt = PromptTemplate.fromTemplate(
  "You are an AI who always concisely summarize given text as short as possible. Summarise the following text in a nutshell: {text}"
);

export const loadSummarizationChainTool = (llm: BaseLanguageModel) => {
  return new ChainTool({
    name: "text-summarization",
    chain: new LLMChain({ llm: llm, prompt: summarizationPrompt }),
    description:
      "useful for when you need to summarize a text. Input: a text. Output: a summary of text.",
  });
};
