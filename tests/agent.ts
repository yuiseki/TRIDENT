import * as dotenv from "dotenv";
dotenv.config();

import { AgentAction, AgentStep } from "langchain/schema";
import { OpenAI } from "langchain/llms/openai";

import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";
import {
  ReliefWebDisasters,
  ReliefWebReports,
} from "../src/utils/langchain/tools/reliefweb/index.ts";
import { loadDateTimeChainTool } from "../src/utils/langchain/tools/datetime/index.ts";

import { loadTridentAgentChain } from "../src/utils/langchain/agents/index.ts";
import { TridentOutputParser } from "../src/utils/langchain/agents/parser.ts";

const llm = new OpenAI({ temperature: 0 });
const tools = [
  new Wikipedia(),
  new ReliefWebReports(),
  new ReliefWebDisasters(),
  await loadDateTimeChainTool(llm),
];
const llmChain = loadTridentAgentChain({ llm, tools });

const input = `リビアで起きている洪水について教えてください。`;

const outputParser = new TridentOutputParser();
const firstResult = await llmChain.call({
  input: input,
  agent_scratchpad: "",
  stop: ["\nObservation"],
  intermediate_steps: [],
});

console.log("\n----- ----- ----- ----- ----- -----\n");
console.log("Q:", input);

let result = firstResult;
const steps = [];

while (true) {
  const output = (await outputParser.parse(result.text)) as AgentAction;
  if ("returnValues" in output) {
    console.log("----- -----");
    console.log("Final Answer:", output.returnValues);
    console.log("----- -----");
    break;
  }

  const actions = [output as AgentAction];
  const action = actions[0];
  const tool = tools.filter((tool) => {
    return tool.name.match(action.tool);
  })[0];
  if (tool === undefined) {
    continue;
  }
  const observation = await tool.call({ input: action.toolInput });
  const step = { action, observation };
  steps.push(step);

  const agentScratchpad = steps.reduce(
    (thoughts, { action, observation }) =>
      thoughts +
      [action.log, `\nObservation: ${observation}`, "Thought:"]
        .join("\n")
        .replace("\n\n", "\n"),
    ""
  );
  console.log("----- -----");
  console.log("agentScratchpad:", agentScratchpad);
  console.log("----- -----");

  const actionResult = await llmChain.call({
    input: input,
    agent_scratchpad: agentScratchpad,
    stop: ["\nObservation"],
    intermediate_steps: [],
  });
  console.log("----- -----");
  console.log("resultText:", actionResult.text);
  console.log("----- -----");
  result = actionResult;
  console.log("\n----- ----- ----- ----- ----- -----\n");
}
