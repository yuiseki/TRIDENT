export default (): void => {
  console.log("\nSetup test environment");
  // Default to the local llama-server backend. Ollama support was removed;
  // set USE_OPENAI_API=1 in the environment to run the suite against OpenAI.
  if (
    process.env.USE_OPENAI_API !== "1" &&
    process.env.USE_LLAMA_CPP !== "1"
  ) {
    process.env.USE_LLAMA_CPP = "1";
  }
  return;
};
