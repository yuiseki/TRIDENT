import { NextResponse } from "next/server";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";
import { loadTridentInnerChain } from "@/utils/langchain/chains/inner";
import { BaseChatMessage } from "langchain/schema";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start inner -----");

  const reqJson = await request.json();
  const pastMessagesJsonString = reqJson.pastMessages;

  console.log("pastMessagesJsonString");
  console.debug(pastMessagesJsonString);

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
              return `${message.kwargs.content}`;
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

  const chain = await loadTridentInnerChain({ embeddings, llm });
  const result = await chain.call({
    input: chatHistoryLines,
  });
  console.log(result.text);
  console.log("");

  console.log("----- end inner -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    inner: result.text,
  });
}
