import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";
import { ChainTool } from "langchain/tools";

export const loadEnglishTranslatorChainTool = async (
  llm: BaseLanguageModel
) => {
  return new ChainTool({
    name: "english-translator",
    description:
      "useful for when you need to translate Non-English text to English text. You must use this tool whenever you find Non-English text. Input: Non-English text.",
    chain: new LLMChain({
      llm: llm,
      prompt: PromptTemplate.fromTemplate(
        "You are an AI that accurately translates non-English text into English text. Accurately translate the following text into English: {text}"
      ),
    }),
  });
};
