import { getChatModel } from "@/utils/trident/getChatModel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const req = await request.json();
  const query = req.query as string;
  const prompt = req.prompt as string;

  console.log("----- ----- -----");
  console.log("----- start duckdb -----");
  console.log("Human:", query);

  if (!prompt.startsWith("You are an expert of PostgreSQL and PostGIS")) {
    return NextResponse.json({
      prompt: prompt,
      query: query,
      duckdb: "Invalid prompt.",
    });
  }

  let llm = getChatModel();

  const result = await llm.invoke(prompt);

  console.log("AI:", result.content);
  console.log("");
  console.log("----- end duckdb -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    prompt: prompt,
    query: query,
    duckdb: result.content,
  });
}
