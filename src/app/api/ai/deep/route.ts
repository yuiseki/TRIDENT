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
import {
  areaLineTarget,
  buildAreaBoundaryQuery,
  buildGroundedAreaBoundaryQuery,
} from "@/utils/trident/buildAreaBoundaryQuery";
import { groundAreaFilters } from "@/utils/trident/groundAreaFilters";
import { narrowToContainingAreas } from "@/utils/trident/narrowToContainingAreas";
import { fetchAreaAncestors } from "@/lib/osm/areaAncestors";
import {
  OVERPASS_AREA_ID_OFFSET,
  resolveAreaId,
} from "@/lib/osm/resolveAreaRelationId";
import { areaChainFromLine } from "@/lib/osm/areaSearchTerms";
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
      // Prefer the relation the geocoder names. Matching on name:en alone
      // returns every boundary sharing the name.
      const chain = areaChainFromLine(query ?? "");
      const target = areaLineTarget(query ?? "");
      const areaId = target
        ? await resolveAreaId(target, chain.slice(1))
        : null;
      const deep =
        areaId === null
          ? boundaryQuery
          : buildGroundedAreaBoundaryQuery(areaId - OVERPASS_AREA_ID_OFFSET);
      console.log("Deep: area line handled without the model:", query, {
        grounded: areaId !== null,
      });
      return NextResponse.json({ query, deep });
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

    // The model writes area filters by name, and a name is not one place:
    // `area["name:en"="Hiroshima"]` unions the city, an island and a quarter
    // in Tokushima. Ask the geocoder which relation the name means and filter
    // by its id. A name it cannot place keeps the filter the model wrote.
    const { query: groundedQuery, grounded, unresolved, chainAreaIds } =
      await groundAreaFilters(
        result.text,
        resolveAreaId,
        areaChainFromLine(query ?? "")
      );
    if (grounded.length > 0 || unresolved.length > 0) {
      console.log("Deep areas grounded:", grounded, "unresolved:", unresolved);
    }

    // An area chain becomes an intersection, so an outer area that does not
    // contain the inner one empties the result. The inner layer invents a
    // parent for places it does not know — "Matsuyama City, Tokyo, Japan" —
    // and both names resolve, so nothing before this point notices.
    const { query: narrowedQuery, narrowed } = await narrowToContainingAreas(
      groundedQuery,
      chainAreaIds.map((id) => id - OVERPASS_AREA_ID_OFFSET),
      fetchAreaAncestors
    );
    if (narrowed.length > 0) {
      console.log("Deep areas narrowed, outer did not contain inner:", narrowed);
    }

    return NextResponse.json({
      query: query,
      deep: narrowedQuery,
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
