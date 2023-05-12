import { Calculator } from "langchain/tools/calculator";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { OpenAI } from "langchain/llms/openai";

import * as dotenv from "dotenv";
import { Wikipedia } from "../../../src/utils/langchain/tools/wikipedia/index.ts";
dotenv.config();

const tools = [new Calculator(), new Wikipedia()];
//const model = new OpenAI({ temperature: 0 });
const model = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  verbose: true,
});

const executor = PlanAndExecuteAgentExecutor.fromLLMAndTools({
  llm: model,
  tools,
});

const result = await executor.call({
  input: `Who is the current president of the United States?`,
});

console.log({ result });
