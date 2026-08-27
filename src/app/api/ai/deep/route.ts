import { NextResponse } from "next/server";
import {
  initializeTridentDeepExampleList,
  loadTridentDeepChain,
} from "@/utils/langchain/chains/loadTridentDeepChain";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";
import { getChatModel } from "@/utils/trident/getChatModel";
import { getEmbeddingModel } from "@/utils/trident/getEmbeddingModel";
import { getPGVectorStore } from "@/utils/trident/getPGVectorStore";
import { buildAreaBoundaryQuery } from "@/utils/trident/buildAreaBoundaryQuery";
import { resolveTridentDeepPromptStyle } from "@/utils/langchain/chains/loadTridentDeepChain/prompt";

const deepTableName = "trident_deep_example_openai";
let deepVectorStorePromise:
  | Promise<Awaited<ReturnType<typeof getPGVectorStore>>>
  | null = null;
let deepExampleInitPromise: Promise<void> | null = null;
let deepChainPromise:
  | Promise<Awaited<ReturnType<typeof loadTridentDeepChain>>>
  | null = null;

const ensureDeepVectorStore = async () => {
  if (!deepVectorStorePromise) {
    deepVectorStorePromise = (async () => {
      const embeddings = getEmbeddingModel();
      return getPGVectorStore(embeddings, deepTableName);
    })().catch((error) => {
      deepVectorStorePromise = null;
      throw error;
    });
  }
  return deepVectorStorePromise;
};

const ensureDeepExamplesInitialized = async () => {
  if (!deepExampleInitPromise) {
    deepExampleInitPromise = (async () => {
      const vectorStore = await ensureDeepVectorStore();
      const checkTableExists = createCheckTableExists({
        vectorStore,
        tableName: deepTableName,
      });
      const checkDocumentExists = createCheckDocumentExists({
        vectorStore,
        tableName: deepTableName,
      });
      await initializeTridentDeepExampleList({
        vectorStore,
        checkTableExists,
        checkDocumentExists,
      });
    })().catch((error) => {
      deepExampleInitPromise = null;
      throw error;
    });
  }
  return deepExampleInitPromise;
};

const ensureDeepChain = async () => {
  if (!deepChainPromise) {
    deepChainPromise = (async () => {
      const vectorStore = await ensureDeepVectorStore();
      await ensureDeepExamplesInitialized();
      const llm = getChatModel("deep");
      console.log("Creating deep chain");
      return loadTridentDeepChain({ llm, vectorStore });
    })().catch((error) => {
      deepChainPromise = null;
      throw error;
    });
  }
  return deepChainPromise;
};

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

  // A bare "Area:" line asks to frame the map, not to find anything. The
  // fine-tuned model only ever saw AreaWithConcern, so it answers one by
  // inventing a concern. The boundary query is a template, so build it.
  if (resolveTridentDeepPromptStyle(process.env) === "finetuned") {
    const boundaryQuery = buildAreaBoundaryQuery(query ?? "");
    if (boundaryQuery) {
      console.log("Deep: area line handled without the model:", query);
      return NextResponse.json({ query, deep: boundaryQuery });
    }
  }

  await ensureDeepExamplesInitialized();

  try {
    const chain = await ensureDeepChain();

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
