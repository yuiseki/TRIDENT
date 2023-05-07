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

  // initialize pinecone as vector store
  const resolutionsVectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  // initialize the LLM
  const model = new OpenAI({
    temperature: 0,
    maxTokens: 3000,
    modelName: "text-davinci-003",
  });

  // execute chain
  let answer = undefined;
  for await (const k of [6, 4, 2]) {
    console.info("getRetrievalQAAnswer", "retrievalQAChain.retriever.k:", k);
    const retrievalQAChain = RetrievalQAChain.fromLLM(
      model,
      resolutionsVectorStore.asRetriever(k),
      {
        returnSourceDocuments: true,
      }
    );
    try {
      answer = await retrievalQAChain.call({
        query: query,
      });
      console.log("getRetrievalQAAnswer", "retrievalQAChain succeeded");
      break;
    } catch (error) {
      console.error("getRetrievalQAAnswer", "retrievalQAChain failed !!!!!");
      continue;
    }
  }
  if (answer === undefined) {
    answer = {
      text: " Sorry, something went wrong.",
      sourceDocuments: [],
    };
  }
  return answer;
};
