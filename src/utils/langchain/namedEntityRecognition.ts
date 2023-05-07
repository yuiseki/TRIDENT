import { ChainValues } from "langchain/dist/schema";
import { OpenAI } from "langchain/llms/openai";
import { loadNamedEntityRecognitionChain } from "./chains/ner";

export const namedEntityRecognition = async (
  text: string
): Promise<ChainValues> => {
  const modelName = "text-davinci-003";
  //const modelName = "gpt-3.5-turbo";
  const model = new OpenAI({
    temperature: 0,
    //maxTokens: 4096,
    maxTokens: 2048,
    modelName: modelName,
  });

  const chain = loadNamedEntityRecognitionChain({ llm: model });

  try {
    const res = await chain.call({
      text: text,
    });
    return res;
  } catch (error) {
    console.error("error !!!!!");
    return { text: "Sorry, analyze failed." };
  }
};
