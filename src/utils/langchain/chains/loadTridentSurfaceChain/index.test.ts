import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { loadTridentSurfaceChain } from ".";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// 60s
const TEST_TIMEOUT = 60000;

describe("loadTridentSurfaceChain", () => {
  it(
    "should return a RunnableSequence",
    async () => {
      const llm = new ChatOllama({
        model: "qwen2.5:1.5b",
      });
      const embeddings = new OllamaEmbeddings({
        model: "snowflake-arctic-embed:22m",
      });
      const vectorStore = new MemoryVectorStore(embeddings);
      const chain = await loadTridentSurfaceChain({ llm, vectorStore });
      expect(chain).toBeDefined();
      const result = await chain.invoke({
        input: "台東区のラーメン屋を教えて",
      });
      console.info("result", result.content);
      expect(result.content).toBeDefined();
    },
    TEST_TIMEOUT
  );
});
