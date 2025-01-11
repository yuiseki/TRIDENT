import { NextResponse } from "next/server";
import {
  initializeTridentDeepExampleList,
  loadTridentDeepChain,
} from "@/utils/langchain/chains/loadTridentDeepChain";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

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
  await initializeTridentDeepExampleList({
    vectorStore,
    checkTableExists: async () => false,
    checkDocumentExists: async () => false,
  });

  try {
    console.log("Creating deep chain with model:", process.env.USE_OLLAMA === "1" ? "phi4:14b" : "openai");
    const chain = await loadTridentDeepChain({ llm, vectorStore });
    
    console.log("Invoking deep chain...");
    const result = await chain.invoke({ input: query });

    console.log("----- ----- -----");
    console.log("----- start deep -----");
    console.log("Human:", query);
    console.log("AI:", result.text);
    console.log("");

    console.log("----- end deep -----");
    console.log("----- ----- -----");

    return NextResponse.json({
      query: query,
      deep: result.text,
    });
  } catch (error: any) {
    console.error("Error in deep route:", error);
    const errorMessage = error?.message || "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 500 }
    );
  }
}
