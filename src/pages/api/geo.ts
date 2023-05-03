import { generateOverpassQuery } from "@/utils/generateOverpassQuery";
import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryString = getRequestParamAsString(req, "query");
  if (queryString === undefined || queryString.length === 0) {
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

  const hintString = getRequestParamAsString(req, "hint");
  if (hintString === undefined) {
    res.status(400).json({ status: "ng", message: "hint is missing" });
    return;
  }
  if (hintString.length > 400) {
    res.status(400).json({ status: "ng", message: "hint is too long" });
    return;
  }
  if (isQueryStringDanger(hintString)) {
    res.status(400).json({ status: "ng", message: "invalid hint" });
    return;
  }

  const overpassQuery = await generateOverpassQuery(queryString, hintString);
  overpassQuery.map((q) => {
    console.log("overpass query:", q);
  });

  res.status(200).json(overpassQuery);
}
