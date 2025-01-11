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
    llm = new ChatOllama({
      model: "tinyllama:1.1b-chat",
      temperature: 0,
    });
    embeddings = new OllamaEmbeddings({
      model: "all-minilm:22m",
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
    console.log("Creating inner chain with model:", process.env.USE_OLLAMA === "1" ? "phi4:14b" : "openai");
    console.log("LLM config:", JSON.stringify(llm));
    console.log("VectorStore config:", JSON.stringify(vectorStore));
    
    const chain = await loadTridentInnerChain({ llm, vectorStore });
    console.log("Chain created successfully");
    
    console.log("Invoking inner chain with input:", chatHistoryLines.join("\n"));
    const result = await chain.invoke({ input: chatHistoryLines.join("\n") });
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
