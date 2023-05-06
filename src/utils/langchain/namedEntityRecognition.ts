import { LLMChain } from "langchain/chains";
import { ChainValues } from "langchain/dist/schema";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

export const namedEntityRecognition = async (
  sentence: string
): Promise<ChainValues> => {
  const namedEntityRecognitionPromptTemplateString = `You are a smart and intelligent Named Entity Recognition (NER) system.
I will provide you the definition of the entities you need to extract, the sentence from where your extract the entities and the output format with examples.

Entity Definition:
1. PERSON: Short name or full name of a person from any geographic regions.
2. DATE: Any format of dates. Dates can also be in natural language.
3. LOC: Name of any geographic location, like cities, countries, continents, districts etc.

Output Format:
{{'PERSON': [list of entities present], 'DATE': [list of entities present], 'LOC': [list of entities present]}}
If no entities are presented in any categories keep it None

Examples:

1. Sentence: Mr. Jacob lives in Madrid since 12th January 2015.
Output: {{'PERSON': ['Mr. Jacob'], 'DATE': ['12th January 2015'], 'LOC': ['Madrid']}}

2. Sentence: Mr. Rajeev Mishra and Sunita Roy are friends and they meet each other on 24/03/1998.
Output: {{'PERSON': ['Mr. Rajeev Mishra', 'Sunita Roy'], 'DATE': ['24/03/1998'], 'LOC': ['None']}}

3. Sentence: {sentence}
Output:`;

  const namedEntityRecognitionPromptTemplate = PromptTemplate.fromTemplate(
    namedEntityRecognitionPromptTemplateString
  );
  const modelName = "text-davinci-003";
  //const modelName = "gpt-3.5-turbo";
  const model = new OpenAI({
    temperature: 0,
    //maxTokens: 4096,
    maxTokens: 2048,
    modelName: modelName,
  });
  const chain = new LLMChain({
    llm: model,
    prompt: namedEntityRecognitionPromptTemplate,
  });
  try {
    const res = await chain.call({
      sentence: sentence,
    });
    return res;
  } catch (error) {
    console.error("error !!!!!");
    return { text: "Sorry, analyze failed." };
  }
};
