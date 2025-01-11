import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  initializeTridentInnerExampleList,
  loadTridentInnerChain,
} from "@/utils/langchain/chains/loadTridentInnerChain";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { VectorStore } from "@langchain/core/vectorstores";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start inner -----");

  const reqJson = await request.json();
  const pastMessagesJsonString = reqJson.pastMessages;
  let chatHistoryLines = [];
  
  try {
    chatHistoryLines = Array.isArray(pastMessagesJsonString)
      ? pastMessagesJsonString
      : (typeof pastMessagesJsonString === 'string'
        ? JSON.parse(pastMessagesJsonString)
        : []);
  } catch (error) {
    console.error("Error parsing pastMessages:", error);
    chatHistoryLines = [];
  }

  console.log("");
  console.log("chatHistoryLines:");
  console.log(chatHistoryLines.join("\n"));

  let llm: ChatOpenAI | ChatOllama;
  let embeddings: OpenAIEmbeddings | OllamaEmbeddings;
  
  if (process.env.USE_OLLAMA === "1") {
    console.log("Initializing ollama models...");
    try {
      llm = new ChatOllama({
        model: "phi4:14b",
        temperature: 0,
        maxConcurrency: 1,
        maxRetries: 3,
      });
      console.log("ChatOllama initialized successfully");
      
      embeddings = new OllamaEmbeddings({
        model: "phi4:14b",
      });
      console.log("OllamaEmbeddings initialized successfully");
    } catch (error) {
      console.error("Error initializing ollama models:", error);
      throw error;
    }
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
    console.log("Creating inner chain with model:", process.env.USE_OLLAMA === "1" ? "phi4:14b" : "openai");
    console.log("LLM config:", JSON.stringify(llm));
    console.log("VectorStore config:", JSON.stringify(vectorStore));
    
    console.log("Creating inner chain...");
    const chain = await loadTridentInnerChain({ llm, vectorStore });
    console.log("Chain created successfully");
    
    console.log("Invoking inner chain with input:", chatHistoryLines.join("\n"));
    console.log("LLM type:", llm.constructor.name);
    console.log("VectorStore type:", vectorStore.constructor.name);
    
    const result = await Promise.race([
      chain.invoke({ input: chatHistoryLines.join("\n") }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Chain invocation timeout after 60s")), 60000)
      )
    ]);
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
