import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import { examplesV2 } from "@/utils/langchain/tools/openstreetmap/examplesV2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryString = getRequestParamAsString(req, "index");
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
  const index = parseInt(queryString);

  res.status(200).json(examplesV2[index]);
}
