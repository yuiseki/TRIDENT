import { NextResponse } from "next/server";
import {
  initializeTridentDeepExampleList,
  loadTridentDeepChain,
} from "@/utils/langchain/chains/loadTridentDeepChain";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

  let llm: ChatOpenAI;
  let embeddings: OpenAIEmbeddings;
  if (process.env.CLOUDFLARE_AI_GATEWAY) {
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

  const tableName = "trident_deep_example_openai";
  const vectorStore = await VercelPostgres.initialize(embeddings, {
    tableName,
  });

  const checkTableExists = createCheckTableExists({ vectorStore, tableName });
  const checkDocumentExists = createCheckDocumentExists({
    vectorStore,
    tableName,
  });
  await initializeTridentDeepExampleList({
    vectorStore,
    checkTableExists,
    checkDocumentExists,
  });

  const chain = await loadTridentDeepChain({ llm, vectorStore });
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
}
