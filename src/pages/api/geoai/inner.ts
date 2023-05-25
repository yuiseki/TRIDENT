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
import * as turf from "@turf/turf";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pastMessagesJsonString = getRequestParamAsString(req, "pastMessages");

  const centerJsonString = getRequestParamAsString(req, "center");
  const center = centerJsonString ? JSON.parse(centerJsonString) : undefined;
  const boundsJsonString = getRequestParamAsString(req, "bounds");
  const boundsJson = boundsJsonString
    ? JSON.parse(boundsJsonString)
    : undefined;
  let bbox: number[] | undefined;
  let bboxArea;
  if (boundsJson) {
    bbox = [
      boundsJson["_sw"].lat,
      boundsJson["_sw"].lng,
      boundsJson["_ne"].lat,
      boundsJson["_ne"].lng,
    ];
    const boundsPolygon = turf.bboxPolygon(bbox);
    bboxArea = turf.area(boundsPolygon);
    if (205388007 < bboxArea) {
      bbox = undefined;
    }
  }

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
          return "";
          //return `AI: ${message.data.content}`;
        }
      } else {
        return "";
      }
    });
  }

  console.log("----- ----- -----");
  console.log("----- ----- -----");
  console.log(chatHistory.join("\n").replace("\n\n", "\n"));
  // {"lng":139.77250373249035,"lat":35.7149285624982}
  console.log("center", JSON.stringify(center));
  // [35.70627531465682,139.7596437274433,35.72358087083748,139.78536373754145]
  console.log("bbox", JSON.stringify(bbox));
  // 地球全体: 235420614855566.94
  // 三ノ輪: 3876858.594090954
  // 山手線: 205388007.54351923
  console.log("bbox area:", bboxArea);

  try {
    const model = new OpenAI({ temperature: 0, maxTokens: 2000 });
    const chain = loadGeoAIInnerChain({ llm: model });
    const result = await chain.call({
      chat_history: chatHistory.join("\n").replace("\n\n", "\n"),
      //bbox: JSON.stringify(bbox),
      //center: JSON.stringify(center),
    });

    console.log("");
    console.log(result.text);
    console.log("");

    res.status(200).json({
      inner: result.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      inner: "ConfirmHelpful: Sorry, something went wrong...",
    });
  }
}
