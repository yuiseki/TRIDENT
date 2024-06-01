import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/memory";

export const parsePastMessagesToChatHistory = (
  pastMessagesJsonString: string
) => {
  let chatHistory = undefined;

  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: Array<{
      type: string;
      id: string[];
      kwargs: { content: string };
    }> = JSON.parse(pastMessagesJsonString);

    const chatHistoryMessages = pastMessages.map((message) => {
      if (message.kwargs.content) {
        switch (message.id[2]) {
          case "HumanMessage":
            return new HumanMessage(message.kwargs.content);
          case "AIMessage":
            return new AIMessage(message.kwargs.content);
          default:
            return new HumanMessage("");
        }
      } else {
        return new HumanMessage("");
      }
    });
    chatHistory = new ChatMessageHistory(chatHistoryMessages);
  }
  return chatHistory;
};
