import { analyzeGeoJSON } from "@/utils/analyzeGeoJSON";
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
  if (hintString.length > 1000) {
    res.status(400).json({
      status: "ng",
      message: `hint is too long, ${hintString.length}`,
    });
    return;
  }
  if (isQueryStringDanger(hintString)) {
    res.status(400).json({ status: "ng", message: "invalid hint" });
    return;
  }

  const overpassJsonString = getRequestParamAsString(req, "overpassJson");
  if (overpassJsonString === undefined) {
    res.status(400).json({ status: "ng", message: "json is missing" });
    return;
  }
  if (overpassJsonString.length > 30000) {
    res.status(400).json({
      status: "ng",
      message: `json is too long, ${overpassJsonString.length}`,
    });
    return;
  }
  if (isQueryStringDanger(overpassJsonString)) {
    res.status(400).json({ status: "ng", message: "invalid json" });
    return;
  }

  const analyzeResult = await analyzeGeoJSON(
    queryString,
    hintString,
    JSON.parse(overpassJsonString)
  );
  console.log(analyzeResult.text);

  res.status(200).json(analyzeResult);
}
