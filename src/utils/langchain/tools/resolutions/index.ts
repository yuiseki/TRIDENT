import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChainTool } from "langchain/tools";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export const loadResolutionChainTool = async (llm: BaseLanguageModel) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "",
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
  const resolutionsVectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );
  const chainTool = new ChainTool({
    name: "qa-un-resolutions",
    chain: VectorDBQAChain.fromLLM(llm, resolutionsVectorStore),
    description:
      "useful for when you need to ask about the United Nations and it's resolutions. This tool based on most reliable sources. Input: a question can answer based on the UN resolution.",
  });
  return chainTool;
};
