import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  initializeTridentInnerExampleList,
  loadTridentInnerChain,
} from "@/utils/langchain/chains/loadTridentInnerChain";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { Embeddings } from "@langchain/core/embeddings";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start inner -----");

  const reqJson = await request.json();
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
  await initializeTridentInnerExampleList({
    vectorStore,
    checkTableExists: async () => false,
    checkDocumentExists: async () => false,
  });

  try {
    console.log(
      "Creating inner chain with model:",
      process.env.USE_OLLAMA === "1" ? "ollama" : "openai"
    );
    const innerChain = await loadTridentInnerChain({ llm, vectorStore });

    console.log("Invoking inner chain...");
    const result = await innerChain.invoke({
      input: chatHistoryLines.join("\n"),
    });

    console.log("Chain result:", result);
    console.log("Result text:", result.text);
    console.log("");

    console.log("----- end inner -----");
    console.log("----- ----- -----");

    return NextResponse.json({
      inner: result.text,
    });
  } catch (error: any) {
    console.error("Error in inner route:", error);
    console.error("Error stack:", error.stack);
    console.error("Error cause:", error.cause);
    const errorMessage = error?.message || "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 500 }
    );
  }
}
