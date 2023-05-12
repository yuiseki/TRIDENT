import { VectorDBQAChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChainTool } from "langchain/tools";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

export const loadSituationChainTool = async (llm: BaseLanguageModel) => {
  const situationsVectorStoreSaveDir =
    "public/api.reliefweb.int/reports/summaries/vector_stores/";
  const situationsVectorStore = await HNSWLib.load(
    situationsVectorStoreSaveDir,
    new OpenAIEmbeddings()
  );
  return new ChainTool({
    name: "qa-latest-worlds-situation",
    description:
      "useful for when you need to ask latest humanitarian situation. Input: a question about humanitarian situation. Output: answer for the question.",
    chain: VectorDBQAChain.fromLLM(llm, situationsVectorStore),
  });
};
