import * as dotenv from "dotenv";
import { getRetrievalQAAnswer } from "../../src/utils/langchain/getRetrievalQAAnswer.ts";
import { placeholders } from "./../../src/const/placeholders.ts";

dotenv.config();

const queries = placeholders;

for (const query of queries) {
  console.log("\n\n");
  console.log("testRetrievalQA", "Q:", query);
  try {
    const answer = await getRetrievalQAAnswer(query);
    console.log("testRetrievalQA", "A:", answer.text);
    console.log("testRetrievalQA", "Sources:", answer.sourceDocuments.length);
  } catch (error) {
    console.log("testRetrievalQA", "error !!!!!");
  }
  console.log("\n\n");
}
