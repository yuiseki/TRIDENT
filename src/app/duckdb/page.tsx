"use client";

import { useEffect, useState } from "react";

import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";

import type { Table, StructRowProxy } from "apache-arrow";

class ExtraURL {
  constructor(url: string, meta: string) {}
}
global.URL = global.URL || ExtraURL;

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker:
      global.window &&
      new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js",
        import.meta.url
      ).toString(),
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker:
      global.window &&
      new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js",
        import.meta.url
      ).toString(),
  },
};

const initDuckDB = async (
  setMyDuckDB: React.Dispatch<React.SetStateAction<duckdb.AsyncDuckDB | null>>
) => {
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const c = await db.connect();
  await c.query(`
    INSTALL json;
    INSTALL spatial;
  `);

  const origin = window.location.origin;

  const loadQuery = `
    LOAD json;
    LOAD spatial;
    CREATE TABLE countries AS SELECT * FROM ST_Read('${origin}/ne_110m_admin_0_countries.json');
  `;

  await c.query(loadQuery);
  setMyDuckDB(db);
};

export const NumberOfCountries: React.FC<{ db: duckdb.AsyncDuckDB }> = ({
  db,
}) => {
  // 国の数を取得するクエリ
  const query = `
    SELECT COUNT(*) FROM countries;
  `;
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const doit = async () => {
      const conn = await db.connect();
      const results: Table = await conn.query(query);
      const resultRows: StructRowProxy<any>[] = results
        .toArray()
        .map((row: any) => JSON.parse(row));
      const values = Object.values(resultRows[0]);
      setResult(values[0]);
      await conn.close();
    };
    doit();
  }, [db, query]);

  return (
    <div>
      <h2>Number of countries (Most simple query for DuckDB-Wasm)</h2>
      <pre>{query}</pre>
      <p>{result ? <span>{result}</span> : <span>Loading...</span>}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [myDuckDB, setMyDuckDB] = useState<duckdb.AsyncDuckDB | null>(null);

  useEffect(() => {
    if (!myDuckDB) {
      initDuckDB(setMyDuckDB);
    }
  }, [myDuckDB]);

  return (
    <div
      style={{
        color: "white",
      }}
    >
      {myDuckDB ? <NumberOfCountries db={myDuckDB} /> : <div>Loading...</div>}
    </div>
  );
};

export default App;
