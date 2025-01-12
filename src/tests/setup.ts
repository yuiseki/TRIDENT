export default (): void => {
  console.log("\nSetup test environment");
  process.env.USE_OLLAMA = "1";
  return;
};
