import { NextResponse } from "next/server";
import { OpenAIChat } from "langchain/llms/openai";
import { loadTridentSuggestChain } from "@/utils/langchain/chains/suggest";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { parsePastMessagesToLines } from "@/utils/trident/parsePastMessagesToLines";

export async function POST(request: Request) {
  console.log("----- ----- -----");
  console.log("----- start suggests -----");

  const reqJson = await request.json();
  const lang = reqJson.lang;
  const location = reqJson.location;
  const pastMessagesJsonString = reqJson.pastMessages;

  const chatHistoryLines = parsePastMessagesToLines(
    pastMessagesJsonString,
    true
  );

  let input = "";

  if (lang) {
    input = `Primary language of user: ${lang}\n`;
  }

  if (location) {
    input += `Current location of user: ${location}\n`;
  }

  if (chatHistoryLines) {
    input += `\nChat history:\n${chatHistoryLines}`;
  }

  console.log("");
  console.log("input:");
  console.log(input);

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
  const result = await chain.call({ input });

  console.log("");
  console.log("Suggests:");
  console.log(result.text);
  console.log("");

  console.log("----- end suggest -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    suggests: result.text,
  });
}
