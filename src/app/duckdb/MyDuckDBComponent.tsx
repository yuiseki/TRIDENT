"use client";

import { useCallback, useEffect, useState } from "react";

import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";

import type { Table, StructRowProxy } from "apache-arrow";

import * as turf from "@turf/turf";
import { Feature, FeatureCollection } from "geojson";
import Map, {
  Layer,
  LayerProps,
  LngLatBoundsLike,
  MapProvider,
  Source,
  useMap,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { TextInput } from "@/components/TextInput";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";

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
    CREATE TABLE countries AS SELECT * FROM ST_Read('${origin}/ne_110m_admin_0_countries.geojson');
  `;

  await c.query(loadQuery);
  setMyDuckDB(db);
};

const CountryResultsSourceLayer: React.FC<{
  results: FeatureCollection;
}> = ({ results }) => {
  const { countriesMap: map } = useMap();

  useEffect(() => {
    if (results && map) {
      const [minLng, minLat, maxLng, maxLat] = turf.bbox(results);
      const bounds = [
        [minLng, minLat],
        [maxLng, maxLat],
      ] as LngLatBoundsLike;
      map?.fitBounds(bounds, {
        padding: {
          top: 300,
          left: 5,
          right: 5,
          bottom: 0,
        },
        duration: 500,
      });
    }
  }, [results, map]);

  const firstFeaturesType = results.features[0].geometry.type;
  const textLayerStyle: LayerProps | undefined =
    firstFeaturesType === "LineString"
      ? ({
          "text-anchor": "center",
          "symbol-placement": "line-center",
        } as unknown as LayerProps)
      : undefined;

  return (
    <>
      <Source type="geojson" data={results}>
        <Layer
          id={"results-fill"}
          type="fill"
          paint={{ "fill-color": "red", "fill-opacity": 0.5 }}
        />
        <Layer
          id={"results-name"}
          type="symbol"
          layout={{
            "text-field": ["format", ["get", "name"], { "font-scale": 1.2 }],
            "text-size": 16,
            "text-offset": [0, -1.5],
            ...textLayerStyle,
          }}
        />
        <Layer
          id={"results-value"}
          type="symbol"
          layout={{
            "text-field": ["format", ["get", "value"], { "font-scale": 1.2 }],
            "text-size": 14,
            "text-offset": [0, 1.5],
            ...textLayerStyle,
          }}
        />
      </Source>
    </>
  );
};

/*
duckdb spatial extensionでは、以下が使えない
- ST_LineString
*/
const queriesWithQuestions = [
  {
    question: "世界で一番人口の多い国は？",
    query: `
SELECT name as name, POP_EST as value, ST_AsGeoJSON(geom) as geom
FROM countries
ORDER BY value DESC
LIMIT 1
    `,
  },
  {
    question: "世界で一番人口の少ない国は？",
    query: `
SELECT name as name, POP_EST as value, ST_AsGeoJSON(geom) as geom
FROM countries
ORDER BY value ASC
LIMIT 1
    `,
  },
  {
    question: "日本より人口が多い国は？",
    query: `
SELECT name as name, POP_EST as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE POP_EST >= (
  SELECT POP_EST
  FROM countries
  WHERE name = 'Japan'
)
    `,
  },
  {
    question: "南極より人口が少ない国は？",
    query: `
SELECT name as name, POP_EST as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE POP_EST <= (
  SELECT POP_EST
  FROM countries
  WHERE name = 'Antarctica'
)
    `,
  },
  {
    question: "南極の次に面積の広い国は？",
    query: `
SELECT name as name, ST_AREA(geom) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name != 'Antarctica'
ORDER BY value DESC
LIMIT 1
    `,
  },
  {
    question: "日本の人口は？",
    query: `
SELECT '日本の人口' as name, POP_EST as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name = 'Japan'
    `,
  },
  {
    question: "日本とブラジルはどちらが面積が広い？",
    query: `
SELECT name as name, ST_AREA(geom) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name IN ('Japan', 'Brazil')
ORDER BY value DESC
LIMIT 1
    `,
  },
  {
    question: "台湾と北朝鮮どちらが人口が多い？",
    query: `
SELECT name as name, POP_EST as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name IN ('Taiwan', 'North Korea')
ORDER BY value DESC
LIMIT 1
    `,
  },
  {
    question: "日本とブラジルの距離は？",
    query: `
SELECT 
'日本とブラジルの距離' as name,
ST_Distance(
  (SELECT geom FROM countries WHERE name = 'Japan'),
  (SELECT geom FROM countries WHERE name = 'Brazil')
) as value,
ST_AsGeoJSON(
  ST_MakeLine(
    ST_Centroid((SELECT geom FROM countries WHERE name = 'Japan')),
    ST_Centroid((SELECT geom FROM countries WHERE name = 'Brazil'))
  )
) as geom
FROM countries
WHERE name IN ('Japan', 'Brazil')
    `,
  },
];

type MyDuckDBTableColumn = {
  column_name: string;
  column_type: string;
  null: string;
  key: string | null;
  default: string | null;
  extra: string | null;
};

type MyDuckDBTableSchema = {
  tableName: string;
  columns: MyDuckDBTableColumn[];
};

const ChatMapWithDuckDB: React.FC<{ db: duckdb.AsyncDuckDB }> = ({ db }) => {
  const [results, setResults] = useState<FeatureCollection | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [lastInputText, setLastInputText] = useState<string | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [tableSchemes, setTableSchemes] = useState<
    MyDuckDBTableSchema[] | null
  >(null);
  const [summaryOfTableSchemes, setSummaryOfTableSchemes] = useState<
    string | null
  >(null);

  useEffect(() => {
    // get table schema
    const doit = async () => {
      const conn = await db.connect();
      const result1: Table = await conn.query(`
        SHOW;
      `);
      const resultRows1: StructRowProxy<any>[] = result1.toArray();
      const newTableSchemes: MyDuckDBTableSchema[] = [];
      for (const row1 of resultRows1) {
        const table = row1.toJSON();
        const tableName = table.name as string;
        const result2: Table = await conn.query(`
          DESCRIBE TABLE ${tableName};
        `);
        const resultRows2: StructRowProxy<any>[] = result2.toArray();
        newTableSchemes.push({
          tableName: tableName,
          columns: resultRows2.map((row) =>
            row.toJSON()
          ) as MyDuckDBTableColumn[],
        });
      }
      setTableSchemes(newTableSchemes);
      const summaryOfTableSchemes =
        "Summary of tables:" +
        newTableSchemes.map((tableScheme) => {
          return `\n${tableScheme.tableName}:\n${tableScheme.columns
            .map((column) => {
              return `  ${column.column_name}: ${column.column_type}`;
            })
            .join("\n")}`;
        });
      console.log(summaryOfTableSchemes);
      setSummaryOfTableSchemes(summaryOfTableSchemes);
    };
    doit();
  }, [db]);

  useEffect(() => {
    const doit = async () => {
      if (!query) {
        return;
      }
      const conn = await db.connect();
      const results: Table = await conn.query(query);
      const resultRows: StructRowProxy<any>[] = results.toArray();
      if (resultRows.length === 0) {
        setResults(null);
        return;
      }
      // geojsonにする
      const resultFeatures: Feature[] = resultRows.map((row) => ({
        type: "Feature",
        properties: { name: row.name, value: row.value },
        geometry: JSON.parse(row.geom),
      }));
      const resultGeoJson: FeatureCollection = {
        type: "FeatureCollection",
        features: resultFeatures,
      };
      setResults(resultGeoJson);
      await conn.close();
    };
    doit();
  }, [db, query]);

  const onSubmit = useCallback(async () => {
    if (!inputText || !summaryOfTableSchemes) {
      return;
    }

    setInputText("");
    setQuery(null);
    setLastInputText(inputText);

    const prompt = `You are an expert of PostgreSQL and PostGIS. You output the best PostgreSQL query based on given table schema and input text.

You will always reply according to the following rules:
- Output valid PostgreSQL query.
- The query MUST be return name, value and geom columns.
- The query MUST be enclosed by three backticks on new lines, denoting that it is a code block.

### Table Schema: ###
${summaryOfTableSchemes}


### Examples: ###
${queriesWithQuestions
  .map(
    (q) => `
${q.question}
${q.query}
`
  )
  .join("\n")}

### Input text: ###
${inputText}
`;
    const resJson = await nextPostJsonWithCache("/api/ai/duckdb", {
      prompt: prompt,
      query: inputText,
    });
    const newQuery = resJson.duckdb.split("```")[1].trim();
    console.log(newQuery);
    setQuery(newQuery);
  }, [inputText, summaryOfTableSchemes]);

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          padding: "10px 30px",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            width: "400px",
          }}
        >
          <TextInput
            disabled={!summaryOfTableSchemes}
            placeholder="世界で一番人口が多い国は？"
            inputText={inputText}
            setInputText={setInputText}
            onSubmit={onSubmit}
          />
        </div>
        {lastInputText && (
          <div
            style={{
              marginTop: "10px",
              backgroundColor: "lightgray",
              color: "black",
              padding: "8px",
              fontSize: "14px",
              whiteSpace: "pre-line",
              wordBreak: "break-all",
            }}
          >
            {lastInputText}
          </div>
        )}
        {lastInputText && !results && <div>Loading...</div>}
        {results && (
          <pre
            style={{
              marginTop: "10px",
              backgroundColor: "lightgray",
              color: "black",
              padding: "8px",
              fontSize: "14px",
              whiteSpace: "pre-line",
              wordBreak: "break-all",
            }}
          >
            {
              /* 先頭の空改行を削除 */
              query?.replace(/^\n/, "")
            }
          </pre>
        )}
      </div>
      <MapProvider>
        <Map
          id="countriesMap"
          style={{ width: "100vw", height: "100vh" }}
          initialViewState={{
            latitude: 0,
            longitude: 0,
            zoom: 1,
          }}
          mapStyle="https://tile.openstreetmap.jp/styles/osm-bright/style.json"
        >
          {results && <CountryResultsSourceLayer results={results} />}
        </Map>
      </MapProvider>
    </div>
  );
};

export const MyDuckDBComponent: React.FC = () => {
  const [myDuckDB, setMyDuckDB] = useState<duckdb.AsyncDuckDB | null>(null);

  useEffect(() => {
    if (!myDuckDB) {
      initDuckDB(setMyDuckDB);
    }
  }, [myDuckDB]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        height: "100vh",
      }}
    >
      {myDuckDB ? <ChatMapWithDuckDB db={myDuckDB} /> : <div>Loading...</div>}
    </div>
  );
};
