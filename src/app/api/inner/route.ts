import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { loadTridentInnerChain } from "@/utils/langchain/chains/inner";

export async function POST(request: Request) {
  const res = await request.json();
  const pastMessagesJsonString = res.pastMessages;

  let chatHistory: string[] = [];
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: {
      messages: Array<{ type: string; data: { content: string } }>;
    } = JSON.parse(pastMessagesJsonString);
    chatHistory = pastMessages.messages.map((message, idx) => {
      if (message.data.content) {
        if (idx === 0 || idx % 2 === 0) {
          return `Human: ${message.data.content}`;
        } else {
          return "";
          //return `AI: ${message.data.content}`;
        }
      } else {
        return "";
      }
    });
  }

  console.log("----- ----- -----");
  console.log("----- inner -----");
  console.log("----- ----- -----");
  console.log(chatHistory.join("\n").replace("\n\n", "\n"));

  const model = new OpenAI({ temperature: 0 });
  const chain = loadTridentInnerChain({ llm: model });
  const result = await chain.call({
    chat_history: chatHistory.join("\n").replace("\n\n", "\n"),
  });
  console.log(result.text);
  console.log("");

  return NextResponse.json({
    inner: result.text,
  });
}
