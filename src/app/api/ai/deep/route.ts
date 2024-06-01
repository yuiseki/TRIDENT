import { NextResponse } from "next/server";
import { loadTridentDeepChain } from "@/utils/langchain/chains/deep";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

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

  const chain = await loadTridentDeepChain({ llm, vectorStore });
  const result = await chain.invoke({ input: query });

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
