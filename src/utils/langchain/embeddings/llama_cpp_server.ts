import { Embeddings } from "langchain/embeddings/base";

// From: https://github.com/langchain-ai/langchainjs/blob/main/langchain/src/util/chunk.ts
const chunkArray = <T>(arr: T[], chunkSize: number) =>
  arr.reduce((chunks, elem, index) => {
    const chunkIndex = Math.floor(index / chunkSize);
    const chunk = chunks[chunkIndex] || [];
    // eslint-disable-next-line no-param-reassign
    chunks[chunkIndex] = chunk.concat([elem]);
    return chunks;
  }, [] as T[][]);

export class LlamaCppServerEmbeddings extends Embeddings {
  modelName = "llama-cpp-server";
  batchSize = 512;
  stripNewLines = true;

  constructor() {
    super({});
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const batches = chunkArray(
      this.stripNewLines ? texts.map((t) => t.replace(/\n/g, " ")) : texts,
      this.batchSize
    );

    const batchRequests = batches.map((batch) =>
      this.embeddingWithRetry({
        model: this.modelName,
        input: batch,
      })
    );
    const batchResponses = await Promise.all(batchRequests);

    const embeddings: number[][] = [];
    for (let i = 0; i < batchResponses.length; i += 1) {
      const batch = batches[i];
      const { data: batchResponse } = batchResponses[i];
      for (let j = 0; j < batch.length; j += 1) {
        embeddings.push(batchResponse[j].embedding);
      }
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const { data } = await this.embeddingWithRetry({
      model: this.modelName,
      input: this.stripNewLines ? text.replace(/\n/g, " ") : text,
    });
    return data[0].embedding;
  }

  private async callEmbeddingApi(input: string) {
    return fetch("http://localhost:8080/embedding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: input,
      }),
    });
  }

  private async embeddingWithRetry(params: {
    model: string;
    input: string | string[];
  }) {
    return this.caller.call(async () => {
      try {
        const batchResponses: { data: Array<{ embedding: number[] }> } = {
          data: [],
        };
        if (typeof params.input === "string") {
          const res = await this.callEmbeddingApi(params.input);
          const resJson = await res.json();
          batchResponses.data.push(resJson);
        } else {
          for await (const input of params.input) {
            const res = await this.callEmbeddingApi(input);
            const resJson = await res.json();
            batchResponses.data.push(resJson);
          }
        }
        return batchResponses;
      } catch (e) {
        throw e;
      }
    });
  }
}
