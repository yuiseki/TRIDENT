import { BaseChatModel } from "@langchain/core/language_models/chat_models";

// Tools
import { Tool } from "langchain/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// langgraph
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const loadTavilySearchAgent = async (model: BaseChatModel) => {
  const tools: Array<Tool> = [new TavilySearchResults({ maxResults: 10 })];
  const prompt =
    "You are good at internet searches. Be sure to search the internet and reply based on the results. You have up to 10 chances to search the internet.";
  return createReactAgent({
    llm: model,
    tools: tools,
    stateModifier: prompt,
  });
};
