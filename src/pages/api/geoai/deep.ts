import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import { loadGeoAIDeepAgent } from "@/utils/langchain/agents/geoai";
import {
  loadGeoAIDeepChain,
  loadGeoAIInnerChain,
  loadGeoAISurfaceChain,
} from "@/utils/langchain/chains/geoai";
import { GEOAI_DEEP_PROMPT } from "@/utils/langchain/chains/geoai/prompts";
import {
  loadAreaDetermineTool,
  loadOverpassQueryBuilderTool,
  loadTagsDetermineTool,
} from "@/utils/langchain/tools/openstreetmap";
import { loadEnglishTranslatorChainTool } from "@/utils/langchain/tools/translator";
import { AgentExecutor } from "langchain/agents";
import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
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
  const chain = loadGeoAIDeepChain({ llm: model });
  const result = await chain.call({ text: queryString });

  console.log("");
  console.log(result.text);
  console.log("");

  res.status(200).json({
    deep: result.text,
  });
}
