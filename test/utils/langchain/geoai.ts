import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import {
  AgentExecutor,
  LLMSingleActionAgent,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";

import {
  loadAreaDetermineTool,
  loadOverpassQueryBuilderTool,
  loadTagsDetermineTool,
} from "../../../src/utils/langchain/tools/openstreetmap/index.ts";

import * as dotenv from "dotenv";
import {
  GeoAIOutputParser,
  GeoAIPromptTemplate,
} from "../../../src/utils/langchain/agents/geoai/index.ts";
import { loadEnglishTranslatorChainTool } from "../../../src/utils/langchain/tools/translator/index.ts";
import { ChatOpenAI } from "langchain/chat_models/openai";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

const tools = [
  await loadAreaDetermineTool(model),
  await loadTagsDetermineTool(model),
  await loadOverpassQueryBuilderTool(model),
  await loadEnglishTranslatorChainTool(model),
];

const llmChain = new LLMChain({
  prompt: new GeoAIPromptTemplate({
    tools,
    inputVariables: ["input", "agent_scratchpad"],
  }),
  llm: model,
});

const agent = new LLMSingleActionAgent({
  llmChain,
  outputParser: new GeoAIOutputParser(),
  stop: ["\nObservation"],
});

const executor = new AgentExecutor({
  agent,
  tools,
  returnIntermediateSteps: true,
});
console.log("Loaded agent.");

const singleActionExecutor = async () => {
  const questions = [
    "長野県松本市のホテルを探すOverpass APIクエリ",
    "長野県松本市の病院を探すOverpass APIクエリ",
  ];

  for await (const input of questions) {
    console.log("\n----- ----- ----- ----- ----- -----\n");
    console.log("Q:", input);
    console.log("");
    const result = await executor.call({ input }, [
      {
        handleAgentAction(action, runId) {
          console.log("handleAgentAction", runId);
          console.log("\tTool:", action.tool);
          console.log("\tTool Input:", action.toolInput);
        },
        handleAgentEnd(action, runId) {
          console.log("handleAgentEnd", runId);
          console.log("\treturnValues:", action.returnValues);
        },
        handleToolEnd(output, runId) {
          console.log("handleToolEnd", runId);
          console.log("\tOutput:", output);
          console.log("");
        },
      },
    ]);
    console.log("");
    console.log("A:", result.output);
    console.log("\n----- ----- ----- ----- ----- -----\n");
  }
};

import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

const memory = new BufferMemory();
const surfacePrompt = new PromptTemplate({
  template: `You are an interactive online map building assistant.
You interact with the user, asking step-by-step about the area and subject of the map they want to create.

- First, you must confirm the area to be covered to the user
- Second, you should confirm the theme or subject of the map to the user
- When you get above information from user, you should output "I copy, I'm trying to create map for you." in conversation language.

Current conversation:
{history}
Human: {input}
AI:`,
  inputVariables: ["history", "input"],
});
const surfaceChain = new ConversationChain({
  prompt: surfacePrompt,
  llm: model,
  memory: memory,
});
const innerPrompt = new PromptTemplate({
  template: `You are a conversation analysis assistant dedicated to build a digital map.
You analyze the following conversation and accurately output a concise abstract of the map to instruct the Map Generating Agent.

Examples of concise abstract of the map:
===
Map of Police Stations in New York City
Map of Hospitals in Taito-ku
Map of Hospitals and Schools in Taito-ku
Map of Ramen Restaurant in Kameido
Map of Hotels in Kyoto
Map of Shelter in the capital of Sudan
Map of Military Facilities in South Sudan
Map of New York City
Map of Taito-ku
Map of Kameido
Map of Kyoto
Map of Sudan
Map of South Sudan
===

Be careful, Your output MUST NOT to include any theme or subjects that do not appear in the following conversations.
You should not output above examples as is, whenever possible.
If you can't output concise abstract of the map, only output "No map specified."

Current conversation:
{history}

Concise abstract of the map:`,
  inputVariables: ["history"],
});
const innerChain = new ConversationChain({
  prompt: innerPrompt,
  llm: model,
  memory: memory,
});

import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = readline.createInterface({ input: stdin, output: stdout });

while (1) {
  const userInput = await rl.question("Waiting your input...: ");
  //console.log("User:", userInput);
  console.log("Surface Agent thinking...");
  const result1 = await surfaceChain.call({ input: userInput });
  console.log("Surface Agent output:", result1.response);
  console.log("Inner Agent thinking...");
  const result2 = await innerChain.call({ input: undefined });
  const output = result2.response;
  console.log("Inner Agent output:", output);
  if (
    output.toLowerCase().includes("not enough") ||
    output.toLowerCase().includes("no map")
  ) {
    continue;
  }
  console.log("GeoAI Agent thinking...");
  const agentResult = await executor.call(
    { input: "Build query for Overpass API: " + output },
    [
      {
        handleAgentAction(action, _runId) {
          console.log("\thandleAgentAction");
          console.log("\t\tTool:", action.tool);
          console.log("\t\tTool Input:", action.toolInput);
        },
        handleToolEnd(output, _runId) {
          console.log("\thandleToolEnd");
          console.log("\t\tOutput:", output);
        },
      },
    ]
  );
  console.log("GeoAI Agent output:", agentResult.output);
  console.log("");
}
