import { RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { VectorStore } from "@langchain/core/vectorstores";
import {
  loadTridentDeepFinetunedPrompt,
  loadTridentDeepPrompt,
  resolveTridentDeepPromptStyle,
} from "./prompt";
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
  // The fine-tuned 0.5B deep model expects its training prompt: no examples,
  // no hints, no code fence. Retrieval is skipped entirely in that mode.
  const style = resolveTridentDeepPromptStyle(process.env);
  const prompt =
    style === "finetuned"
      ? loadTridentDeepFinetunedPrompt()
      : await loadTridentDeepPrompt(vectorStore);
  console.log("Trident deep prompt style:", style);
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
