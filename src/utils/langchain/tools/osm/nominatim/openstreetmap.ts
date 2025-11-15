import { ChainTool } from "@langchain/classic/tools";

export class NominatimOpenStreetMap extends ChainTool {
  name = "nominatim-search-openstreetmap";
  description = `useful for when you need to get OpenStreetMap entity by name of location. Input: a name of location.`;

  async _call(input: string) {
    console.debug("Tool nominatim, input:", input);
    try {
      const endpoint = "https://nominatim.openstreetmap.org/search";
      const searchParams = new URLSearchParams();
      searchParams.append("format", "jsonv2");
      searchParams.append("polygon_geojson", "0");
      searchParams.append("q", input);

      const res = await fetch(`${endpoint}?${searchParams.toString()}`);
      const json = await res.json();

      if (json.length === 0) {
        return "failed to fetch. change query";
      }

      const answer = {
        osm_id: json[0].osm_id,
        osm_type: json[0].osm_type,
        name: json[0].name,
        display_name: json[0].display_name,
      };

      console.debug("Tool nominatim, answer:");
      console.debug(answer);
      console.debug("");
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}
