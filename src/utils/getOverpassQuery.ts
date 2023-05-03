import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

export const getOverpassQuery = async (question: string) => {
  const overpassQueryPromptTemplateString = `Assistant is an expert OpenStreetMap Overpass API assistant.

The assistant will reply with following rules:
(1) The text of a valid Overpass API query that can be used to answer the question.
(2) To find more than one places, the query must not be too specific. Use OpenStreetMap tags instead of the specific name of the place.
(3) The query timeout must be 30000.
(4) The query must be enclosed by three backticks on new lines, denoting that it is a code block.

Assistant has a serious personality.

Example:
Human: Where is the places that related The headquarters of UNMISS is in Juba, South Sudan.?
Assistant:
\`\`\`

\`\`\`

Human: {question}
Assistant:`;

  const overpassQueryPromptTemplate = PromptTemplate.fromTemplate(
    overpassQueryPromptTemplateString
  );
  const model = new OpenAI({ temperature: 0 });
  const chain = new LLMChain({
    llm: model,
    prompt: overpassQueryPromptTemplate,
  });
  const res = await chain.call({
    question: `Where is the places that related ${question}?`,
  });
  return res.text.split("```")[1];
};
