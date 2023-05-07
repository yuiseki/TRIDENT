import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";

export const loadNamedEntityRecognitionChain = ({
  llm,
}: {
  llm: BaseLanguageModel;
}): LLMChain => {
  const namedEntityRecognitionPromptTemplateString = `You are a smart and intelligent Named Entity Recognition (NER) system.
I will provide you the definition of the entities you need to extract, the sentence from where your extract the entities and the output format with examples.

Entity Definition:
1. PERSON: Short name or full name of a person from any geographic regions.
2. DATE: Any format of dates. Dates can also be in natural language.
3. LOC: Name of any geographic location, like cities, countries, continents, districts etc.

Output Format:
{{'PERSON': [list of entities present], 'DATE': [list of entities present], 'LOC': [list of entities present]}}
If no entities are presented in any categories keep it as empty

Examples:

1. Sentence: Mr. Jacob lives in Madrid since 12th January 2015.
Output: {{'PERSON': ['Mr. Jacob'], 'DATE': ['12th January 2015'], 'LOC': ['Madrid']}}

2. Sentence: Mr. Rajeev Mishra and Sunita Roy are friends and they meet each other on 24/03/1998.
Output: {{'PERSON': ['Mr. Rajeev Mishra', 'Sunita Roy'], 'DATE': ['24/03/1998'], 'LOC': []}}

3. Sentence: {text}
Output:`;

  const namedEntityRecognitionPromptTemplate = PromptTemplate.fromTemplate(
    namedEntityRecognitionPromptTemplateString
  );
  const chain = new LLMChain({
    llm: llm,
    prompt: namedEntityRecognitionPromptTemplate,
  });
  return chain;
};
