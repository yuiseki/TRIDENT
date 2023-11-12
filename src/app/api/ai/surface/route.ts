import { NextResponse } from "next/server";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage } from "langchain/schema";
import { loadTridentSurfaceChain } from "@/utils/langchain/chains/surface";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- star surface -----");

  const reqJson = await request.json();
  const query = reqJson.query;
  const pastMessagesJsonString = reqJson.pastMessages;

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
          case "HumanMessage":
            return new HumanMessage(message.kwargs.content);
          case "AIMessage":
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

  const model = new OpenAIChat({ temperature: 0 });
  const surfaceChain = loadTridentSurfaceChain({ llm: model, memory });
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
