import { ChatOllama } from "@langchain/ollama";

// Tools
import { Tool } from "langchain/tools";
import { Wikipedia } from "../../src/utils/langchain/tools/wikipedia/index.ts";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const tools: Array<Tool> = [new Wikipedia()];

const model = new ChatOllama({
  model: "qwen2.5:7b",
  temperature: 0,
});

const prompt =
  "You are a Wikipedia researcher. Be sure to search Wikipedia and reply based on the results. You have up to 10 chances to search Wikipedia.";
export const wikipediaAgent = createReactAgent({
  llm: model,
  tools: tools,
  stateModifier: prompt,
});

