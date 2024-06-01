import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";

export const createCheckTableExists = ({
  vectorStore,
  tableName,
}: {
  vectorStore: VercelPostgres;
  tableName: string;
}) => {
  return async () => {
    const tableExistsSql = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}');`;
    const tableExists = await vectorStore.client.query(tableExistsSql);
    return tableExists.rows[0].exists as boolean;
  };
};

export const createCheckDocumentExists = ({
  vectorStore,
  tableName,
}: {
  vectorStore: VercelPostgres;
  tableName: string;
}) => {
  return async (hash: string) => {
    const documentExistsSql = `SELECT EXISTS (SELECT FROM ${tableName} WHERE hash = '${hash}');`;
    const documentExists = await vectorStore.client.query(documentExistsSql);
    return documentExists.rows[0].exists as boolean;
  };
};
