import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { Tool } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// tool
import { OverpassTokyoRamenCount } from "../src/utils/langchain/tools/osm/overpass/tokyo_ramen/index.ts";

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

export const loadAgent = async (model: BaseChatModel) => {
  const tools: Array<Tool> = [new OverpassTokyoRamenCount()];
  const prompt =
    "You are a specialist of ramen shops. Be sure to use overpass-tokyo-ramen-count tool and reply based on the results. You have up to 10 chances to use tool.";
  return createReactAgent({
    llm: model,
    tools: tools,
    stateModifier: prompt,
  });
};

const agent = await loadAgent(model);

// Use the agent
const stream = await agent.stream(
  {
    messages: [new HumanMessage("東京都台東区のラーメン屋の数を教えて")],
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
