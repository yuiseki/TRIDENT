import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import {
  loadGeoAIInnerChain,
  loadGeoAISurfaceChain,
} from "@/utils/langchain/chains/geoai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  const chain = loadGeoAIInnerChain({ llm: model, memory });
  const result = await chain.call({ input: undefined });

  console.log("");
  console.log(result.response);
  console.log("");

  res.status(200).json({
    inner: result.response,
    history: memory.chatHistory,
  });
}
