import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage } from "langchain/schema";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/surface";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- surface -----");
  console.log("----- ----- -----");

  const res = await request.json();
  const query = res.query;
  const pastMessagesJsonString = res.pastMessages;

  console.log(JSON.stringify(pastMessagesJsonString, null, 2));

  let chatHistory = undefined;

  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: Array<{
      type: string;
      id: string[];
      kwargs: { content: string };
    }> = JSON.parse(pastMessagesJsonString);

    const chatHistoryMessages = pastMessages.map((message) => {
      if (message.kwargs.content) {
        switch (message.id[2]) {
          case "human":
            return new HumanMessage(message.kwargs.content);
          case "ai":
            return new AIMessage(message.kwargs.content);
          default:
            return new HumanMessage("");
        }
      } else {
        return new HumanMessage("");
      }
    });
    chatHistory = new ChatMessageHistory(chatHistoryMessages);
  }

  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
    chatHistory: chatHistory,
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
