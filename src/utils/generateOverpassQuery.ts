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
(7) Always output valid Overpass API queries as many as possible.
(8) All queries must be enclosed by three backticks on new lines, denoting that it is a code block.
(9) The queries always expands all possible patterns with and without :en for area and tags.

Assistant has a serious personality.

Examples:
===
Question: Where is the headquarters of the UN?
Possibly useful hint: The headquarters of the UN is in New York City, USA.
Multiple Overpass API queries:
\`\`\`
[out:json][timeout:30000];
area["name"="New York"]->.searchArea;
(
  nwr["name"~"United Nations Headquarters"](area.searchArea);
  nwr["name"~"United Nations"](area.searchArea);
);
out geom;
\`\`\`

\`\`\`
[out:json][timeout:30000];
area["name:en"="New York"]->.searchArea;
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
Multiple Overpass API queries:
\`\`\`
[out:json][timeout:30000];
area["name"="Juba"]->.searchArea;
(
  nwr["name"~"United Nations"](area.searchArea);
  nwr["name:en"~"United Nations"](area.searchArea);
  nwr["name"~"UNMISS"](area.searchArea);
  nwr["name:en"~"UNMISS"](area.searchArea);
  nwr["short_name"~"UNMISS"](area.searchArea);
  nwr["short_name:en"~"UNMISS"](area.searchArea);
);
out geom;
\`\`\`

\`\`\`
[out:json][timeout:30000];
area["name:en"="Juba"]->.searchArea;
(
  nwr["name"~"United Nations"](area.searchArea);
  nwr["name:en"~"United Nations"](area.searchArea);
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
Question: Where was the United Nations Charter signed?
Possibly useful hint: The United Nations Charter was signed in San Francisco, California, USA on June 26, 1945.
Multiple Overpass API queries:
\`\`\`
[out:json][timeout:30000];
area["name"="San Francisco"]->.searchArea;
(
  nwr["name"~"United Nations Charter"](area.searchArea);
  nwr["name:en"~"United Nations Charter"](area.searchArea);
  nwr["name"~"UN Charter"](area.searchArea);
  nwr["name:en"~"UN Charter"](area.searchArea);
  nwr["short_name"~"UN Charter"](area.searchArea);
  nwr["short_name:en"~"UN Charter"](area.searchArea);
);
out geom;
\`\`\`

\`\`\`
[out:json][timeout:30000];
area["name"="California"]->.searchArea;
(
  nwr["name"="San Francisco"](area.searchArea);
  nwr["name:en"="San Francisco"](area.searchArea);
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
