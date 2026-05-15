// Enforce that at most one inference backend env flag is set to "1".
// Ambiguity here would silently change which model handles a request, so we
// fail fast at boot via `instrumentation.ts`.

const FLAGS = ["USE_OPENAI_API", "USE_LLAMA_CPP", "USE_OLLAMA"] as const;

export const assertInferenceBackend = (): void => {
  const enabled = FLAGS.filter((name) => process.env[name] === "1");
  if (enabled.length > 1) {
    throw new Error(
      `Inference backend env flags are mutually exclusive but multiple are set to "1": ${enabled.join(
        ", "
      )}. Set at most one of ${FLAGS.join(" / ")}.`
    );
  }
};
