import * as dotenv from "dotenv";
dotenv.config();

import { AgentAction, AgentFinish, AgentStep } from "langchain/schema";

import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";
import {
  ReliefWebDisasters,
  ReliefWebReports,
} from "../src/utils/langchain/tools/reliefweb/index.ts";
import { loadDateTimeChainTool } from "../src/utils/langchain/tools/datetime/index.ts";

import { loadTridentAgentChain } from "../src/utils/langchain/agents/index.ts";
import { TridentOutputParser } from "../src/utils/langchain/agents/parser.ts";
import { loadReflectionTool } from "../src/utils/langchain/tools/reflection/index.ts";

import { LlamaCppServerCompletion } from "../src/utils/langchain/llms/llama_cpp_server.ts";

const llm = new LlamaCppServerCompletion({
  temperature: 0.2,
  repeat_penalty: 1.3,
  n_predict: 128,
});

const tools = [
  new Wikipedia(),
  // new ReliefWebReports(),
  // new ReliefWebDisasters(),
  // await loadReflectionTool(llm),
  // await loadDateTimeChainTool(llm),
];
const llmChain = loadTridentAgentChain({ llm, tools });

const questions = [
  "リビアの首都はどこですか？",
  "リビアの主要通貨は何ですか？",
  "リビアの正式な国名は何ですか？",
  "リビアはどの地域に位置していますか？",
  "リビアはどのような地形ですか？",
  "リビアの面積はどれくらいですか？",
  "リビアはどのような統治体制ですか？",
  "リビアはどのような気候ですか？",
  "リビアで主要な言語は何ですか？",
  "リビアの人口はどれくらいですか？",
  "リビアの年代別の人口構成はどのようになっていますか？",
  "リビアはどのような民族構成ですか？",
  "リビアの医療水準はどの程度ですか？",
  "リビアの教育水準はどの程度ですか？",
  "リビアの経済規模はどれくらいですか？",
  "リビアの主要産業は何ですか？",
  "リビアはどのような政治状況ですか？",
  "リビアの国内治安状況はどうなっていますか？",
  "リビアの地政学的リスクはありますか？",
];

for await (const question of questions) {
  const input = question;
  //console.log("----- ----- ----- ----- ----- -----");
  console.log("----- ----- ----- ----- ----- -----");
  console.log("Question:", input);

  const outputParser = new TridentOutputParser();
  // console.debug("await llmChain.call, input:", input);
  const firstResult = await llmChain.call({
    input: input,
    agent_scratchpad: "",
    stop: ["\nObservation"],
    intermediate_steps: [],
  });

  let result = firstResult;
  //console.log("----- -----");
  //console.log("----- -----");
  //console.log("----- -----");
  //console.debug("----- result.text -----");
  //console.debug(result.text);
  //console.log("----- -----");
  //console.log("----- -----");
  //console.log("----- -----");
  const steps = [];

  while (true) {
    //console.log("\n----- ----- ----- ----- ----- -----\n");
    try {
      const output = (await outputParser.parse(result.text)) as AgentFinish;
      if ("returnValues" in output) {
        //console.log("----- -----");
        console.log("Final Answer:", output.returnValues.output.split("\n")[0]);
        console.log("----- -----");
        //console.log("----- -----");
        //console.log("----- -----");
        break;
      }

      if (10 < steps.length) {
        console.error("Over the limit of 10 steps.");
        steps.push({
          action: {
            tool: "over-the-limit-of-10-steps",
            toolInput: "over-the-limit-of-10-steps",
            log: "I must stop here and output the final answer.",
          },
          observation:
            "Notice that you are over the limit of 10 steps. You should stop here and output the final answer.",
        });
      } else {
        const actions = [output as AgentAction];
        const action = actions[0];
        const tool = tools.filter((tool) => {
          return tool.name.match(action.tool);
        })[0];

        if (tool === undefined) {
          steps.push({
            action: {
              tool: "no-tools-specified",
              toolInput: "no-tools-specified",
              log: "I must specify a valid tool.",
            },
            observation:
              "Notice that you are not specifying any valid tool. That may be means you are not required to use any more tools. You may be stop here and output the final answer.",
          });
        } else {
          let lastStep;
          if (steps.length >= 0) {
            lastStep = steps[steps.length - 1];
          }
          if (lastStep) {
            console.log("Action Name:", lastStep.action.tool, tool.name);
            console.log(
              "Action Input:",
              lastStep.action.toolInput,
              action.toolInput
            );
            if (
              lastStep.action.tool == tool.name &&
              lastStep.action.toolInput == action.toolInput
            ) {
              console.error("Repeating same tool.");
              steps.push({
                action: {
                  tool: "do-not-repeat",
                  toolInput: "do-not-repeat",
                  log: "I should notice that I am repeating the same tool and same input. I should stop here and output the final answer.",
                },
                observation:
                  "Notice that you are repeating the same tool. That may be means you are not required to use any more tools. You should stop here and output the final answer.",
              });
            }
          } else {
            console.log("Executing action");
            console.log("Action Name:", tool.name);
            console.log("Action Input:", action.toolInput);
            const observation = await tool.call({ input: action.toolInput });
            const step = { action, observation };
            steps.push(step);
          }
        }
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
      //console.log("----- -----");
      //console.log("----- -----");
      //console.log("----- agentScratchpad -----");
      //console.log(agentScratchpad);
      //console.log("----- -----");
      //console.log("----- -----");
      //console.log("----- -----");

      const actionResult = await llmChain.call({
        input: input,
        agent_scratchpad: agentScratchpad,
        stop: ["\nObservation", "\nObserv", "\nObation"],
        intermediate_steps: [],
      });
      //console.log("----- -----");
      //console.log("----- -----");
      //console.log("----- -----");
      //console.log("----- actionResult.text -----");
      //console.log(actionResult.text);
      //console.log("----- -----");
      //console.log("----- -----");
      //console.log("----- -----");
      result = actionResult;
    } catch (error) {
      console.error(error);
      break;
    }
  }
}
