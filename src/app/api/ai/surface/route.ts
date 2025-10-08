import { NextResponse } from "next/server";

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

const surfaceTableName = "trident_surface_example_openai";
let surfaceVectorStorePromise:
  | Promise<Awaited<ReturnType<typeof getPGVectorStore>>>
  | null = null;
let surfaceExampleInitPromise: Promise<void> | null = null;
let surfaceChainPromise:
  | Promise<Awaited<ReturnType<typeof loadTridentSurfaceChain>>>
  | null = null;

const ensureSurfaceVectorStore = async () => {
  if (!surfaceVectorStorePromise) {
    surfaceVectorStorePromise = (async () => {
      const embeddings = getEmbeddingModel();
      return getPGVectorStore(embeddings, surfaceTableName);
    })().catch((error) => {
      surfaceVectorStorePromise = null;
      throw error;
    });
  }
  return surfaceVectorStorePromise;
};

const ensureSurfaceExamplesInitialized = async () => {
  if (!surfaceExampleInitPromise) {
    surfaceExampleInitPromise = (async () => {
      const vectorStore = await ensureSurfaceVectorStore();
      const checkTableExists = createCheckTableExists({
        vectorStore,
        tableName: surfaceTableName,
      });
      const checkDocumentExists = createCheckDocumentExists({
        vectorStore,
        tableName: surfaceTableName,
      });
      await initializeTridentSurfaceExampleList({
        vectorStore,
        checkTableExists,
        checkDocumentExists,
      });
    })().catch((error) => {
      surfaceExampleInitPromise = null;
      throw error;
    });
  }
  return surfaceExampleInitPromise;
};

const ensureSurfaceChain = async () => {
  if (!surfaceChainPromise) {
    surfaceChainPromise = (async () => {
      const vectorStore = await ensureSurfaceVectorStore();
      await ensureSurfaceExamplesInitialized();
      const llm = getChatModel();
      console.log(
        "Creating surface chain with model:",
        process.env.USE_OLLAMA === "1" ? "ollama" : "openai"
      );
      return loadTridentSurfaceChain({
        llm,
        vectorStore,
      });
    })().catch((error) => {
      surfaceChainPromise = null;
      throw error;
    });
  }
  return surfaceChainPromise;
};

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

  await ensureSurfaceExamplesInitialized();

  try {
    const surfaceChain = await ensureSurfaceChain();

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
