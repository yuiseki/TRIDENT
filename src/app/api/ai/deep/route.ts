import { NextResponse } from "next/server";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";
import { loadTridentDeepChain } from "@/utils/langchain/chains/deep";

export async function POST(request: Request) {
  const res = await request.json();
  const query = res.query;

  const model = new OpenAIChat({ temperature: 0 });
  const chain = loadTridentDeepChain({ llm: model });
  const result = await chain.call({ text: query });

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
