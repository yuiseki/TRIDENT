import { NextResponse } from "next/server";
import { loadTridentDeepChain } from "@/utils/langchain/chains/deep";
import { OpenAIChat } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

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

  const chain = await loadTridentDeepChain({ embeddings, llm });
  const result = await chain.call({ input: query });

  console.log("----- ----- -----");
  console.log("----- start deep -----");
  console.log("Human:", query);
  console.log("AI:", result.text);
  console.log("");

  console.log("----- end deep -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    query: query,
    deep: result.text,
  });
}
