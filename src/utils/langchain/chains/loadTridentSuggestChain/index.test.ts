import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { loadTridentSuggestChain } from ".";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// 60s
const TEST_TIMEOUT = 60000;

describe("loadTridentSuggestChain", () => {
  it(
    "should return a RunnableSequence",
    async () => {
      const llm = new ChatOllama({
        model: "tinyllama:1.1b-chat",
      });
      const embeddings = new OllamaEmbeddings({
        model: "all-minilm:22m",
      });
      const vectorStore = new MemoryVectorStore(embeddings);
      const chain = await loadTridentSuggestChain({ llm, vectorStore });
      expect(chain).toBeDefined();
      const result = await chain.invoke({
        input:
          "Primary language of user: ja\nCurrent location of user: 台東区, 東京都, 日本",
      });
      console.info("result", result.content);
      expect(result.content).toBeDefined();
    },
    TEST_TIMEOUT
  );
});
