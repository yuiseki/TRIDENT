import { OverpassTokyoRamenCount } from "../src/utils/langchain/tools/osm/overpass/tokyo_ramen";
import { AIMessage } from "@langchain/core/messages";

import { ToolNode } from "@langchain/langgraph/prebuilt";

const tools = [new OverpassTokyoRamenCount()];
const toolNode = new ToolNode(tools);

const messageWithSingleToolCall = new AIMessage({
  content: "",
  tool_calls: [
    {
      name: "overpass-tokyo-ramen-count",
      args: { input: "台東区" },
      id: "tool_call_id",
      type: "tool_call",
    },
  ],
});

const res = await toolNode.invoke({ messages: [messageWithSingleToolCall] });
console.log(res);
