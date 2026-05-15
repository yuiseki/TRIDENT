import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";

// Mutual exclusion of USE_OPENAI_API / USE_LLAMA_CPP / USE_OLLAMA is enforced
// at boot by assertInferenceBackend(). USE_OPENAI_API=1 falls through to the
// final OpenAI branch (same as the no-flag default), so it doesn't need a
// dedicated case here.
export const getEmbeddingModel = () => {
  if (process.env.USE_LLAMA_CPP === "1") {
    const baseURL =
      process.env.LLAMA_CPP_EMBEDDING_BASE_URL?.replace(/\/$/, "") ??
      "http://127.0.0.1:18094/v1";
    console.log("Using llama-server embedding:", baseURL);
    return new OpenAIEmbeddings({
      configuration: { baseURL },
      model: "trident-embedding",
      apiKey: process.env.LLAMA_CPP_API_KEY ?? "dummy",
    });
  } else if (process.env.USE_OLLAMA === "1") {
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
