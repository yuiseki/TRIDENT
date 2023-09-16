import { Tool } from "langchain/tools";

export class ReliefWebReports extends Tool {
  name = "search-reliefweb-reports";
  description = `useful for when you need to know latest situation reports in the specific country. Input: name of the specific country in English.`;

  async _call(input: string) {
    try {
      let answer = "";
      const reportsEndpoint = "https://api.reliefweb.int/v1/reports";
      const params = new URLSearchParams();
      params.append("appname", "TRIDENT");
      params.append("profile", "full");
      params.append("preset", "latest");
      params.append("slim", "1");
      params.append("limit", "3");
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
          "Date: " + new Date(detail.date.original).toUTCString() + "\n";
        answer += "Title: " + detail.title + "\n";
        answer += "Source: " + detail.url + "\n";
        answer += detail.body.split("\n").slice(0, 5).join("\n") + "\n\n";
      }
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}

export class ReliefWebDisasters extends Tool {
  name = "search-reliefweb-disasters";
  description = `useful for when you need to know latest disasters in the specific country. Input: name of the specific country in English.`;

  async _call(input: string) {
    try {
      let answer = "";
      const disastersEndpoint = "https://api.reliefweb.int/v1/disasters";
      const params = new URLSearchParams();
      params.append("appname", "TRIDENT");
      params.append("profile", "full");
      params.append("preset", "latest");
      params.append("slim", "1");
      params.append("limit", "3");
      params.append("query[value]", `primary_country.name:${input}`);
      const apiUrl = `${disastersEndpoint}?${params.toString()}`;
      console.log(apiUrl);
      const listRes = await fetch(apiUrl);
      const listJson = await listRes.json();
      for (const data of listJson.data) {
        const detail = data.fields;
        answer += "Date: " + new Date(detail.date.event).toUTCString() + "\n";
        answer += "Title: " + detail.name + "\n";
        answer += "Source: " + detail.url_alias + "\n";
        answer +=
          detail.description.split("\n").slice(0, 5).join("\n") + "\n\n";
      }
      return answer;
    } catch (error) {
      return "I don't know.";
    }
  }
}
