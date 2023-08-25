import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { loadTridentInnerChain } from "@/utils/langchain/chains/inner";
import { BaseChatMessage } from "langchain/schema";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- inner -----");
  console.log("----- ----- -----");

  const res = await request.json();
  const pastMessagesJsonString = res.pastMessages;

  console.log("pastMessagesJsonString");
  console.log(pastMessagesJsonString);

  let chatHistory = undefined;
  let chatHistoryLines = "";
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: Array<{ type: string; data: { content: string } }> =
      JSON.parse(pastMessagesJsonString);
    chatHistory =
      pastMessages &&
      pastMessages
        .map((message) => {
          switch (message.type) {
            case "human":
              return `Human: ${message.data.content}`;
            case "ai":
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

  console.log(chatHistoryLines);

  const model = new OpenAI({ temperature: 0 });
  const chain = loadTridentInnerChain({ llm: model });
  const result = await chain.call({
    chat_history: chatHistoryLines,
  });
  console.log(result.text);
  console.log("");

  return NextResponse.json({
    inner: result.text,
  });
}
