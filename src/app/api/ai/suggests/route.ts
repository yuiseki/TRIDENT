import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  initializeTridentSuggestExampleList,
  loadTridentSuggestChain,
} from "@/utils/langchain/chains/loadTridentSuggestChain";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start suggests -----");

  const reqJson = await request.json();
  const lang = reqJson.lang;
  const location = reqJson.location;
  const chatHistoryLines = reqJson.dialogueList;

  let input = "";

  if (lang) {
    input = `Primary language of user: ${lang}\n`;
  }

  if (location) {
    input += `Current location of user: ${location}\n`;
  }

  if (chatHistoryLines) {
    input += `\nChat history:\n${chatHistoryLines}`;
  }

  console.log("");
  console.log("input:");
  console.log(input);

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

  const tableName = "trident_suggest_examples_openai";
  const vectorStore = await VercelPostgres.initialize(embeddings, {
    tableName: tableName,
  });

  const checkTableExists = createCheckTableExists({ vectorStore, tableName });
  const checkDocumentExists = createCheckDocumentExists({
    vectorStore,
    tableName,
  });
  await initializeTridentSuggestExampleList({
    vectorStore,
    checkTableExists,
    checkDocumentExists,
  });

  const chain = await loadTridentSuggestChain({ llm, vectorStore });
  const result = await chain.invoke({ input: input });
  await vectorStore.end();

  console.log("");
  console.log("Suggests:");
  console.log(result.text);
  console.log("");

  console.log("----- end suggest -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    suggests: result.text,
  });
}
