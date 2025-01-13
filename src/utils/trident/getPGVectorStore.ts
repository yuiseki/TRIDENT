import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import { Embeddings } from "@langchain/core/embeddings";
import pg from "pg";

export const getPGVectorStore = async (
  embeddings: Embeddings,
  tableName: string
) => {
  if (process.env.USE_POSTGRES === "1") {
    const reusablePool = new pg.Pool({
      host: "db",
      port: 5432,
      user: "default",
      password: "password",
      database: "verceldb",
    });
    const config = {
      pool: reusablePool,
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
