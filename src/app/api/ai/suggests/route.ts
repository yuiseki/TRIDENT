import { NextResponse } from "next/server";
import { OpenAIChat } from "langchain/llms/openai";
import { loadTridentSuggestChain } from "@/utils/langchain/chains/suggest";
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

  const chain = await loadTridentSuggestChain({ embeddings, llm });
  const result = await chain.call({ input: query });

  console.log("----- ----- -----");
  console.log("----- start suggest -----");
  console.log("Human:", query);
  console.log("AI:", result.text);
  console.log("");

  console.log("----- end suggest -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    query: query,
    suggests: result.text,
  });
}
