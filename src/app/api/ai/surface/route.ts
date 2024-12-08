import { NextResponse } from "next/server";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/loadTridentSurfaceChain";
// using openai
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start surface -----");

  const reqJson = await request.json();
  const query = reqJson.query as string;
  const pastMessagesJsonString = reqJson.pastMessages;
  let chatHistoryLines = pastMessagesJsonString
    ? (JSON.parse(pastMessagesJsonString) as string[])
    : [];
  chatHistoryLines.push(query);

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

  const vectorStore = new MemoryVectorStore(embeddings);

  const surfaceChain = await loadTridentSurfaceChain({
    llm,
    vectorStore,
  });
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
}
