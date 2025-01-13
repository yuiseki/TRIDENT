import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

export const createCheckTableExists = ({
  vectorStore,
  tableName,
}: {
  vectorStore: VercelPostgres | PGVectorStore;
  tableName: string;
}) => {
  return async () => {
    if (vectorStore.client === undefined) {
      throw new Error("vectorStore.client is undefined");
    }
    // テーブルが存在し、かつ、レコードが1件以上あるかどうかを確認する
    const tableExistsSql = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}');`;
    const tableExistsResult = await vectorStore.client.query(tableExistsSql);
    const tableExists = tableExistsResult.rows[0].exists as boolean;
    if (!tableExists) {
      return false;
    }
    const recordExistsSql = `SELECT EXISTS (SELECT FROM ${tableName} LIMIT 1);`;
    const recordExistsResult = await vectorStore.client.query(recordExistsSql);
    const recordExists = recordExistsResult.rows[0].exists as boolean;
    return recordExists;
  };
};

export const createCheckDocumentExists = ({
  vectorStore,
  tableName,
}: {
  vectorStore: VercelPostgres | PGVectorStore;
  tableName: string;
}) => {
  return async (hash: string) => {
    if (vectorStore.client === undefined) {
      throw new Error("vectorStore.client is undefined");
    }
    const documentExistsSql = `SELECT EXISTS (SELECT FROM ${tableName} WHERE metadata @> '{"hash": "${hash}"}')`;
    const documentExists = await vectorStore.client.query(documentExistsSql);
    return documentExists.rows[0].exists as boolean;
  };
};
