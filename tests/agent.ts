import * as dotenv from "dotenv";
dotenv.config();

import { AgentAction, AgentFinish, AgentStep } from "langchain/schema";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";

import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";
import {
  ReliefWebDisasters,
  ReliefWebReports,
} from "../src/utils/langchain/tools/reliefweb/index.ts";
import { loadDateTimeChainTool } from "../src/utils/langchain/tools/datetime/index.ts";

import { loadTridentAgentChain } from "../src/utils/langchain/agents/index.ts";
import { TridentOutputParser } from "../src/utils/langchain/agents/parser.ts";
import { loadReflectionTool } from "../src/utils/langchain/tools/reflection/index.ts";

const llm = new OpenAI({ temperature: 0 });
const tools = [
  new Wikipedia(),
  new ReliefWebReports(),
  new ReliefWebDisasters(),
  await loadReflectionTool(llm),
  await loadDateTimeChainTool(llm),
];
const llmChain = loadTridentAgentChain({ llm, tools });

const questions = [
  "リビアの正式な国名は何ですか？",
  "リビアはどの地域に位置していますか？",
  "リビアはどのような地形ですか？",
  "リビアの面積はどれくらいですか？",
  "リビアはどのような統治体制ですか？",
  "リビアはどのような気候ですか？",
  "リビアで主要な言語は何ですか？",
  "リビアの人口はどれくらいで、年齢別構成はどうなっていますか？",
  "リビアはどのような民族構成ですか？",
  "リビアの医療水準はどの程度ですか？",
  "リビアの教育水準はどの程度ですか？",
  "リビアの主要通貨は何ですか？",
  "リビアの経済規模はどれくらいですか？",
  "リビアの主要産業は何ですか？",
  "リビアはどのような政治状況ですか？",
  "リビアの国内治安状況はどうなっていますか？",
  "リビアの地政学的リスクはありますか？",
];

for await (const question of questions) {
  const input = question;
  const outputParser = new TridentOutputParser();
  const firstResult = await llmChain.call({
    input: input,
    agent_scratchpad: "",
    stop: ["\nObservation"],
    intermediate_steps: [],
  });

  console.log("----- ----- ----- ----- ----- -----");
  console.log("Q:", input);

  let result = firstResult;
  const steps = [];

  while (true) {
    //console.log("\n----- ----- ----- ----- ----- -----\n");
    const output = (await outputParser.parse(result.text)) as AgentFinish;
    if ("returnValues" in output) {
      console.log("----- -----");
      console.log("Final Answer:", output.returnValues.output);
      console.log("----- -----");
      break;
    }

    const actions = [output as AgentAction];
    const action = actions[0];
    const tool = tools.filter((tool) => {
      return tool.name.match(action.tool);
    })[0];
    if (tool === undefined) {
      break;
    } else {
      const observation = await tool.call({ input: action.toolInput });
      const step = { action, observation };
      steps.push(step);
    }

    const agentScratchpad = steps.reduce(
      (thoughts, { action, observation }) =>
        thoughts +
        [action.log, `\nObservation: ${observation}`, "Thought:"]
          .join("\n")
          .replace("\n\n", "\n"),
      ""
    );
    //console.log("----- -----");
    //console.log("agentScratchpad:", agentScratchpad);
    //console.log("----- -----");

    const actionResult = await llmChain.call({
      input: input,
      agent_scratchpad: agentScratchpad,
      stop: ["\nObservation"],
      intermediate_steps: [],
    });
    //console.log("----- -----");
    //console.log("resultText:", actionResult.text);
    //console.log("----- -----");
    result = actionResult;
  }
}
