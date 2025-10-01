import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";

export const getEmbeddingModel = () => {
  if (process.env.USE_OLLAMA === "1") {
    return new OllamaEmbeddings({
      model:
        process.env.OLLAMA_EMBEDDING_MODEL !== undefined
          ? process.env.OLLAMA_EMBEDDING_MODEL
          : "snowflake-arctic-embed:22m",
      baseUrl:
        process.env.OLLAMA_BASE_URL !== undefined
          ? process.env.OLLAMA_BASE_URL
          : "http://127.0.0.1:11434",
    });
  } else {
    return new OpenAIEmbeddings();
  }
};
