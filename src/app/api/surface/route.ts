import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
} from "langchain/schema";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/surface";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- surface -----");
  console.log("----- ----- -----");

  const res = await request.json();
  const query = res.query;
  const pastMessagesJsonString = res.pastMessages;

  console.log(pastMessagesJsonString);

  let chatHistory = undefined;
  const pastMessages: BaseChatMessage[] = [];

  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: Array<{ type: string; data: { content: string } }> =
      JSON.parse(pastMessagesJsonString);

    const chatHistoryMessages = pastMessages.map((message, idx: number) => {
      if (message.data.content) {
        if (idx === 0 || idx % 2 === 0) {
          return new HumanChatMessage(message.data.content);
        } else {
          return new AIChatMessage(message.data.content);
        }
      } else {
        return new HumanChatMessage("");
      }
    });
    chatHistory = new ChatMessageHistory(chatHistoryMessages);
  }

  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new ChatMessageHistory(pastMessages),
  });

  const model = new OpenAI({ temperature: 0 });
  const surfaceChain = loadTridentSurfaceChain({ llm: model, memory });
  const surfaceResult = await surfaceChain.call({ input: query });

  console.log("Human:", query);
  console.log("AI:", surfaceResult.response);
  console.log("");

  console.log(await memory.chatHistory.getMessages());

  return NextResponse.json({
    query: query,
    surface: surfaceResult.response,
    history: await memory.chatHistory.getMessages(),
  });
}
