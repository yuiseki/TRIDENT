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
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  setMyDuckDB(db);
  const c = await db.connect();
  await c.query(`
    INSTALL json;
    INSTALL spatial;
  `);
};

const NumberOfCountries: React.FC<{ db: duckdb.AsyncDuckDB }> = ({ db }) => {
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

export default function Page() {
  const [duckdbInitialized, setDuckDBInitialized] = useState(false);
  const [duckdbLoaded, setDuckDBLoaded] = useState(false);
  const [myDuckDB, setMyDuckDB] = useState<duckdb.AsyncDuckDB | null>(null);
  const origin = global.window ? global.window.location.origin : "";
  const path = global.window ? global.window.location.pathname : "";
  let basename = origin;
  if (path !== "/") {
    basename = origin + path;
  }

  const loadQuery = `
    LOAD json;
    LOAD spatial;
    CREATE TABLE countries AS SELECT * FROM ST_Read('${origin}/ne_110m_admin_0_countries.json');
  `;

  useEffect(() => {
    if (!duckdbInitialized) {
      initDuckDB(setMyDuckDB);
      setDuckDBInitialized(true);
    }
  }, [duckdbInitialized]);

  useEffect(() => {
    const loadDuckDB = async (db: duckdb.AsyncDuckDB) => {
      const conn = await db.connect();
      await conn.query(loadQuery);
      await conn.close();
      setDuckDBLoaded(true);
    };
    if (myDuckDB) {
      loadDuckDB(myDuckDB);
    }
  }, [loadQuery, myDuckDB]);

  return (
    <>
      {myDuckDB ? (
        <div
          className="App"
          style={{
            backgroundColor: "white",
          }}
        >
          <header className="App-header">
            <p>DuckDB-Wasm has initialized.</p>
          </header>
          {duckdbLoaded ? (
            <>
              <p>Data loaded.</p>
              <pre>{loadQuery}</pre>
              <hr />
              <NumberOfCountries db={myDuckDB} />
              <hr />
              <hr />
            </>
          ) : (
            <p>Loading data...</p>
          )}
        </div>
      ) : (
        <div className="App">
          <header className="App-header">
            <p>Initializing DuckDB-Wasm...</p>
          </header>
        </div>
      )}
    </>
  );
}
