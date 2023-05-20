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

  let chatHistory = undefined;
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: {
      messages: Array<{ type: string; data: { content: string } }>;
    } = JSON.parse(pastMessagesJsonString);

    const chatHistoryMessages = pastMessages.messages.map(
      (message, idx: number) => {
        if (message.data.content) {
          if (idx === 0 || idx % 2 === 0) {
            return new HumanChatMessage(message.data.content);
          } else {
            return new AIChatMessage(message.data.content);
          }
        } else {
          return new HumanChatMessage("");
        }
      }
    );
    chatHistory = new ChatMessageHistory(chatHistoryMessages);
  }
  const memory = new BufferMemory({
    chatHistory,
  });

  const model = new OpenAI({ temperature: 0, maxTokens: 2000 });
  const surfaceChain = loadGeoAISurfaceChain({ llm: model, memory });
  const surfaceResult = await surfaceChain.call({ input: queryString });

  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log("Human:", queryString);
  console.log("AI:", surfaceResult.response);
  console.log("");

  res.status(200).json({
    surface: surfaceResult.response,
    history: memory.chatHistory,
  });
}
