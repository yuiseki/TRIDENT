import { Annotation } from "@langchain/langgraph";

const PlanExecuteState = Annotation.Root({
  input: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  plan: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  pastSteps: Annotation<[string, string][]>({
    reducer: (x, y) => x.concat(y),
  }),
  response: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { OverpassTokyoRamenCount } from "@/utils/langchain/tools/osm/overpass/tokyo_ramen";
import { ChatOllama } from "@langchain/ollama";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatPromptTemplate } from "@langchain/core/prompts";

const plan = zodToJsonSchema(
  z.object({
    steps: z
      .array(z.string())
      .describe("different steps to follow, should be in sorted order"),
  })
);
const planFunction = {
  name: "plan",
  description: "This tool is used to plan the steps to follow",
  parameters: plan,
};

const planTool = {
  type: "function",
  function: planFunction,
};

const plannerPrompt = ChatPromptTemplate.fromTemplate(
  `For the given objective, come up with a most simple breakdown in detail, step by step plan. \
This plan must involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. \
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps. \
Output must be Japanese.

NOTE: You can use overpass-tokyo-ramen-count tool in your plan. \
useful for when you need to count number of ramen shops by a name of area. Input: a name of administrative district in Tokyo.

{objective}`
);

const planModel = new ChatOllama({
  model: "qwen2.5-coder:7b",
  temperature: 0,
}).withStructuredOutput(planFunction);

const planner = plannerPrompt.pipe(planModel);

import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";

const response = zodToJsonSchema(
  z.object({
    response: z.string().describe("Response to user."),
  })
);

const responseTool = {
  type: "function",
  function: {
    name: "response",
    description: "Response to user.",
    parameters: response,
  },
};

const replannerPrompt = ChatPromptTemplate.fromTemplate(
  `For the given objective, come up with a most simple breakdown in detail, step by step plan. \
This plan must involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. \
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps. \
Output must be Japanese.

Your objective was this:
{input}

Your original plan was this:
{plan}

You have currently done the follow steps:
{pastSteps}

Update your plan accordingly.
For example, if you done some list up tasks, then you must develop the results into a plan as individual steps.
If no more steps are needed and you can return to the user, then respond with that and use the 'response' function. Otherwise, fill out the plan.
Only add steps to the plan that still NEED to be done.
Do not return previously done steps as part of the plan.`
);

const parser = new JsonOutputToolsParser();
const replanner = replannerPrompt
  .pipe(
    new ChatOllama({
      model: "qwen2.5-coder:7b",
      temperature: 0,
      format: "json",
    }).bindTools([planTool, responseTool])
  )
  .pipe(parser);

const tools = [new OverpassTokyoRamenCount()];

const model = new ChatOllama({
  model: "qwen2.5:7b",
  temperature: 0,
});

const agentExecutor = createReactAgent({
  llm: model,
  tools: tools,
  stateModifier: "Respond complete but concise answer in Japanese. ",
});

import { END, START, StateGraph } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";

async function executeStep(
  state: typeof PlanExecuteState.State,
  config?: RunnableConfig
): Promise<Partial<typeof PlanExecuteState.State>> {
  let task;
  const plan = state.plan[0] as
    | string
    | { task: string }
    | { description: string };
  if (typeof plan === "object") {
    if ("task" in plan) {
      task = plan.task;
    } else if ("description" in plan) {
      task = plan.description;
    } else {
      task = plan as string;
    }
  } else {
    task = plan as string;
  }
  const input = {
    messages: [new HumanMessage(task)],
  };
  console.log(input);
  const { messages } = await agentExecutor.invoke(input, config);

  return {
    pastSteps: [[task, messages[messages.length - 1].content.toString()]],
    plan: state.plan.slice(1),
  };
}

async function planStep(
  state: typeof PlanExecuteState.State
): Promise<Partial<typeof PlanExecuteState.State>> {
  const plan = await planner.invoke({ objective: state.input });
  return { plan: plan.steps };
}

async function replanStep(
  state: typeof PlanExecuteState.State
): Promise<Partial<typeof PlanExecuteState.State>> {
  const plan = state.plan as
    | string[]
    | { task: string }[]
    | { description: string }[];
  const output = await replanner.invoke({
    input: state.input,
    plan: plan
      .map((p) => {
        if (typeof p === "string") {
          return p;
        }
        if ("task" in p) {
          return p.task;
        }
        if ("description" in p) {
          return p.description;
        }
        return p;
      })
      .join("\n"),
    pastSteps: state.pastSteps
      .map(([step, result]) => `${step}: ${result}`)
      .join("\n"),
  });

  const toolCall = output[0];

  if (!toolCall) {
    console.log("----- ----- replanStep output ----- -----");
    console.log(JSON.stringify(output, null, 2));
  }

  if (toolCall.type == "response") {
    return { response: toolCall.args?.response };
  }

  console.log("----- ----- replanStep output ----- -----");
  console.log(JSON.stringify(output, null, 2));

  return { plan: toolCall.args?.steps };
}

function shouldEnd(state: typeof PlanExecuteState.State) {
  return state.response ? "true" : "false";
}

const workflow = new StateGraph(PlanExecuteState)
  .addNode("planner", planStep)
  .addNode("agent", executeStep)
  .addNode("replan", replanStep)
  .addEdge(START, "planner")
  .addEdge("planner", "agent")
  .addEdge("agent", "replan")
  .addConditionalEdges("replan", shouldEnd, {
    true: END,
    false: "agent",
  });

// Finally, we compile it!
// This compiles it into a LangChain Runnable,
// meaning you can use it as you would any other runnable
const app = workflow.compile();

const config = { recursionLimit: 100 };
const inputs = {
  input: "東京都23区で一番ラーメン屋が多いのはどこ？",
};

for await (const event of await app.stream(inputs, config)) {
  console.log(JSON.stringify(event, null, 2));
}
