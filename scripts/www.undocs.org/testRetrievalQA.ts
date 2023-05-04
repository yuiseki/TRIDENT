import * as dotenv from "dotenv";
import { Document } from "langchain/dist/document";
import { getRetrievalQAAnswer } from "@/utils/getRetrievalQAAnswer";

dotenv.config();

const queries = [
  "What is the UN doing in South Sudan?",
  "What is the name of the UN mission in South Sudan?",
  "When did the UN start mission in South Sudan?",
  "Who is the latest head of South Sudan at the UN?",
  "Where is the headquarters of South Sudan at the UN?",
  "What is the UN doing in Kosovo?",
  "What is the name of the UN mission in Kosovo?",
  "When did the UN start mission in Kosovo?",
  "Who is the latest head of Kosovo at the UN?",
];

for (const query of queries) {
  console.log("----- ----- -----");
  try {
    const answer = await getRetrievalQAAnswer(query);
    console.log("Q:", query);
    console.log("A:", answer.text);
    console.log(answer.sourceDocuments.map((d: Document) => d.metadata.title));
  } catch (error) {
    console.log("!!!!! error !!!!!");
  }
  console.log("----- ----- -----");
}
