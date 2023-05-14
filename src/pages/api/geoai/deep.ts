import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import { loadGeoAIDeepAgent } from "@/utils/langchain/agents/geoai";
import {
  loadGeoAIMiddleChain,
  loadGeoAISurfaceChain,
} from "@/utils/langchain/chains/geoai";
import {
  loadAreaDetermineTool,
  loadOverpassQueryBuilderTool,
  loadTagsDetermineTool,
} from "@/utils/langchain/tools/openstreetmap";
import { loadEnglishTranslatorChainTool } from "@/utils/langchain/tools/translator";
import { AgentExecutor } from "langchain/agents";
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

  const model = new OpenAI({ temperature: 0 });

  const tools = [
    await loadAreaDetermineTool(model),
    await loadTagsDetermineTool(model),
    await loadOverpassQueryBuilderTool(model),
    //await loadEnglishTranslatorChainTool(model),
  ];

  const deepAgent = loadGeoAIDeepAgent({ llm: model, tools });
  const deepAgentExecutor = new AgentExecutor({
    agent: deepAgent,
    tools,
  });
  const agentResult = await deepAgentExecutor.call({
    input: "Build query for Overpass API: " + queryString,
  });
  console.log("GeoAI Agent output:", agentResult.output);

  res.status(200).json({ output: agentResult.output });
}
