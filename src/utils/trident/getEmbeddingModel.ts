import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";

export const getEmbeddingModel = () => {
  if (process.env.USE_OLLAMA === "1") {
    if (process.env.OLLAMA_EMBEDDING_MODEL !== undefined) {
      return new OllamaEmbeddings({
        model: process.env.OLLAMA_EMBEDDING_MODEL,
      });
    } else {
      return new OllamaEmbeddings({
        model: "snowflake-arctic-embed:22m",
      });
    }
  } else if (process.env.CLOUDFLARE_AI_GATEWAY) {
    return new OpenAIEmbeddings({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
    });
  } else {
    return new OpenAIEmbeddings();
  }
};
