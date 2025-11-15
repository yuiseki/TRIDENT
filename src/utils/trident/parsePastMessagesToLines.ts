import { ChatMessageHistory } from "@langchain/classic/memory";

export const parsePastMessagesToLines = (
  pastMessagesJsonString: string,
  onlyHuman?: boolean
) => {
  let chatHistory: Array<string | null> = [];
  let chatHistoryLines = "";

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
              if (onlyHuman) {
                return message.kwargs.content;
              } else {
                return `Human: ${message.kwargs.content}`;
              }
            case "AIMessage":
              if (onlyHuman) {
                return null;
              } else {
                return `AI: ${message.kwargs.content}`;
              }
            default:
              return null;
          }
        })
        .filter((v) => v);
  }
  if (chatHistory) {
    chatHistoryLines = chatHistory.join("\n").replace("\n\n", "\n");
  }
  return chatHistoryLines;
};
