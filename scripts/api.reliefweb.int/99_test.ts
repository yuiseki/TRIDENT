import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores";

dotenv.config();

const vectorStoreSaveDir =
  "public/api.reliefweb.int/disasters/summaries/vector_stores/";
const loadedVectorStore = await HNSWLib.load(
  vectorStoreSaveDir,
  new OpenAIEmbeddings()
);

const result = await loadedVectorStore.similaritySearchWithScore(
  "What is latest situation in Sudan?",
  4
);
console.log(result);
