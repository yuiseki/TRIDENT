import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

export const getRetrievalQAAnswer = async (query: string) => {
  // initialize the LLM
  const model = new OpenAI({
    temperature: 0,
    maxTokens: 3000,
    modelName: "text-davinci-003",
  });

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

  const situationsVectorStoreSaveDir =
    "public/api.reliefweb.int/reports/summaries/vector_stores/";
  const situationsVectorStore = await HNSWLib.load(
    situationsVectorStoreSaveDir,
    new OpenAIEmbeddings()
  );

  const situationsRetrievalQAChain = RetrievalQAChain.fromLLM(
    model,
    situationsVectorStore.asRetriever(4),
    {
      returnSourceDocuments: true,
    }
  );

  // execute chain
  let answer = undefined;
  for await (const k of [6, 4, 2]) {
    console.info("getRetrievalQAAnswer", "retrievalQAChain.retriever.k:", k);
    const resolutionsRetrievalQAChain = RetrievalQAChain.fromLLM(
      model,
      resolutionsVectorStore.asRetriever(k),
      {
        returnSourceDocuments: true,
      }
    );
    try {
      answer = await resolutionsRetrievalQAChain.call({
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

  const refineChain = loadQARefineChain(model);
  const res = await refineChain()
  return answer;
};
