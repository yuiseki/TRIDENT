import { ChatOllama } from "@langchain/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

// Tools
import { Tool } from "langchain/tools";
import { Wikipedia } from "../src/utils/langchain/tools/wikipedia/index.ts";
import { Calculator } from "@langchain/community/tools/calculator";

// langgraph
import {
  MemorySaver,
  Annotation,
  messagesStateReducer,
} from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

const tools: Array<Tool> = [new Calculator(), new Wikipedia()];

const toolNode = new ToolNode(tools);

const model = new ChatOllama({
  model: "qwen2.5-coder:7b",
  format: "json",
  temperature: 0,
}).bindTools(tools);

// Define the graph state
// See here for more info: https://langchain-ai.github.io/langgraphjs/how-tos/define-state/
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    // `messagesStateReducer` function defines how `messages` state key should be updated
    // (in this case it appends new messages to the list and overwrites messages with the same ID)
    reducer: messagesStateReducer,
  }),
});

// Define the function that determines whether to continue or not
// We can extract the state typing via `StateAnnotation.State`
function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user)
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

// Finally, we compile it into a LangChain Runnable.
const app = workflow.compile({ checkpointer });

// Use the agent
const finalState = await app.invoke(
  {
    messages: [new HumanMessage("Who is the president of the United States?")],
  },
  { configurable: { thread_id: "42" }, recursionLimit: 30 }
);
console.log(finalState.messages[finalState.messages.length - 1].content);
