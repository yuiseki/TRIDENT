import { PromptTemplate } from "@langchain/core/prompts";
import { surfaceGeneralExamples } from "./general";
import { surfaceOverpassExamples } from "./overpass";
import { surfaceBaseStyleSwitchExamples } from "./base-style-switch";
import { surfaceStyleEditExamples } from "./style-edit";

export const tridentSurfaceExamplePrompt = PromptTemplate.fromTemplate(
  `Input:
{input}

Output:
{output}
`
);

export const tridentSurfaceExampleInputKeys = ["input"];

// True when the runtime inference backend is OpenAI (explicit USE_OPENAI_API=1
// or the no-flag default). Used to gate ability sets that require the LLM
// quality of gpt-5.1, e.g. base-style-switch and style-edit. Mutual exclusion
// is enforced at boot by assertInferenceBackend().
export const isOpenAIBackend = (): boolean =>
  process.env.USE_LLAMA_CPP !== "1" && process.env.USE_OLLAMA !== "1";

export const tridentSurfaceExampleList: Array<{
  input: string;
  output: string;
}> = [
  ...surfaceGeneralExamples,
  ...surfaceOverpassExamples,
  ...(isOpenAIBackend() ? surfaceBaseStyleSwitchExamples : []),
  ...(isOpenAIBackend() ? surfaceStyleEditExamples : []),
];
