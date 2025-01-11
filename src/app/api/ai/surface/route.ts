import { NextResponse } from "next/server";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/loadTridentSurfaceChain";
// using openai
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
// using ollama
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { VectorStore } from "@langchain/core/vectorstores";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start surface -----");

  const reqJson = await request.json();
  const query = reqJson.query as string;
  const pastMessagesJsonString = reqJson.pastMessages;
  let chatHistoryLines = pastMessagesJsonString
    ? (Array.isArray(pastMessagesJsonString) ? pastMessagesJsonString : JSON.parse(pastMessagesJsonString))
    : [];
  chatHistoryLines.push(query);

  console.log("");
  console.log("chatHistoryLines:");
  console.log(chatHistoryLines.join("\n"));

  let llm: ChatOpenAI | ChatOllama;
  let embeddings: OpenAIEmbeddings | OllamaEmbeddings;
  
  if (process.env.USE_OLLAMA === "1") {
    llm = new ChatOllama({
      model: "phi4:14b",
      temperature: 0,
      maxConcurrency: 1,
      maxRetries: 3,
    });
    embeddings = new OllamaEmbeddings({
      model: "phi4:14b",
    });
  } else if (process.env.CLOUDFLARE_AI_GATEWAY) {
    llm = new ChatOpenAI({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      temperature: 0,
    });
    embeddings = new OpenAIEmbeddings({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
    });
  } else {
    llm = new ChatOpenAI({ temperature: 0 });
    embeddings = new OpenAIEmbeddings();
  }

  const vectorStore = new MemoryVectorStore(embeddings);

  try {
    console.log("Creating surface chain with model:", process.env.USE_OLLAMA === "1" ? "phi4:14b" : "openai");
    const surfaceChain = await loadTridentSurfaceChain({
      llm,
      vectorStore,
    });
    
    console.log("Invoking surface chain...");
    const surfaceResult = await surfaceChain.invoke({
      input: chatHistoryLines.join("\n"),
    });

    console.log("Human:", query);
    console.log("AI:", surfaceResult.text);
    console.log("");

    console.log("----- end surface -----");
    console.log("----- ----- -----");

    return NextResponse.json({
      query: query,
      surface: surfaceResult.text,
      history: chatHistoryLines,
    });
  } catch (error: any) {
    console.error("Error in surface route:", error);
    const errorMessage = error?.message || "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 500 }
    );
  }
}
