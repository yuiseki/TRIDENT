import { RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { VectorStore } from "@langchain/core/vectorstores";
import { loadTridentDeepPrompt } from "./prompt";
import { initializeExampleList } from "../../vectorstores/initializeExampleList";
import {
  tridentDeepExampleInputKeys,
  tridentDeepExampleList,
} from "./examples";

export const loadTridentDeepChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentDeepPrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};

export const initializeTridentDeepExampleList = async ({
  vectorStore,
  checkTableExists,
  checkDocumentExists,
}: {
  vectorStore: VectorStore;
  checkTableExists: () => Promise<boolean>;
  checkDocumentExists: (hash: string) => Promise<boolean>;
}) => {
  await initializeExampleList({
    vectorStore,
    exampleList: tridentDeepExampleList,
    inputKeys: tridentDeepExampleInputKeys,
    checkTableExists,
    checkDocumentExists,
  });
};
