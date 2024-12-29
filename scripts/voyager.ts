import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

// Tools
import { Tool } from "langchain/tools";
import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";
import { Calculator } from "@langchain/community/tools/calculator";

// langgraph
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const model = new ChatOllama({
  model: "qwen2.5-coder:1.5b",
  temperature: 0.0,
});

const tools: Array<Tool> = [new Calculator(), new Wikipedia()];

// Initialize memory to persist state between graph runs
const agentCheckPointer = new MemorySaver();
const agent = createReactAgent({
  llm: model,
  tools: tools,
  checkpointSaver: agentCheckPointer,
});

// Now it's time to use!
const agentFinalState = await agent.invoke(
  { messages: [new HumanMessage("Who is the UN Secretary General?")] },
  { configurable: { thread_id: "42" } }
);

console.log(agentFinalState.messages.length);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content
);
