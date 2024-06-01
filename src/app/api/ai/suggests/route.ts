import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { loadTridentSuggestChain } from "@/utils/langchain/chains/suggest";
import { OpenAIEmbeddings } from "@langchain/openai";
import { parsePastMessagesToLines } from "@/utils/trident/parsePastMessagesToLines";
import { QdrantVectorStore } from "@langchain/qdrant";

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

  let llm: ChatOpenAI;
  let embeddings: OpenAIEmbeddings;
  let qdrantCollectionName: string = "trident_suggest_examples_openai";
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
    embeddings = new OpenAIEmbeddings();
    llm = new ChatOpenAI({ temperature: 0 });
  }

  const vectorStore = new QdrantVectorStore(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: qdrantCollectionName,
  });

  const chain = await loadTridentSuggestChain({ llm, vectorStore });
  const result = await chain.invoke({ input: input });

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
