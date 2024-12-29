import { ChatOllama } from "@langchain/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

// Tools
import { Tool } from "langchain/tools";
import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const tools: Array<Tool> = [new Wikipedia()];

const model = new ChatOllama({
  model: "qwen2.5:7b",
  temperature: 0,
});

const agent = createReactAgent({ llm: model, tools: tools });

// Use the agent
const stream = await agent.stream(
  {
    messages: [new HumanMessage("Who is the president of the United States?")],
  },
  {
    streamMode: "values",
    recursionLimit: 30,
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
