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
(6) Must output valid Overpass API queries as many as possible.
(7) All queries must be enclosed by three backticks on new lines, denoting that it is a code block.
(8) Must expands all possible patterns of Overpass API query with and without :en for area and tags.
(9) Must output Overpass API query at the end to retrieve the region that also expands all variant names for fallback.

Assistant has a serious personality.

==========
Examples of the expanded Overpass API queries:
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

\`\`\`
[out:json][timeout:30000];
area["name"="United States"]->.searchArea;
(
  nwr["name"="San Francisco"](area.searchArea);
  nwr["name:en"="San Francisco"](area.searchArea);
);
out geom;
\`\`\`
==========


Question: {question}
Possibly useful hint: {hint}
Multiple Overpass API queries:`;

  const overpassQueryPromptTemplate = PromptTemplate.fromTemplate(
    overpassQueryPromptTemplateString
  );
  const modelName = "text-davinci-003";
  //const modelName = "gpt-3.5-turbo";
  const model = new OpenAI({
    temperature: 0,
    maxTokens: 2048,
    modelName: modelName,
  });
  const chain = new LLMChain({
    llm: model,
    prompt: overpassQueryPromptTemplate,
  });
  try {
    const res = await chain.call({
      question: question,
      hint: hint,
    });
    const queries = res.text.split("```").filter((i: string) => {
      return i !== "\n" && i !== "\n\n" && i !== "\n===" && i.length !== 0;
    });
    return queries;
  } catch (error) {
    return [];
  }
};
