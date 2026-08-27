import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { FakeEmbeddings } from "@langchain/core/utils/testing";
import {
  TRIDENT_DEEP_FINETUNED_SYSTEM_PROMPT,
  loadTridentDeepFinetunedPrompt,
  loadTridentDeepPrompt,
  resolveTridentDeepPromptStyle,
} from "./prompt";

const buildVectorStore = () => new MemoryVectorStore(new FakeEmbeddings());

describe("resolveTridentDeepPromptStyle", () => {
  it("defaults to fewshot so the existing OpenAI path is unchanged", () => {
    expect(resolveTridentDeepPromptStyle({})).toBe("fewshot");
  });

  it("returns finetuned when TRIDENT_DEEP_PROMPT_STYLE says so", () => {
    expect(
      resolveTridentDeepPromptStyle({ TRIDENT_DEEP_PROMPT_STYLE: "finetuned" })
    ).toBe("finetuned");
  });

  it("ignores an unknown value and keeps the default", () => {
    expect(
      resolveTridentDeepPromptStyle({ TRIDENT_DEEP_PROMPT_STYLE: "nonsense" })
    ).toBe("fewshot");
  });
});

describe("loadTridentDeepFinetunedPrompt", () => {
  it("emits exactly a system message and a human message", async () => {
    const prompt = loadTridentDeepFinetunedPrompt();
    const messages = await prompt.formatMessages({
      input: "AreaWithConcern: Taito, Tokyo, Japan; Cafes",
    });
    expect(messages).toHaveLength(2);
    expect(messages[0].getType()).toBe("system");
    expect(messages[1].getType()).toBe("human");
  });

  it("reproduces the fine-tuning system prompt verbatim", async () => {
    const prompt = loadTridentDeepFinetunedPrompt();
    const messages = await prompt.formatMessages({ input: "whatever" });
    expect(messages[0].content).toBe(TRIDENT_DEEP_FINETUNED_SYSTEM_PROMPT);
  });

  it("passes the input through untouched as the human message", async () => {
    const input = "AreaWithConcern: Taito, Tokyo, Japan; Cafes";
    const prompt = loadTridentDeepFinetunedPrompt();
    const messages = await prompt.formatMessages({ input });
    expect(messages[1].content).toBe(input);
  });

  it("carries none of the few-shot scaffolding the 0.5B model overfits to", async () => {
    const prompt = loadTridentDeepFinetunedPrompt();
    const messages = await prompt.formatMessages({
      input: "AreaWithConcern: Taito, Tokyo, Japan; Cafes",
    });
    const rendered = messages.map((m) => String(m.content)).join("\n");
    // The hints table teaches "X shops = amenity + cuisine=X", which is what
    // made the fine-tuned model answer Cafes with restaurant + cuisine=cafe.
    expect(rendered).not.toContain("Pizza shops");
    expect(rendered).not.toContain("Sushi shops");
    expect(rendered).not.toContain("Useful hints");
    // Training data never wrapped the query in a code fence.
    expect(rendered).not.toContain("```");
    // Training data carried no rule list at all.
    expect(rendered).not.toContain("You will always reply according to");
  });
});

describe("loadTridentDeepPrompt", () => {
  it("still carries the few-shot scaffolding for the large-model path", async () => {
    const prompt = await loadTridentDeepPrompt(buildVectorStore());
    const rendered = await prompt.format({
      input: "AreaWithConcern: Taito, Tokyo, Japan; Cafes",
    });
    expect(rendered).toContain("Useful hints");
    expect(rendered).toContain("Pizza shops");
    // The rule list is the other half of what the fine-tuned path drops.
    // Deliberately not asserting the timeout value here: it is being changed
    // separately and is not what this test is about.
    expect(rendered).toContain("You will always reply according to");
    expect(rendered).toContain("three backticks");
  });
});
