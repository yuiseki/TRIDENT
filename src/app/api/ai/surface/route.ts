import { NextResponse } from "next/server";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage } from "langchain/schema";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/surface";
// using openai
import { OpenAIChat } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { parsePastMessagesToChatHistory } from "@/utils/trident/parsePastMessagesToChatHistory";

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
  let llm: OpenAIChat;

  if (process.env.CLOUDFLARE_AI_GATEWAY) {
    embeddings = new OpenAIEmbeddings({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
    });
    llm = new OpenAIChat({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      temperature: 0,
    });
  } else {
    embeddings = new OpenAIEmbeddings();
    llm = new OpenAIChat({ temperature: 0 });
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
  console.log(history);

  console.log("----- end surface -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    query: query,
    surface: surfaceResult.response,
    history: history,
  });
}
