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
    // Defaults match docker-compose's db service (reachable from sibling
    // containers via `db:5432`). Override with POSTGRES_HOST=localhost
    // POSTGRES_PORT=5433 to reach the same container from the docker host.
    const reusablePool = new pg.Pool({
      host: process.env.POSTGRES_HOST ?? "db",
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      user: process.env.POSTGRES_USER ?? "default",
      password: process.env.POSTGRES_PASSWORD ?? "password",
      database: process.env.POSTGRES_DB ?? "verceldb",
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
