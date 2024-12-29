import { BaseChatModel } from "@langchain/core/language_models/chat_models";

// Tools
import { Tool } from "langchain/tools";
import { Wikipedia } from "../../src/utils/langchain/tools/wikipedia/index.ts";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const loadWikipediaAgent = async (model: BaseChatModel) => {
  const tools: Array<Tool> = [new Wikipedia()];
  const prompt =
    "You are a Wikipedia researcher. Be sure to search Wikipedia and reply based on the results. You have up to 10 chances to search Wikipedia.";
  return createReactAgent({
    llm: model,
    tools: tools,
    stateModifier: prompt,
  });
};
