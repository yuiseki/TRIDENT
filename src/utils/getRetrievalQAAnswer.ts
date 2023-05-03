import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";

export const getRetrievalQAAnswer = async (query: string) => {
  // initialize pinecone
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "",
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  // initialize the LLM and chain
  const model = new OpenAI({
    temperature: 0,
    maxTokens: 3000,
    modelName: "text-davinci-003",
  });
  const baseRetrievalQAChain = RetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(10),
    {
      returnSourceDocuments: true,
    }
  );
  const miniRetrievalQAChain = RetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(4),
    {
      returnSourceDocuments: true,
    }
  );

  // execute chain
  console.info("----- ----- -----");
  let answer;
  try {
    answer = await baseRetrievalQAChain.call({
      query: query,
    });
    console.log("baseRetrievalQAChain succeeded");
  } catch (error) {
    console.error("!!!!! baseRetrievalQAChain Error !!!!!");
    //console.error(error);
    console.log("try miniRetrievalQAChain...");
    try {
      answer = await miniRetrievalQAChain.call({
        query: query,
      });
      console.log("miniRetrievalQAChain succeeded");
    } catch (error) {
      console.log("!!!!! miniRetrievalQAChain also error !!!!!");
      answer = {
        text: " Sorry, something went wrong.",
        sourceDocuments: [],
      };
    }
  }
  console.info("----- ----- -----");
  return answer;
};
