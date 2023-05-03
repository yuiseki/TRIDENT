import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

export const generateOverpassQuery = async (
  question: string,
  hint: string
): Promise<string[]> => {
  const overpassQueryPromptTemplateString = `Assistant is an expert OpenStreetMap Overpass API assistant.

The assistant will always reply according to the following rules:
(1) The text of a valid Overpass API query that can be used to answer the question.
(3) The query timeout must be 30000.
(4) The query utilize a area specifier.
(4) The query will search nwr.
(5) The query must be out geom.
(6) The query must be enclosed by three backticks on new lines, denoting that it is a code block.
(7) Always output many valid Overpass API queries as possible. All queries must be enclosed by three backticks on new lines, denoting that it is a code block.

Assistant has a serious personality.

Example 1:
===
Question: Where is the headquarters of the UN?
Possibly useful hint: The headquarters of the UN is in New York City, USA.
Overpass API query:
\`\`\`
[out:json][timeout:30000];
area["name"="New York"]->.searchArea;
(
  nwr["name"~"United Nations Headquarters"](area.searchArea);
  nwr["name"~"United Nations"](area.searchArea);
);
out geom;
\`\`\`
===

Example 2:
===
Question: Where is the headquarters of UNMISS?
Possibly useful hint: The headquarters of UNMISS is in Juba, South Sudan.
Overpass API query:
\`\`\`
[out:json][timeout:30000];
area["name"="Juba"]->.searchArea;
(
  nwr["name"~"UNMISS"](area.searchArea);
  nwr["name:en"~"UNMISS"](area.searchArea);
  nwr["short_name"~"UNMISS"](area.searchArea);
  nwr["short_name:en"~"UNMISS"](area.searchArea);
);
out geom;
\`\`\`
===

Example 3:
===
Question: Where is the headquarters of UNHCR?
Possibly useful hint: The headquarters of UNHCR is in Geneva, Switzerland.
Overpass API query:
\`\`\`
[out:json][timeout:30000];
area["name:en"="Geneva"]->.searchArea;
(
  nwr["name:en"~"United Nations High Commissioner for Refugees"](area.searchArea);
  nwr["name:en"~"UNHCR"](area.searchArea);
  nwr["short_name:en"~"UNHCR"](area.searchArea);
);
out geom;
\`\`\`
===

Example 4:
===
Question: Where is the headquarters of the UNIFIL?
Possibly useful hint: The headquarters of the UNIFIL is in southern Lebanon.
Overpass API query:
\`\`\`
[out:json][timeout:Lebanon];
area["name:en"="Geneva"]->.searchArea;
(
  nwr["name"~"UNIFIL"](area.searchArea);
  nwr["name:en"~"UNIFIL"](area.searchArea);
  nwr["short_name"~"UNIFIL"](area.searchArea);
  nwr["short_name:en"~"UNIFIL"](area.searchArea);
);
out geom;
\`\`\`
===

Question: {question}
Possibly useful hint: {hint}
Multiple Overpass API queries:`;

  const overpassQueryPromptTemplate = PromptTemplate.fromTemplate(
    overpassQueryPromptTemplateString
  );
  //const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
  const model = new OpenAI({ temperature: 0, maxTokens: 2000 });
  const chain = new LLMChain({
    llm: model,
    prompt: overpassQueryPromptTemplate,
  });
  const res = await chain.call({
    question: question,
    hint: hint,
  });
  const queries = res.text.split("```").filter((i: string) => {
    return i !== "\n" && i !== "\n\n" && i !== "\n===" && i.length !== 0;
  });
  return queries;
};
