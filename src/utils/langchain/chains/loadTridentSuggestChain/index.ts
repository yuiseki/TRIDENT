import { loadTridentSuggestPrompt } from "./prompt";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { VectorStore } from "@langchain/core/vectorstores";
import {
  tridentSuggestExampleInputKeys,
  tridentSuggestExampleList,
} from "./examples";
import { initializeExampleList } from "../../vectorstores/initializeExampleList";

export const loadTridentSuggestChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentSuggestPrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};

export const initializeTridentSuggestExampleList = async ({
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
    exampleList: tridentSuggestExampleList,
    inputKeys: tridentSuggestExampleInputKeys,
    checkTableExists,
    checkDocumentExists,
  });
};
