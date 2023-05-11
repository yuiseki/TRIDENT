import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";

export const qaForResolutions = async (query: string) => {
  // initialize the LLM
  const model = new OpenAI({
    temperature: 0,
    maxTokens: 3000,
    modelName: "text-davinci-003",
  });

  // initialize pinecone client
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

  let finalAnswer;
  // generate answer based on resolution
  for await (const k of [4, 3, 2]) {
    console.info(
      "getRetrievalQAAnswer resolution",
      "retrievalQAChain.retriever.k:",
      k
    );
    const resolutionsRetrievalQAChain = RetrievalQAChain.fromLLM(
      model,
      resolutionsVectorStore.asRetriever(k),
      {
        returnSourceDocuments: true,
      }
    );
    try {
      finalAnswer = await resolutionsRetrievalQAChain.call({
        query: query,
      });
      console.log(
        "getRetrievalQAAnswer resolution",
        "retrievalQAChain succeeded"
      );
      break;
    } catch (error) {
      console.error(
        "getRetrievalQAAnswer resolution",
        "retrievalQAChain failed !!!!!"
      );
      continue;
    }
  }
  if (finalAnswer === undefined) {
    finalAnswer = {
      text: " Sorry, something went wrong.",
      sourceDocuments: [],
    };
  }

  return finalAnswer;
};