import * as dotenv from "dotenv";
import { Document } from "langchain/dist/document";
import { getRetrievalQAAnswer } from "./../../src/utils/getRetrievalQAAnswer.ts";
import { placeholders } from "./../../src/const/placeholders.ts";

dotenv.config();

const queries = placeholders;

for (const query of queries) {
  console.log("----- ----- -----");
  console.log("Q:", query);
  try {
    const answer = await getRetrievalQAAnswer(query);
    console.log("A:", answer.text);
    console.log(answer.sourceDocuments.map((d: Document) => d.metadata.title));
  } catch (error) {
    console.log("!!!!! error !!!!!");
  }
  console.log("----- ----- -----");
}
