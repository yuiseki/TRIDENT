import * as dotenv from "dotenv";
import { namedEntityRecognition } from "../../../src/utils/langchain/namedEntityRecognition.ts";

dotenv.config();

const texts = [
  "What is latest situation in Sudan?",
  "Where is the headquarters of the UNIFIL?",
  "The headquarters of the UNIFIL is located in Naqoura, Lebanon.",
  "Who is the latest head of South Sudan at the UN mission?",
  "The latest head of South Sudan at the UN mission is Mr. Nicholas Haysom.",
  "Tell me in detail about the UN's activities in Kosovo.",
];

for await (const text of texts) {
  const res = await namedEntityRecognition(text);
  console.log(res.text);
}
