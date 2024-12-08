import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  initializeTridentInnerExampleList,
  loadTridentInnerChain,
} from "@/utils/langchain/chains/loadTridentInnerChain";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start inner -----");

  const reqJson = await request.json();
  const pastMessagesJsonString = reqJson.pastMessages;
  const chatHistoryLines = pastMessagesJsonString
    ? JSON.parse(pastMessagesJsonString)
    : [];

  console.log("");
  console.log("chatHistoryLines:");
  console.log(chatHistoryLines.join("\n"));

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

  const tableName = "trident_inner_example_openai";
  const vectorStore = await VercelPostgres.initialize(embeddings, {
    tableName,
  });

  const checkTableExists = createCheckTableExists({ vectorStore, tableName });
  const checkDocumentExists = createCheckDocumentExists({
    vectorStore,
    tableName,
  });
  await initializeTridentInnerExampleList({
    vectorStore,
    checkTableExists,
    checkDocumentExists,
  });

  const chain = await loadTridentInnerChain({ llm, vectorStore });
  const result = await chain.invoke({ input: chatHistoryLines.join("\n") });
  console.log(result.text);
  console.log("");

  console.log("----- end inner -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    inner: result.text,
  });
}
