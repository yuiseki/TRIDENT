import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export const loadListedSummarizationChain = ({
  llm,
}: {
  llm: BaseLanguageModel;
}): RunnableSequence => {
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
  const chain = RunnableSequence.from([promptTemplate, llm]);
  return chain;
};
