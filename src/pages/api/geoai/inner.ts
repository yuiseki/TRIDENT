import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { loadGeoAIInnerChain } from "@/utils/langchain/chains/geoai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pastMessagesJsonString = getRequestParamAsString(req, "pastMessages");
  const centerJsonString = getRequestParamAsString(req, "center");
  const center = centerJsonString ? JSON.parse(centerJsonString) : undefined;
  console.log("center", center);
  const boundsJsonString = getRequestParamAsString(req, "bounds");
  const boundsJson = boundsJsonString
    ? JSON.parse(boundsJsonString)
    : undefined;
  let bbox;
  if (boundsJson) {
    bbox = [
      boundsJson["_sw"].lat,
      boundsJson["_sw"].lng,
      boundsJson["_ne"].lat,
      boundsJson["_ne"].lng,
    ];
  }
  console.log("bbox", bbox);

  const model = new OpenAI({ temperature: 0 });

  let chatHistory: string[] = [];
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages = JSON.parse(pastMessagesJsonString).messages.map(
      (message: { text?: string }, idx: number) => {
        if ("text" in message && message.text) {
          if (idx === 0 || idx % 2 === 0) {
            return `Human: ${message.text}`;
          } else {
            return `AI: ${message.text}`;
          }
        } else {
          return "";
        }
      }
    );
    chatHistory = pastMessages;
  }

  console.log(chatHistory.join("\n"));

  const chain = loadGeoAIInnerChain({ llm: model });
  const result = await chain.call({
    chat_history: chatHistory.join("\n"),
    bounds: JSON.stringify(bbox),
    center: JSON.stringify(center),
  });

  console.log("");
  console.log(result.text);
  console.log("");

  res.status(200).json({
    inner: result.text,
  });
}
