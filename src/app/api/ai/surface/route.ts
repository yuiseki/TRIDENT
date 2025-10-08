import { NextResponse } from "next/server";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import {
  initializeTridentSurfaceExampleList,
  loadTridentSurfaceChain,
} from "@/utils/langchain/chains/loadTridentSurfaceChain";
import { getChatModel } from "@/utils/trident/getChatModel";
import { getEmbeddingModel } from "@/utils/trident/getEmbeddingModel";
import { getPGVectorStore } from "@/utils/trident/getPGVectorStore";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";

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
  chatHistoryLines.push(query);

  console.log("");
  console.log("chatHistoryLines:");
  console.log(chatHistoryLines.join("\n"));

  const llm = getChatModel();
  const embeddings = getEmbeddingModel();

  const tableName = "trident_surface_example_openai";
  const vectorStore = await getPGVectorStore(embeddings, tableName);

  const checkTableExists = createCheckTableExists({ vectorStore, tableName });
  const checkDocumentExists = createCheckDocumentExists({
    vectorStore,
    tableName,
  });

  await initializeTridentSurfaceExampleList({
    vectorStore,
    checkTableExists,
    checkDocumentExists,
  });

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
