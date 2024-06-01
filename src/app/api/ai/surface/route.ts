import { NextResponse } from "next/server";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/surface";
// using openai
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { parsePastMessagesToChatHistory } from "@/utils/trident/parsePastMessagesToChatHistory";
import { BufferMemory } from "langchain/memory";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start surface -----");

  const reqJson = await request.json();
  const query = reqJson.query;
  const pastMessagesJsonString = reqJson.pastMessages;

  const chatHistory = parsePastMessagesToChatHistory(pastMessagesJsonString);

  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
    chatHistory,
  });

  let embeddings: OpenAIEmbeddings;
  let llm: ChatOpenAI;

  if (process.env.CLOUDFLARE_AI_GATEWAY) {
    embeddings = new OpenAIEmbeddings({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
    });
    llm = new ChatOpenAI({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      temperature: 0,
    });
  } else {
    embeddings = new OpenAIEmbeddings();
    llm = new ChatOpenAI({ temperature: 0 });
  }

  const surfaceChain = await loadTridentSurfaceChain({
    embeddings,
    llm,
    memory,
  });
  const surfaceResult = await surfaceChain.call({ input: query });

  console.log("Human:", query);
  console.log("AI:", surfaceResult.response);
  console.log("");

  const history = await memory.chatHistory.getMessages();
  // debug用
  //console.log(history);

  console.log("----- end surface -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    query: query,
    surface: surfaceResult.response,
    history: history,
  });
}
