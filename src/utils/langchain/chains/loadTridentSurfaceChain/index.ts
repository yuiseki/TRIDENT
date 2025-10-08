import { loadTridentSurfacePrompt } from "./prompt";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { VectorStore } from "@langchain/core/vectorstores";
import { initializeExampleList } from "../../vectorstores/initializeExampleList";
import {
  tridentSurfaceExampleInputKeys,
  tridentSurfaceExampleList,
} from "./examples";

export const loadTridentSurfaceChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  const prompt = await loadTridentSurfacePrompt(vectorStore);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};

export const initializeTridentSurfaceExampleList = async ({
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
    exampleList: tridentSurfaceExampleList,
    inputKeys: tridentSurfaceExampleInputKeys,
    checkTableExists,
    checkDocumentExists,
  });
};
