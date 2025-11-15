import { loadTridentSurfaceChain } from ".";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { getChatModel } from "@/utils/trident/getChatModel";
import { getEmbeddingModel } from "@/utils/trident/getEmbeddingModel";

describe("loadTridentSurfaceChain", () => {
  it("return a RunnableSequence", async () => {
    const llm = getChatModel();
    const embeddings = getEmbeddingModel();
    const vectorStore = new MemoryVectorStore(embeddings);
    const chain = await loadTridentSurfaceChain({ llm, vectorStore });
    expect(chain).toBeDefined();
  });
  it("result contain 台東区", async () => {
    const llm = getChatModel();
    const embeddings = getEmbeddingModel();
    const vectorStore = new MemoryVectorStore(embeddings);
    const chain = await loadTridentSurfaceChain({ llm, vectorStore });
    const result = await chain.invoke({
      input: "台東区のラーメン屋を教えて",
    });
    expect(result.content).toContain("台東区");
  });
});
