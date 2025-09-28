import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

export const getChatModel = () => {
  if (process.env.USE_OLLAMA === "1") {
    const model = process.env.OLLAMA_CHAT_MODEL !== undefined ? process.env.OLLAMA_CHAT_MODEL : "qwen3:8b";
    const baseUrl = process.env.OLLAMA_BASE_URL !== undefined ? process.env.OLLAMA_BASE_URL : "http://ollama:11434";
    console.log("Using Ollama model:", model);
    console.log("Ollama base URL:", baseUrl);
    return new ChatOllama({
      model: model,
      baseUrl: baseUrl,
      temperature: 0,
    });
  } else if (process.env.CLOUDFLARE_AI_GATEWAY) {
    return new ChatOpenAI({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      model: "gpt-5",
      temperature: 1,
    });
  } else {
    return new ChatOpenAI({
      model: "gpt-5",
      temperature: 1,
    });
  }
};
