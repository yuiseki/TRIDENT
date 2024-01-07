import { ChatMessageHistory } from "langchain/memory";

export const parsePastMessagesToLines = (pastMessagesJsonString: string) => {
  let chatHistory: Array<string | null> = [];
  if (pastMessagesJsonString && pastMessagesJsonString !== "undefined") {
    const pastMessages: Array<{
      type: string;
      id: string[];
      kwargs: { content: string };
    }> = JSON.parse(pastMessagesJsonString);

    chatHistory =
      pastMessages &&
      pastMessages
        .map((message) => {
          switch (message.id[2]) {
            case "HumanMessage":
              return `Human: ${message.kwargs.content}`;
            case "AIMessage":
              return `AI: ${message.kwargs.content}`;
            default:
              return null;
          }
        })
        .filter((v) => v);
  }
  return chatHistory;
};
