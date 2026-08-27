import { Embeddings } from "@langchain/core/embeddings";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { VectorStore } from "@langchain/core/vectorstores";
import {
  loadTridentInnerFinetunedPrompt,
  loadTridentInnerPrompt,
  resolveTridentInnerPromptStyle,
} from "./prompt";
import { initializeExampleList } from "../../vectorstores/initializeExampleList";
import {
  tridentInnerExampleInputKeys,
  tridentInnerExampleList,
} from "./examples";

export const loadTridentInnerChain = async ({
  llm,
  vectorStore,
}: {
  llm: BaseLanguageModel;
  vectorStore: VectorStore;
}): Promise<RunnableSequence> => {
  // The fine-tuned inner model expects its training prompt: the six lines
  // named once, no examples, no hints. Retrieval is skipped entirely in that
  // mode, which also removes the embedding call from the request path.
  const style = resolveTridentInnerPromptStyle(process.env);
  const prompt =
    style === "finetuned"
      ? loadTridentInnerFinetunedPrompt()
      : await loadTridentInnerPrompt(vectorStore);
  console.log("Trident inner prompt style:", style);
  const chain = RunnableSequence.from([prompt, llm]);
  return chain;
};

export const initializeTridentInnerExampleList = async ({
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
    exampleList: tridentInnerExampleList,
    inputKeys: tridentInnerExampleInputKeys,
    checkTableExists,
    checkDocumentExists,
  });
};
