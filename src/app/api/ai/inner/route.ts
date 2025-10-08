import { NextResponse } from "next/server";

import {
  initializeTridentInnerExampleList,
  loadTridentInnerChain,
} from "@/utils/langchain/chains/loadTridentInnerChain";
import { getChatModel } from "@/utils/trident/getChatModel";
import { getEmbeddingModel } from "@/utils/trident/getEmbeddingModel";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";
import { getPGVectorStore } from "@/utils/trident/getPGVectorStore";

const innerTableName = "trident_inner_example_openai";
let innerVectorStorePromise:
  | Promise<Awaited<ReturnType<typeof getPGVectorStore>>>
  | null = null;
let innerExampleInitPromise: Promise<void> | null = null;
let innerChainPromise:
  | Promise<Awaited<ReturnType<typeof loadTridentInnerChain>>>
  | null = null;

const ensureInnerVectorStore = async () => {
  if (!innerVectorStorePromise) {
    innerVectorStorePromise = (async () => {
      const embeddings = getEmbeddingModel();
      return getPGVectorStore(embeddings, innerTableName);
    })().catch((error) => {
      innerVectorStorePromise = null;
      throw error;
    });
  }
  return innerVectorStorePromise;
};

const ensureInnerExamplesInitialized = async () => {
  if (!innerExampleInitPromise) {
    innerExampleInitPromise = (async () => {
      const vectorStore = await ensureInnerVectorStore();
      const checkTableExists = createCheckTableExists({
        vectorStore,
        tableName: innerTableName,
      });
      const checkDocumentExists = createCheckDocumentExists({
        vectorStore,
        tableName: innerTableName,
      });
      await initializeTridentInnerExampleList({
        vectorStore,
        checkTableExists,
        checkDocumentExists,
      });
    })().catch((error) => {
      innerExampleInitPromise = null;
      throw error;
    });
  }
  return innerExampleInitPromise;
};

const ensureInnerChain = async () => {
  if (!innerChainPromise) {
    innerChainPromise = (async () => {
      const vectorStore = await ensureInnerVectorStore();
      await ensureInnerExamplesInitialized();
      const llm = getChatModel();
      console.log(
        "Creating inner chain with model:",
        process.env.USE_OLLAMA === "1" ? "ollama" : "openai"
      );
      return loadTridentInnerChain({ llm, vectorStore });
    })().catch((error) => {
      innerChainPromise = null;
      throw error;
    });
  }
  return innerChainPromise;
};

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

  await ensureInnerExamplesInitialized();

  try {
    const innerChain = await ensureInnerChain();

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
