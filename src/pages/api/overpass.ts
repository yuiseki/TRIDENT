import { getOverpassQuery } from "@/utils/getOverpassQuery";
import { getOverpassResponse } from "@/utils/getOverpassResponse";
import { getRequestParamAsString } from "@/utils/getRequestParamAsString";
import { isQueryStringDanger } from "@/utils/isQueryStringDanger";
import type { NextApiRequest, NextApiResponse } from "next";
import osmtogeojson from "osmtogeojson";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const overpassQuery = getRequestParamAsString(req, "query");
  if (overpassQuery === undefined) {
    res.status(400).json({ status: "ng", message: "query is missing" });
    return;
  }
  if (overpassQuery.length > 400) {
    res.status(400).json({ status: "ng", message: "query is too long" });
    return;
  }
  if (isQueryStringDanger(overpassQuery)) {
    res.status(400).json({ status: "ng", message: "invalid query" });
    return;
  }

  console.log("overpass query:", overpassQuery);

  const overpassRes = await getOverpassResponse(overpassQuery);
  console.log(overpassRes);
  const geojson = osmtogeojson(overpassRes);

  res.status(200).json(geojson);
}
