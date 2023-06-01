import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { TRIDENT_INNER_PROMPT } from "./prompt";

export const loadTridentInnerChain = ({
  llm,
}: {
  llm: BaseLanguageModel;
}): LLMChain => {
  const chain = new LLMChain({
    llm: llm,
    prompt: TRIDENT_INNER_PROMPT,
  });
  return chain;
};
