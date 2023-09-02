import { Tool } from "langchain/tools";

export class Wikipedia extends Tool {
  name = "search-wikipedia";
  description = `useful for when you need to ask general questions about people, places, companies, facts, historical events, or other subjects. Input: a search query.`;

  async _call(input: string) {
    try {
      const endpoint = "https://en.wikipedia.org/w/api.php";
      const params = new URLSearchParams();
      params.append("action", "query");
      params.append("list", "search");
      params.append("format", "json");
      params.append("srsearch", input);
      const res = await fetch(`${endpoint}?${params.toString()}`);
      const json = await res.json();
      let answer = json["query"]["search"][0]["snippet"];
      answer = answer.replaceAll(/<[^>]*>/g, "");
      answer = answer.replaceAll("&quot;", "**");
      if ("pageid" in json["query"]["search"][0]) {
        let pageId = json["query"]["search"][0]["pageid"];
        answer = `${answer}\nurl: https://en.wikipedia.org/?curid=${pageId}`;
      }
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}
