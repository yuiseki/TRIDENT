import { Tool } from "langchain/tools";

export class ReliefWeb extends Tool {
  name = "search-reliefweb";
  description = `useful for when you need to know latest situation reports in the specific country. Input: name of the specific country in English.`;

  async _call(input: string) {
    try {
      let answer = "";
      const reportsEndpoint = "https://api.reliefweb.int/v1/reports";
      const params = new URLSearchParams();
      params.append("appname", "LAPLACE");
      params.append("profile", "full");
      params.append("preset", "latest");
      params.append("slim", "1");
      params.append("limit", "5");
      params.append(
        "query[value]",
        `primary_country.name:${input} AND format.id:10`
      );
      const apiUrl = `${reportsEndpoint}?${params.toString()}`;
      const listRes = await fetch(apiUrl);
      const listJson = await listRes.json();
      for (const data of listJson.data) {
        const detail = data.fields;
        answer +=
          "date: " + new Date(detail.date.original).toUTCString() + "\n";
        answer += detail.title + "\n";
        answer += detail.body.split("\n").slice(0, 5).join("\n") + "\n";
        answer += "url: " + detail.url + "\n\n";
      }
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}
