import * as dotenv from "dotenv";
import { Document } from "langchain/dist/document";
import { getRetrievalQAAnswer } from "@/utils/getRetrievalQAAnswer";
import { placeholders } from "@/const/placeholders";

dotenv.config();

const queries = placeholders;

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
