import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import { Embeddings } from "@langchain/core/embeddings";
import { PoolConfig } from "pg";

export const getPGVectorStore = async (
  embeddings: Embeddings,
  tableName: string
) => {
  if (process.env.USE_POSTGRES === "1") {
    const config = {
      postgresConnectionOptions: {
        type: "postgres",
        host: "127.0.0.1",
        port: 5432,
        user: "default",
        password: "password",
        database: "verceldb",
      } as PoolConfig,
      tableName: tableName,
      columns: {
        idColumnName: "id",
        vectorColumnName: "vector",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
      // supported distance strategies: cosine (default), innerProduct, or euclidean
      distanceStrategy: "cosine" as DistanceStrategy,
    };
    return await PGVectorStore.initialize(embeddings, config);
  } else {
    return await VercelPostgres.initialize(embeddings, {
      tableName,
    });
  }
};
