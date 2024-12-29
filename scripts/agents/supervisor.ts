import { ChatOllama } from "@langchain/ollama";
import { END } from "@langchain/langgraph";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const members = ["wikipedia_researcher"] as const;
const options = [END, ...members];

const systemPrompt =
  "You are a supervisor tasked with managing a conversation between the" +
  " following workers: {members}. Given the following user request," +
  " respond with the worker to act next. Each worker will perform a" +
  " task and respond with their results and status. When finished," +
  " respond with FINISH.";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "human",
    "Given the conversation above, who should act next?" +
      " Or should we FINISH? Select one of: {options}",
  ],
]);

const model = new ChatOllama({
  model: "qwen2.5:7b",
  temperature: 0,
});

const formattedPrompt = await prompt.partial({
  options: options.join(", "),
  members: members.join(", "),
});

export const supervisorChain = formattedPrompt.pipe(model).pipe((x) => {
  return {
    next: x.content,
  };
});

// mainの場合だけ以下を実行
/*
if (import.meta.filename === new URL(import.meta.url).pathname) {
  const res = await supervisorChain.invoke({
    messages: [
      new HumanMessage({
        content: "write a report on birds.",
      }),
    ],
  });
  console.log(res);
}
*/
