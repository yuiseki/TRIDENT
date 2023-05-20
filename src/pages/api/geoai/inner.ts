import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { loadGeoAIInnerChain } from "@/utils/langchain/chains/geoai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  AIChatMessage,
  BaseChatMessageHistory,
  HumanChatMessage,
} from "langchain/schema";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pastMessagesJsonString = getRequestParamAsString(req, "pastMessages");

  /*
  const centerJsonString = getRequestParamAsString(req, "center");
  const center = centerJsonString ? JSON.parse(centerJsonString) : undefined;
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
  */

  let chatHistory: string[] = [];
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: {
      messages: Array<{ type: string; data: { content: string } }>;
    } = JSON.parse(pastMessagesJsonString);
    chatHistory = pastMessages.messages.map((message, idx) => {
      if (message.data.content) {
        if (idx === 0 || idx % 2 === 0) {
          return `Human: ${message.data.content}`;
        } else {
          return `AI: ${message.data.content}`;
        }
      } else {
        return "";
      }
    });
  }

  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log(chatHistory.join("\n"));
  //console.log("center", JSON.stringify(center));
  //console.log("bbox", JSON.stringify(bbox));

  const model = new OpenAI({ temperature: 0, maxTokens: 2000 });
  const chain = loadGeoAIInnerChain({ llm: model });
  const result = await chain.call({
    chat_history: chatHistory.join("\n"),
    //bounds: JSON.stringify(bbox),
    //center: JSON.stringify(center),
  });

  console.log("");
  console.log(result.text);
  console.log("");

  res.status(200).json({
    inner: result.text,
  });
}
