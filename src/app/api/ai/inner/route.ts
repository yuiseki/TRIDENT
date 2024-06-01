import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { loadTridentInnerChain } from "@/utils/langchain/chains/inner";
import { OpenAIEmbeddings } from "@langchain/openai";
import { parsePastMessagesToLines } from "@/utils/trident/parsePastMessagesToLines";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

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

  let llm: ChatOpenAI;
  let embeddings: OpenAIEmbeddings;
  if (process.env.CLOUDFLARE_AI_GATEWAY) {
    llm = new ChatOpenAI({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      temperature: 0,
    });
    embeddings = new OpenAIEmbeddings({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
    });
  } else {
    llm = new ChatOpenAI({ temperature: 0 });
    embeddings = new OpenAIEmbeddings();
  }

  const vectorStore = new MemoryVectorStore(embeddings);

  const chain = await loadTridentInnerChain({ llm, vectorStore });
  const result = await chain.invoke({ input: chatHistoryLines });
  console.log(result.text);
  console.log("");

  console.log("----- end inner -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    inner: result.text,
  });
}
