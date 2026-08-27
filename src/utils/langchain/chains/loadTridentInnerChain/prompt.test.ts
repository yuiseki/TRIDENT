import {
  loadTridentInnerFinetunedPrompt,
  resolveInnerExampleCount,
  resolveTridentInnerPromptStyle,
  TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT,
} from "./prompt";

describe("resolveInnerExampleCount", () => {
  it("defaults to five, which measured best on Qwen3-0.6B", () => {
    expect(resolveInnerExampleCount({})).toBe(5);
  });

  it("accepts zero, so the layer can be measured without examples", () => {
    expect(resolveInnerExampleCount({ TRIDENT_INNER_EXAMPLES: "0" })).toBe(0);
  });

  it("accepts another count", () => {
    expect(resolveInnerExampleCount({ TRIDENT_INNER_EXAMPLES: "2" })).toBe(2);
  });

  it("falls back to the default for anything unusable", () => {
    for (const value of ["", "abc", "-1", "3.5"]) {
      expect(resolveInnerExampleCount({ TRIDENT_INNER_EXAMPLES: value })).toBe(5);
    }
  });
});

describe("resolveTridentInnerPromptStyle", () => {
  it("defaults to the few-shot prompt", () => {
    expect(resolveTridentInnerPromptStyle({})).toBe("fewshot");
  });

  it("selects the fine-tuned prompt when asked", () => {
    expect(
      resolveTridentInnerPromptStyle({ TRIDENT_INNER_PROMPT_STYLE: "finetuned" })
    ).toBe("finetuned");
  });

  it("ignores anything else", () => {
    for (const value of ["", "FINETUNED", "yes", "1"]) {
      expect(
        resolveTridentInnerPromptStyle({ TRIDENT_INNER_PROMPT_STYLE: value })
      ).toBe("fewshot");
    }
  });
});

describe("TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT", () => {
  // The fine-tuned model was trained against this exact text. It is duplicated
  // in text2geoql-dataset's examples/lora_finetune/dataset.py as
  // INNER_SYSTEM_PROMPT, and the two must not drift: a model asked in words it
  // was not trained on answers worse than one asked in none at all, which is
  // what the deep layer taught us.
  it("names every line of the intermediate language", () => {
    for (const key of [
      "ConfirmHelpful",
      "TitleOfMap",
      "Area",
      "AreaWithConcern",
      "EmojiForConcern",
      "ColorForConcern",
    ]) {
      expect(TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT).toContain(key);
    }
  });

  it("asks for the whole hierarchy, smallest first", () => {
    expect(TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT).toContain("smallest first");
    expect(TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT).toContain(
      "Chuo Ward, Niigata, Niigata Prefecture, Japan"
    );
  });

  it("asks for the human's own language", () => {
    expect(TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT).toContain(
      "same language the human wrote in"
    );
  });

  it("carries no examples, because the fine-tune replaced them", () => {
    expect(TRIDENT_INNER_FINETUNED_SYSTEM_PROMPT).not.toContain("Human:");
  });
});

describe("loadTridentInnerFinetunedPrompt", () => {
  it("takes the input without reaching a vector store", async () => {
    const prompt = loadTridentInnerFinetunedPrompt();
    const rendered = await prompt.formatPromptValue({ input: "広島市のカフェ" });
    expect(rendered.toString()).toContain("広島市のカフェ");
    expect(rendered.toString()).toContain("ConfirmHelpful");
  });
});
