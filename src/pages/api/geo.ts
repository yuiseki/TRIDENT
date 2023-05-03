import { getOverpassQuery } from "@/utils/getOverpassQuery";
import { getOverpassResponse } from "@/utils/getOverpassResponse";
import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { getRetrievalQAAnswer } from "@/utils/getRetrievalQAAnswer";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import type { NextApiRequest, NextApiResponse } from "next";
import osmtogeojson from "osmtogeojson";

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

  const overpassQuery = await getOverpassQuery(queryString, hintString);
  console.log("overpass query:", overpassQuery);

  const overpassRes = await getOverpassResponse(overpassQuery);
  console.log("overpass res:", JSON.stringify(overpassRes));

  const geojson = osmtogeojson(overpassRes);

  res.status(200).json(geojson);
}
