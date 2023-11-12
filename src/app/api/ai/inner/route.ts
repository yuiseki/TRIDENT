import { NextResponse } from "next/server";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";
import { loadTridentInnerChain } from "@/utils/langchain/chains/inner";
import { BaseChatMessage } from "langchain/schema";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start inner -----");

  const reqJson = await request.json();
  const pastMessagesJsonString = reqJson.pastMessages;

  console.log("pastMessagesJsonString");
  console.log(pastMessagesJsonString);

  let chatHistory = undefined;
  let chatHistoryLines = "";
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: Array<{
      type: string;
      id: string[];
      kwargs: { content: string };
    }> = JSON.parse(pastMessagesJsonString);

    chatHistory =
      pastMessages &&
      pastMessages
        .map((message) => {
          switch (message.id[2]) {
            case "HumanMessage":
              return `Human: ${message.kwargs.content}`;
            case "AIMessage":
              return null;
            default:
              return null;
          }
        })
        .filter((v) => v);
    if (chatHistory) {
      chatHistoryLines = chatHistory.join("\n").replace("\n\n", "\n");
    }
  }

  console.log("chatHistoryLines");
  console.log(chatHistoryLines);

  const model = new OpenAIChat({ temperature: 0 });
  const chain = loadTridentInnerChain({ llm: model });
  const result = await chain.call({
    chat_history: chatHistoryLines,
  });
  console.log(result.text);
  console.log("");

  console.log("----- end inner -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    inner: result.text,
  });
}
