import { getOverpassQuery } from "@/utils/getOverpassQuery";
import { getOverpassResponse } from "@/utils/getOverpassResponse";
import { getRequestQueryString } from "@/utils/getRequestQueryString";
import { getRetrievalQAAnswer } from "@/utils/getRetrievalQAAnswer";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryString = getRequestQueryString(req);
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

  console.log("answer:", answer.text);

  const overpassQuery = await getOverpassQuery(answer.text);
  console.log("overpass query:", overpassQuery);

  const overpassRes = await getOverpassResponse(overpassQuery);
  console.log("overpass res:", JSON.stringify(overpassRes));

  res.status(200).json(answer);
}
