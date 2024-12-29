import { ChatOllama } from "@langchain/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

// Tools
import { Tool } from "langchain/tools";
import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const tools: Array<Tool> = [new Wikipedia()];

const model = new ChatOllama({
  // 速いがツールを使わずに返答しちゃう
  // model: "qwen2.5:1.5b",
  // 速いがツールを使い続けて無限ループしちゃう
  // model: "qwen2.5-coder:1.5b",
  // 速いし無限ループには陥らずツールを使えるが出力が雑
  // model: "smollm2:1.7b",
  // 速いがツールを使わずに返答しちゃう
  // model: "granite3-dense:2b",
  // 速いがツールを使わずに返答しちゃう
  // model: "granite3-moe:1b",
  // 速いがツールを使わずに返答しちゃう
  // model: "granite3-moe:3b",
  // 遅いが正確に動く
  model: "qwen2.5:7b",
  temperature: 0,
});

const prompt =
  "You are a Wikipedia researcher. Be sure to search Wikipedia and reply based on the results. You have up to 10 chances to search Wikipedia.";
const agent = createReactAgent({
  llm: model,
  tools: tools,
  stateModifier: prompt,
});

// Use the agent
const stream = await agent.stream(
  {
    messages: [new HumanMessage("Who is the president of the United States?")],
  },
  {
    streamMode: "values",
    recursionLimit: 10,
  }
);
for await (const chunk of stream) {
  const lastMessage = chunk.messages[chunk.messages.length - 1];
  const type = lastMessage._getType();
  const content = lastMessage.content;
  const toolCalls = lastMessage.tool_calls;
  console.dir(
    {
      type,
      content: content.length < 100 ? content : content.slice(0, 100) + "...",
      toolCalls,
    },
    { depth: null }
  );
}
