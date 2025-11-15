import { ChainTool } from "@langchain/classic/tools";

export class Wikipedia extends ChainTool {
  name = "search-wikipedia";
  description = `useful for when you need to ask general questions about people, places, companies, facts, historical events, or other subjects. Input: a very simple search query for wikipedia in English. MUST NOT input the question as-is.`;

  async _call(input: string) {
    // console.debug("Tool wikipedia, input:", input);
    try {
      const endpoint = "https://en.wikipedia.org/w/api.php";
      const searchParams = new URLSearchParams();
      searchParams.append("format", "json");
      searchParams.append("action", "query");
      searchParams.append("list", "search");
      searchParams.append("srsearch", input);

      const res = await fetch(`${endpoint}?${searchParams.toString()}`);
      const json = await res.json();

      let answer = json["query"]["search"][0]["snippet"];
      answer = answer.replaceAll(/<[^>]*>/g, "");
      answer = answer.replaceAll("&quot;", "**");

      if ("title" in json["query"]["search"][0]) {
        const title = json["query"]["search"][0]["title"];
        const summaryParams = new URLSearchParams();
        summaryParams.append("format", "json");
        summaryParams.append("action", "query");
        summaryParams.append("prop", "extracts");
        summaryParams.append("exintro", "");
        summaryParams.append("explaintext", "");
        summaryParams.append("titles", title);
        const summaryRes = await fetch(
          `${endpoint}?${summaryParams.toString()}`
        );
        const summaryJson = await summaryRes.json();
        const pageId = Object.keys(summaryJson["query"]["pages"])[0];
        const extract = summaryJson["query"]["pages"][pageId]["extract"];
        answer = extract;
        answer = `# ${json["query"]["search"][0]["title"]}:\n${answer}`;
      }
      if ("pageid" in json["query"]["search"][0]) {
        let pageId = json["query"]["search"][0]["pageid"];
        answer = `${answer}\nurl: https://en.wikipedia.org/?curid=${pageId}`;
      }
      // console.debug("Tool wikipedia, answer:");
      // console.debug(answer);
      // console.debug("");
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}
