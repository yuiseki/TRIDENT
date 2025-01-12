import { NextResponse } from "next/server";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/loadTridentSurfaceChain";
// using openai
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
// using ollama
import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { Embeddings } from "@langchain/core/embeddings";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start surface -----");

  const reqJson = await request.json();
  const query = reqJson.query as string;
  const pastMessagesJsonString = reqJson.pastMessages;
  let chatHistoryLines = [];

  try {
    chatHistoryLines = Array.isArray(pastMessagesJsonString)
      ? pastMessagesJsonString
      : typeof pastMessagesJsonString === "string"
      ? JSON.parse(pastMessagesJsonString)
      : [];
  } catch (error) {
    console.error("Error parsing pastMessages:", error);
    chatHistoryLines = [];
  }

  console.log("");
  console.log("chatHistoryLines:");
  console.log(chatHistoryLines.join("\n"));

  let llm: BaseLanguageModel;
  let embeddings: Embeddings;

  if (process.env.USE_OLLAMA === "1") {
    llm = new ChatOllama({
      model: "phi4:14b",
      temperature: 0,
      maxConcurrency: 1,
      maxRetries: 3,
    });
    embeddings = new OllamaEmbeddings({
      model: "snowflake-arctic-embed:22m",
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
    console.log(
      "Creating surface chain with model:",
      process.env.USE_OLLAMA === "1" ? "ollama" : "openai"
    );
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
    console.error("Error stack:", error.stack);
    console.error("Error cause:", error.cause);
    const errorMessage = error?.message || "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 500 }
    );
  }
}
