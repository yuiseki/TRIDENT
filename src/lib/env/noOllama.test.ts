import { execFileSync } from "node:child_process";
import path from "node:path";

// Regression guard: Ollama support was removed. Prose may still mention it as
// history, but nothing may depend on it again in code without going red.
describe("no Ollama dependency remains", () => {
  const repoRoot = path.resolve(__dirname, "../../..");

  const grep = (pattern: string, ...paths: string[]): string => {
    try {
      return execFileSync(
        "grep",
        [
          "-rnEI",
          "--exclude-dir=node_modules",
          // The tests themselves name the removed flag on purpose.
          "--exclude=*.test.ts",
          pattern,
          ...paths,
        ],
        { cwd: repoRoot, encoding: "utf8" }
      );
    } catch (error: any) {
      // grep exits 1 when there are no matches, which is what we want.
      if (error.status === 1) return "";
      throw error;
    }
  };

  it("imports nothing from @langchain/ollama", () => {
    expect(grep("@langchain/ollama", "src", "scripts", "package.json")).toBe("");
  });

  it("uses none of the Ollama runtime symbols", () => {
    expect(
      grep("ChatOllama|OllamaEmbeddings|ollamaModels", "src", "scripts")
    ).toBe("");
  });

  it("no longer reads USE_OLLAMA or OLLAMA_ env vars", () => {
    expect(grep("USE_OLLAMA|OLLAMA_[A-Z_]+", "src", "scripts")).toBe("");
  });
});
