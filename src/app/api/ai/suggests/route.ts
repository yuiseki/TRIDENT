import { NextResponse } from "next/server";
import {
  initializeTridentSuggestExampleList,
  loadTridentSuggestChain,
} from "@/utils/langchain/chains/loadTridentSuggestChain";
import {
  createCheckDocumentExists,
  createCheckTableExists,
} from "@/utils/langchain/vectorstores/vercel_postgres";
import { getChatModel } from "@/utils/trident/getChatModel";
import { getEmbeddingModel } from "@/utils/trident/getEmbeddingModel";
import { getPGVectorStore } from "@/utils/trident/getPGVectorStore";

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

  const llm = getChatModel();
  const embeddings = getEmbeddingModel();

  const tableName = "trident_suggest_examples_openai";
  const vectorStore = await getPGVectorStore(embeddings, tableName);

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
