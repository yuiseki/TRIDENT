import * as dotenv from "dotenv";
import { qaForResolutions } from "../../src/utils/langchain/qaForResolutions.ts";
import { placeholders } from "./../../src/const/placeholders.ts";

dotenv.config();

for (const query of placeholders) {
  console.log("\n");
  console.log("testRetrievalQA", "Q:", query);
  try {
    const answer1 = await qaForResolutions(query);
    console.log("testRetrievalQA resolution", "A:", answer1.text);
    console.log(
      "testRetrievalQA resolution",
      "Sources:",
      answer1.sourceDocuments.length
    );
  } catch (error) {
    console.log("testRetrievalQA", "error !!!!!");
  }
  console.log("\n");
}
