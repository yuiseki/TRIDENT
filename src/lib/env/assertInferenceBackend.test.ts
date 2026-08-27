import { assertInferenceBackend } from "./assertInferenceBackend";

const BACKEND_FLAGS = ["USE_OPENAI_API", "USE_LLAMA_CPP", "USE_OLLAMA"];

describe("assertInferenceBackend", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const name of BACKEND_FLAGS) {
      saved[name] = process.env[name];
      delete process.env[name];
    }
  });

  afterEach(() => {
    for (const name of BACKEND_FLAGS) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  });

  it("accepts a single enabled backend", () => {
    process.env.USE_LLAMA_CPP = "1";
    expect(() => assertInferenceBackend()).not.toThrow();
  });

  it("accepts no enabled backend", () => {
    expect(() => assertInferenceBackend()).not.toThrow();
  });

  it("rejects both remaining backends at once", () => {
    process.env.USE_OPENAI_API = "1";
    process.env.USE_LLAMA_CPP = "1";
    expect(() => assertInferenceBackend()).toThrow(/mutually exclusive/);
  });

  it("no longer treats USE_OLLAMA as a backend flag", () => {
    process.env.USE_OLLAMA = "1";
    process.env.USE_LLAMA_CPP = "1";
    expect(() => assertInferenceBackend()).not.toThrow();
  });

  it("does not mention Ollama in its error message", () => {
    process.env.USE_OPENAI_API = "1";
    process.env.USE_LLAMA_CPP = "1";
    expect(() => assertInferenceBackend()).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining("OLLAMA"),
      })
    );
  });
});
