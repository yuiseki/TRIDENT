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

  // initialize vector store
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
    vectorStore.asRetriever(6),
    {
      returnSourceDocuments: true,
    }
  );
  const smallRetrievalQAChain = RetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(4),
    {
      returnSourceDocuments: true,
    }
  );
  const tinyRetrievalQAChain = RetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(2),
    {
      returnSourceDocuments: true,
    }
  );

  // execute chain
  console.info("----- ----- -----");
  let answer = undefined;
  for await (const retrievalQAChain of [
    baseRetrievalQAChain,
    smallRetrievalQAChain,
    tinyRetrievalQAChain,
  ]) {
    try {
      if ("k" in retrievalQAChain.retriever) {
        console.info(
          "retrievalQAChain.retriever.k:",
          retrievalQAChain.retriever.k
        );
      }
      answer = await retrievalQAChain.call({
        query: query,
      });
      console.error("----- retrievalQAChain succeeded -----");
      break;
    } catch (error) {
      console.error("!!!!! retrievalQAChain failed !!!!!");
      continue;
    }
  }
  if (answer === undefined) {
    answer = {
      text: " Sorry, something went wrong.",
      sourceDocuments: [],
    };
  }
  console.info("----- ----- -----");
  return answer;
};
