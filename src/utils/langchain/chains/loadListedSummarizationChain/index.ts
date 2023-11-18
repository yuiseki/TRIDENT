import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";

export const loadListedSummarizationChain = ({
  llm,
}: {
  llm: BaseLanguageModel;
}): LLMChain => {
  const templateString = `# INSTRUCTIONS:
You are a professional text writer.
Please output the best summary as list based on the following constraints and input text.


You will always reply according to the following rules:
- About 300 words.
- Easy to understand for elementary school students.
- Do not leave out important keywords.
- Do not leave out information about the areas, regions and geographic features.
- Keep sentences concise.
- Briefly list only the main points of the following text.

Input:
{input}

Output:
`;

  const promptTemplate = PromptTemplate.fromTemplate(templateString);
  const chain = new LLMChain({
    llm: llm,
    prompt: promptTemplate,
  });
  return chain;
};
