import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { loadTridentInnerChain } from "@/utils/langchain/chains/inner";
import { OpenAIEmbeddings } from "@langchain/openai";
import { parsePastMessagesToLines } from "@/utils/trident/parsePastMessagesToLines";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start inner -----");

  const reqJson = await request.json();
  const pastMessagesJsonString = reqJson.pastMessages;

  const chatHistoryLines = parsePastMessagesToLines(
    pastMessagesJsonString,
    true
  );

  console.log("");
  console.log("chatHistoryLines:");
  console.log(chatHistoryLines);

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

  const chain = await loadTridentInnerChain({ embeddings, llm });
  const result = await chain.invoke({ input: chatHistoryLines });
  console.log(result.text);
  console.log("");

  console.log("----- end inner -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    inner: result.text,
  });
}
