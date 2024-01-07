import { ChatMessageHistory } from "langchain/memory";

export const convertChatHistoryToLines = async (
  chatHistory?: ChatMessageHistory,
  excludeAI?: boolean
) => {
  let chatHistoryLines = "";
  if (!chatHistory) {
    return chatHistoryLines;
  }
  const messages = await chatHistory.getMessages();
  messages.forEach((message) => {
    console.log(message);
    chatHistoryLines += message.lc_kwargs.content + "\n";
  });
  return chatHistoryLines;
};
