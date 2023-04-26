import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

dotenv.config();

const vectorStoreSaveDirBase = "public/qiita.com/vector_stores/base";
const loadedVectorStoreBase = await HNSWLib.load(
  vectorStoreSaveDirBase,
  new OpenAIEmbeddings()
);
const resultBase = await loadedVectorStoreBase.similaritySearch(
  "What is style json?",
  4
);
console.log(resultBase);
