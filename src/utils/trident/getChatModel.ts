import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

export const getChatModel = () => {
  if (process.env.USE_OLLAMA === "1") {
    if (process.env.OLLAMA_CHAT_MODEL !== undefined) {
      return new ChatOllama({
        model: process.env.OLLAMA_CHAT_MODEL,
        temperature: 0,
      });
    } else {
      return new ChatOllama({
        model: "qwen2.5:1.5b",
        temperature: 0,
      });
    }
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
