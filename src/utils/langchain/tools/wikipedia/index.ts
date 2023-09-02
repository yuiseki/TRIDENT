import { Tool } from "langchain/tools";

export class Wikipedia extends Tool {
  name = "search-wikipedia";
  description = `useful for when you need to ask general questions about people, places, companies, facts, historical events, or other subjects. Input: a search keyword, for example: 'Secretary-General of the United Nations'`;

  async _call(input: string) {
    try {
      const endpoint = "https://en.wikipedia.org/w/api.php";
      const searchParams = new URLSearchParams();
      searchParams.append("action", "query");
      searchParams.append("format", "json");
      searchParams.append("list", "search");
      searchParams.append("srsearch", input);
      const searchUrl = `${endpoint}?${searchParams.toString()}`;
      const searchRes = await fetch(searchUrl);
      const searchJson = await searchRes.json();
      let title = searchJson["query"]["search"][0]["title"];
      let pageid = searchJson["query"]["search"][0]["pageid"];
      const detailParams = new URLSearchParams();
      detailParams.append("action", "query");
      detailParams.append("format", "json");
      detailParams.append("prop", "extracts");
      detailParams.append("exintro", "");
      detailParams.append("explaintext", "");
      detailParams.append("redirects", "1");
      detailParams.append("titles", title);
      const detailUrl = `${endpoint}?${detailParams.toString()}`;
      const detailRes = await fetch(detailUrl);
      const detailJson = await detailRes.json();
      let answer = detailJson["query"]["pages"][pageid]["extract"];
      answer = answer.replaceAll(/<[^>]*>/g, "");
      answer = answer.replaceAll("&quot;", "**");
      if ("pageid" in searchJson["query"]["search"][0]) {
        let pageId = searchJson["query"]["search"][0]["pageid"];
        answer = `${answer}\nSource: https://en.wikipedia.org/?curid=${pageId}`;
      }
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}
