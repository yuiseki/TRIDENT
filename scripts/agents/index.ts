import { END, Annotation } from "@langchain/langgraph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { START, StateGraph } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { loadSupervisorChain } from "./supervisor";
import { loadWikipediaAgent } from "./wikipedia";
import fs from "node:fs/promises";
import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
  model: "qwen2.5:7b",
  temperature: 0,
});

// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  // The agent node that last performed work
  next: Annotation<string>({
    reducer: (x, y) => y ?? x ?? END,
    default: () => END,
  }),
});

const members = ["wikipedia_researcher"] as const;

const wikipediaResearcherNode = async (
  state: typeof AgentState.State,
  config?: RunnableConfig
) => {
  const wikipediaAgent = await loadWikipediaAgent(model);
  const result = await wikipediaAgent.invoke(state, config);
  const lastMessage = result.messages[result.messages.length - 1];
  return {
    messages: [
      new HumanMessage({
        content: lastMessage.content,
        name: "Wikipedia Researcher",
      }),
    ],
  };
};

const supervisorNode = async (
  state: typeof AgentState.State,
  config?: RunnableConfig
) => {
  const supervisorChain = await loadSupervisorChain(model, members);
  const result = await supervisorChain.invoke(state, config);
  return {
    next: result.next,
  };
};

// 1. Create the graph
const workflow = new StateGraph(AgentState)
  // 2. Add the nodes; these will do the work
  .addNode("wikipedia_researcher", wikipediaResearcherNode)
  .addNode("supervisor", supervisorNode);
// 3. Define the edges. We will define both regular and conditional ones
// After a worker completes, report to supervisor
members.forEach((member) => {
  workflow.addEdge(member, "supervisor");
});

workflow.addConditionalEdges(
  "supervisor",
  (x: typeof AgentState.State) => x.next
);

workflow.addEdge(START, "supervisor");

const graph = workflow.compile();

const representation = await graph.getGraphAsync();
const image = await representation.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();
const buffer = new Uint8Array(arrayBuffer);

// ./tmp/graph.png に書き出す
await fs.writeFile("./tmp/graph.png", buffer);

let streamResults = graph.stream(
  {
    messages: [
      new HumanMessage({
        content: "write a report on birds.",
      }),
    ],
  },
  { recursionLimit: 100 }
);

for await (const output of await streamResults) {
  if (!output?.__end__) {
    console.log(output);
    console.log("----");
  }
}
