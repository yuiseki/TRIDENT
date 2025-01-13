import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

export const getChatModel = () => {
  if (process.env.USE_OLLAMA === "1") {
    return new ChatOllama({
      model:
        process.env.OLLAMA_CHAT_MODEL !== undefined
          ? process.env.OLLAMA_CHAT_MODEL
          : "qwen2.5:1.5b",
      baseUrl:
        process.env.OLLAMA_BASE_URL !== undefined
          ? process.env.OLLAMA_BASE_URL
          : "http://127.0.0.1:11434",
      temperature: 0,
    });
  } else if (process.env.CLOUDFLARE_AI_GATEWAY) {
    return new ChatOpenAI({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      temperature: 0,
    });
  } else {
    return new ChatOpenAI({ temperature: 0 });
  }
};
