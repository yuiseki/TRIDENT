import { Tool } from "langchain/tools";

export class Nominatim extends Tool {
  name = "nominatim-geocode";
  description = `useful for when you need to geocode address or name of location to latitude, longitude. Input: a address or a name of location.`;

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
        return "fetch failed. change query";
      }

      const answer = {
        latitude: json[0].lat,
        longitude: json[0].lon,
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
