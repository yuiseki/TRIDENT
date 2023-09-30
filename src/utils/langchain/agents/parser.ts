import { AgentActionOutputParser } from "langchain/agents";
import { AgentAction, AgentFinish } from "langchain/schema";

export class TridentOutputParser extends AgentActionOutputParser {
  async parse(text: string): Promise<AgentAction | AgentFinish> {
    if (text.includes("Final Answer:")) {
      const parts = text.split("Final Answer:");
      const input = parts[parts.length - 1].trim();
      const finalAnswers = { output: input };
      return { log: text, returnValues: finalAnswers };
    }

    const match = /Action Name: (.*)\nAction Input: (.*)/s.exec(text);
    if (!match) {
      return {
        tool: "no-tools-specified",
        toolInput: "no-tools-specified",
        log: "Notice that you are not specifying Action Name and Action Input",
      };
    }

    return {
      tool: match[1].trim(),
      toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
      log: text,
    };
  }

  lc_namespace: string[] = [];

  getFormatInstructions(): string {
    throw new Error("Not implemented");
  }
}
