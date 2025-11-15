import { ChainTool } from "@langchain/classic/tools";

// input: a short name of country from the UN M49 Standard
// output: ISO-3 (ISO 3166 alpha-3) codes of the country
export class HDXCountryCode extends ChainTool {
  name = "hdx-country-code";
  description =
    "useful for when you need to get the ISO-3 (ISO 3166 alpha-3) codes of a country. Input: a short name of country from the UN M49 Standard.";
  app_identifier = "VFJJREVOVDp5dWlzZWtpQGdtYWlsLmNvbQ==";

  async _call(input: string) {
    try {
      const endpoint = "https://hapi.humdata.org/api/v1/metadata/location";
      const searchParams = new URLSearchParams();
      searchParams.append("app_identifier", this.app_identifier);
      searchParams.append("output_format", "json");
      searchParams.append("limit", "1");
      searchParams.append("offset", "0");
      searchParams.append("name", input);

      const res = await fetch(`${endpoint}?${searchParams.toString()}`);

      const json = await res.json();

      if (json["data"].length === 0) {
        return "Failed to fetch. Change query and try again.";
      }

      let result = json["data"][0];
      let answer = result["name"];
      answer = answer + ":\n";
      answer = answer + "ISO-3 code: " + result["code"];

      // console.debug("Tool HDXCountryCode, answer:");
      // console.debug(answer);
      // console.debug("");
      return answer;
    } catch (error) {
      return "Error. Please try again.";
    }
  }
}
