import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import { loadGeoAISurfaceChain } from "@/utils/langchain/chains/geoai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryString = getRequestParamAsString(req, "query");
  if (queryString === undefined) {
    res.status(400).json({ status: "ng", message: "query is missing" });
    return;
  }
  if (queryString.length > 400) {
    res.status(400).json({ status: "ng", message: "query is too long" });
    return;
  }
  if (isQueryStringDanger(queryString)) {
    res.status(400).json({ status: "ng", message: "invalid query" });
    return;
  }
  const pastMessagesJsonString = getRequestParamAsString(req, "pastMessages");

  const model = new OpenAI({ temperature: 0 });

  let chatHistory = undefined;
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages = JSON.parse(pastMessagesJsonString).messages.map(
      (message: { text?: string }, idx: number) => {
        if ("text" in message && message.text) {
          if (idx === 0 || idx % 2 === 0) {
            return new HumanChatMessage(message.text);
          } else {
            return new AIChatMessage(message.text);
          }
        } else {
          return new HumanChatMessage("");
        }
      }
    );
    chatHistory = new ChatMessageHistory(pastMessages);
  }
  const memory = new BufferMemory({
    chatHistory,
  });

  const surfaceChain = loadGeoAISurfaceChain({ llm: model, memory });
  const surfaceResult = await surfaceChain.call({ input: queryString });

  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log(queryString);
  console.log("");
  console.log(surfaceResult.response);
  console.log("");

  res.status(200).json({
    surface: surfaceResult.response,
    history: memory.chatHistory,
  });
}
