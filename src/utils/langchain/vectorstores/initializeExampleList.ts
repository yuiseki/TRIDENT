import { sortedValues } from "@/utils/sortedValues";
import { Document } from "@langchain/core/documents";
import { Example } from "@langchain/core/prompts";
import { VectorStore } from "@langchain/core/vectorstores";
import { Md5 } from "ts-md5";

export const initializeExampleList = async ({
  vectorStore,
  exampleList,
  inputKeys,
  checkTableExists,
  checkDocumentExists,
}: {
  vectorStore: VectorStore;
  exampleList: Example[];
  inputKeys: string[];
  checkTableExists: () => Promise<boolean>;
  checkDocumentExists: (hash: string) => Promise<boolean>;
}) => {
  // Check if the table exists
  const tableExists = await checkTableExists();
  if (tableExists) {
    return;
  }
  // Add examples to the vector store
  for (const example of exampleList) {
    // Create a string from the example
    const stringExample = sortedValues(
      inputKeys.reduce(
        (acc, key) => ({ ...acc, [key]: example[key] }),
        {} as Example
      )
    ).join(" ");
    // Create a hash from the string
    const md5 = new Md5();
    md5.appendStr(stringExample);
    const hash = md5.end()?.toString();
    // If the hash is empty, something went wrong, skip this example
    if (!hash) {
      continue;
    }
    // Check if the document exists
    const documentExists = await checkDocumentExists(hash);
    if (documentExists) {
      continue;
    }
    // Create a document from the example
    const document = new Document({
      pageContent: stringExample,
      metadata: { ...example, hash },
    });
    // Add the document to the vector store
    await vectorStore.addDocuments([document]);
  }
};
