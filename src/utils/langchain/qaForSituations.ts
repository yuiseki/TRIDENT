import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

export const qaForSituations = async (query: string) => {
  const model = new OpenAI({
    temperature: 0,
    maxTokens: 1000,
    modelName: "text-davinci-003",
  });

  const vectorStoreSaveDir =
    "public/api.reliefweb.int/reports/summaries/vector_stores/";
  const vectorStore = await HNSWLib.load(
    vectorStoreSaveDir,
    new OpenAIEmbeddings()
  );

  let finalAnswer;
  for await (const k of [4, 3, 2]) {
    console.info("qaForSituation", "retrievalQAChain.retriever.k:", k);
    const retrievalQAChain = RetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(k),
      {
        returnSourceDocuments: true,
      }
    );
    try {
      finalAnswer = await retrievalQAChain.call({
        query: query,
      });
      console.log("qaForSituation", "retrievalQAChain succeeded");
      break;
    } catch (error) {
      console.error("qaForSituation", "retrievalQAChain failed !!!!!");
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
