import { Tool } from "langchain/tools";

export class OverpassTokyoRamenCount extends Tool {
  name = "overpass-tokyo-ramen-count";
  description = `useful for when you need to count number of ramen shops by a name of area. Input: a name of administrative district in Tokyo.`;

  async _call(input: string) {
    try {
      const overpassQuery = `[out:json][timeout:30000];
area["name"="東京都"]->.outer;
area["name"="${input}"]->.inner;
(
  nwr["amenity"="restaurant"]["cuisine"="ramen"](area.inner)(area.outer);
);
out geom;`;
      const queryString = `data=${encodeURIComponent(overpassQuery)}`;
      const overpassApiUrl = `https://overpass-api.de/api/interpreter`;

      const res = await fetch(overpassApiUrl, {
        method: "POST",
        body: queryString,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      if (json.elements.length === 0) {
        return "Failed to fetch. change query and try again.";
      }

      let answer = json.elements.length;
      answer = `${input}には${answer}軒のラーメン屋があります。`;
      console.debug("Tool: OverpassTokyoRamenCount, answer:");
      console.debug("\t" + answer);
      // console.debug("");
      return answer;
    } catch (error) {
      console.error("Tool: OverpassTokyoRamenCount, error:", error);
      return "Error. Please try again.";
    }
  }
}
