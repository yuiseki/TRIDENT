import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { getRetrievalQAAnswer } from "@/utils/getRetrievalQAAnswer";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
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

  const answer = await getRetrievalQAAnswer(queryString);

  res.status(200).json(answer);
}
