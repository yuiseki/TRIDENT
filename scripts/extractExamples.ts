import { tridentInnerExampleList } from "../src/utils/langchain/chains/inner/prompt.ts";
import { tridentDeepExampleList } from "../src/utils/langchain/chains/deep/prompt.ts";

import fs from "node:fs/promises";

// output tridentInnerExampleList as jsonnl
const innerExamples = tridentInnerExampleList;
const innerExamplesJsonnl = innerExamples
  .map((example) => JSON.stringify(example))
  .join("\n");
const innerExamplesJsonnlFilePath =
  "public/data/tridentInnerExampleList.jsonnl";
await fs.writeFile(innerExamplesJsonnlFilePath, innerExamplesJsonnl);
console.log(
  `Wrote ${innerExamples.length} examples to ${innerExamplesJsonnlFilePath}`
);

// output tridentDeepExampleList as jsonnl
const deepExamples = tridentDeepExampleList;
const deepExamplesJsonnl = deepExamples
  .map((example) => JSON.stringify(example))
  .join("\n");
const deepExamplesJsonnlFilePath = "public/data/tridentDeepExampleList.jsonnl";
await fs.writeFile(deepExamplesJsonnlFilePath, deepExamplesJsonnl);
console.log(
  `Wrote ${deepExamples.length} examples to ${deepExamplesJsonnlFilePath}`
);
