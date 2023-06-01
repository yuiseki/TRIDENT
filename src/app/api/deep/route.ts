import { NextResponse } from "next/server";
import { OpenAI } from "langchain/llms/openai";
import { loadTridentDeepChain } from "@/utils/langchain/chains/deep";

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

  const model = new OpenAI({ temperature: 0, maxTokens: 2000 });
  const chain = loadTridentDeepChain({ llm: model });
  const result = await chain.call({ text: query });

  console.log("----- ----- -----");
  console.log("----- deep -----");
  console.log("----- ----- -----");
  console.log("Human:", query);
  console.log("AI:", result.text);
  console.log("");

  return NextResponse.json({
    query: query,
    deep: result.text,
  });
}
