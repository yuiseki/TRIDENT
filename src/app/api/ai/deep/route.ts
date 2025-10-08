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

let deepExampleInitPromise: Promise<void> | null = null;

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

  const llm = getChatModel();
  const embeddings = getEmbeddingModel();

  const tableName = "trident_deep_example_openai";
  const vectorStore = await getPGVectorStore(embeddings, tableName);

  const checkTableExists = createCheckTableExists({ vectorStore, tableName });
  const checkDocumentExists = createCheckDocumentExists({
    vectorStore,
    tableName,
  });

  if (!deepExampleInitPromise) {
    deepExampleInitPromise = initializeTridentDeepExampleList({
      vectorStore,
      checkTableExists,
      checkDocumentExists,
    }).catch((error) => {
      deepExampleInitPromise = null;
      throw error;
    });
  }
  await deepExampleInitPromise;

  try {
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
