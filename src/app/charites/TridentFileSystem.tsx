import React, { useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { colorForYaml } from "@/lib/react-codemirror/extensions/color-yaml/index.ts";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { yaml } from "@codemirror/lang-yaml";
import { useKeyBind } from "@/hooks/keybind";
import { parseYamlWithIncludes } from "@/utils/parseYaml";
import Map, { GeolocateControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// デフォルトの内容

const defaultContents = [
  {
    path: "style.yml",
    content: `version: 8
name: TRIDENT Charites Like OPFS Style 
metadata: {}
sources:
  openmaptiles:
    type: vector
    url: https://tile.openstreetmap.jp/data/planet.json
sprite: https://openmaptiles.github.io/osm-bright-gl-style/sprite
glyphs: https://tile.openstreetmap.jp/fonts/{fontstack}/{range}.pbf
layers:
  - !!inc/file layers/background.yml
  - !!inc/file layers/water.yml
  - !!inc/file layers/landcover-park-green.yml
  - !!inc/file layers/highway.yml
  - !!inc/file layers/road-major.yml
  - !!inc/file layers/boundary-land-level-4.yml
  - !!inc/file layers/boundary-land-level-2.yml
  - !!inc/file layers/place-settlement.yml
  - !!inc/file layers/place-country-2.yml`,
  },
  {
    path: "layers/background.yml",
    content: `id: background
type: background
paint:
  background-color: '#45516E'`,
  },
  {
    path: "layers/water.yml",
    content: `id: water
type: fill
source: openmaptiles
source-layer: water
filter:
  - all
  - - '!='
    - intermittent
    - 1
  - - '!='
    - brunnel
    - tunnel
layout:
  visibility: visible
paint:
  fill-antialias: false
  fill-color: '#38435C'`,
  },
  {
    path: "layers/landcover-park-green.yml",
    content: `id: landcover-park-green
type: fill
source: openmaptiles
source-layer: landcover
filter:
  - any
  - - '=='
    - class
    - park
  - - '=='
    - class
    - grass
paint:
  fill-color: hsl(204, 17%, 35%)
  fill-opacity: 0.3`,
  },
  {
    path: "layers/highway.yml",
    content: `id: highway
type: line
minzoom: 10
source: openmaptiles
source-layer: transportation
filter:
  - all
  - - '=='
    - $type
    - LineString
  - - '!in'
    - brunnel
    - bridge
    - tunnel
    - ramp
  - - in
    - class
    - primary
    - secondary
paint:
  line-color: '#3C4357'
  line-opacity: 1
  line-dasharray: [2, 2]
  line-width:
    base: 1.2
    stops:
      - - 8.5
        - 1.2
      - - 9
        - 0.5
      - - 20
        - 18`,
  },
  {
    path: "layers/road-major.yml",
    content: `id: road-major
type: line
minzoom: 10
source: openmaptiles
source-layer: transportation
filter:
  - all
  - - '=='
    - $type
    - LineString
  - - 'in'
    - class
    - motorway
    - trunk
    - primary
paint:
  line-color: '#888'
  line-width:
    base: 1.4
    stops:
      - - 10
        - 0.75
      - - 11
        - 1.5
      - - 20
        - 2`,
  },
  {
    path: "layers/boundary-land-level-4.yml",
    content: `id: boundary-land-level-4
type: line
source: openmaptiles
source-layer: boundary
minzoom: 5
filter:
  - all
  - - '>='
    - admin_level
    - 3
  - - <=
    - admin_level
    - 8
  - - '!='
    - maritime
    - 1
layout:
  line-join: round
  visibility: visible
paint:
  line-color: hsla(195, 47%, 62%, 0.26)
  line-dasharray:
    - 3
    - 1
    - 1
    - 1
  line-width:
    base: 1.4
    stops:
      - - 4
        - 0.4
      - - 5
        - 1
      - - 12
        - 3`,
  },
  {
    path: "layers/boundary-land-level-2.yml",
    content: `id: boundary-land-level-2
type: line
source: openmaptiles
source-layer: boundary
filter:
  - all
  - - '=='
    - admin_level
    - 2
  - - '!='
    - maritime
    - 1
  - - '!='
    - disputed
    - 1
layout:
  line-cap: round
  line-join: round
  visibility: visible
paint:
  line-color: hsl(214, 63%, 76%)
  line-width:
    base: 1
    stops:
      - - 0
        - 0.6
      - - 4
        - 1.4
      - - 5
        - 2
      - - 12
        - 8`,
  },
  {
    path: "layers/place-settlement.yml",
    content: `id: place-settlement
type: symbol
source: openmaptiles
source-layer: place
filter:
  - all
  - - 'in'
    - class
    - city
    - town
    - village
layout:
  text-field: |-
    {name:latin}
    {name:nonlatin}
  text-font:
    - Open Sans Regular
  text-max-width: 8
  text-size:
    base: 1.2
    stops:
      - - 7
        - 14
      - - 11
        - 24
  visibility: visible
paint:
  text-color: hsl(195, 41%, 49%)
  text-halo-color: hsla(228, 60%, 21%, 0.7)
  text-halo-width: 1.2`,
  },
  {
    path: "layers/place-country-2.yml",
    content: `id: place-country-2
type: symbol
source: openmaptiles
source-layer: place
filter:
  - all
  - - '=='
    - class
    - country
layout:
  text-field: '{name:latin}'
  text-font:
    - Open Sans Regular
  text-max-width: 6.25
  text-size:
    stops:
      - - 1
        - 11
      - - 4
        - 17
  text-transform: uppercase
  visibility: visible
paint:
  text-color: rgb(153, 153, 153)
  text-halo-blur: 1
  text-halo-color: hsla(228, 60%, 21%, 0.7)
  text-halo-width: 1.4`,
  },
];

export const TridentFileSystem: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null
  );
  const [notification, setNotification] = useState<string>("");
  const [layersFiles, setLayersFiles] = useState<string[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>("style.yml");
  const [styleJsonOutput, setStyleJsonOutput] = useState<any | null>(null);

  useKeyBind({
    key: "s",
    ctrlKey: true,
    onKeyDown: () => saveFile(),
  });

  // OPFSを初期化する
  const initializeFileSystem = async () => {
    try {
      // OPFSのルートディレクトリを取得
      const rootDir = await navigator.storage.getDirectory();

      // デフォルト内容を使ってファイルを作成
      for (const { path, content } of defaultContents) {
        // pathに/が含まれている場合、ディレクトリが存在しない場合は作成
        const pathParts = path.split("/");
        if (pathParts.length > 1) {
          let dirHandle = rootDir;
          for (let i = 0; i < pathParts.length - 1; i++) {
            dirHandle = await dirHandle.getDirectoryHandle(pathParts[i], {
              create: true,
            });
          }
        }
        // pathに相当するDirectoryHandleを取得
        const dirPath = pathParts.slice(0, -1).join("/");
        const dirHandle = dirPath
          ? await rootDir.getDirectoryHandle(dirPath)
          : rootDir;
        // ファイルを作成
        const fileName = pathParts[pathParts.length - 1];
        const fileHandle = await dirHandle.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      }

      // style.yml ファイルを作成または取得
      const styleFileHandle = await rootDir.getFileHandle("style.yml", {
        create: true,
      });
      setFileHandle(styleFileHandle);

      // デフォルト内容を読み込み
      const file = await styleFileHandle.getFile();
      const text = await file.text();
      setContent(text);

      // layers ディレクトリを作成または取得
      const layersDirHandle = await rootDir.getDirectoryHandle("layers", {
        create: true,
      });

      // layers ディレクトリ内のファイルリストを取得して表示
      const files: string[] = [];
      for await (const [name, entry] of layersDirHandle.entries()) {
        console.info(name);
        if (entry.kind === "file") {
          files.push(entry.name);
        }
      }
      setLayersFiles(files.sort());
      setNotification(
        "ファイルシステムを初期化しました。ファイルを保存すると地図が描画されます"
      );
    } catch (error) {
      console.error(error);
      setNotification("ファイルシステムの初期化に失敗しました");
    }
  };

  // 内容を保存する
  const saveFile = useCallback(async () => {
    if (!fileHandle) return;

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      setNotification("ファイルを保存しました");
    } catch (error) {
      console.error(error);
      setNotification("ファイルの保存に失敗しました");
    }

    try {
      const rootDirHandle = await navigator.storage.getDirectory();
      const styleFileHandle = await rootDirHandle.getFileHandle("style.yml");
      // 再帰的に !!inc/file を処理し、JSON変換
      const data = await parseYamlWithIncludes(styleFileHandle, rootDirHandle);
      setStyleJsonOutput(data); // JSON出力を状態に保存
      setNotification(
        "ファイルシステム内のYAMLをJSONに変換しました。地図を描画します"
      );
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setNotification(
        "YAMLのJSONへの変換に失敗しました。文法を確認してください"
      );
    }
  }, [content, fileHandle]);

  // ファイルを選択して内容を読み込む
  const selectFile = async (fileName: string) => {
    try {
      // ルートディレクトリとlayersディレクトリの取得
      const rootDir = await navigator.storage.getDirectory();
      const fileHandle =
        fileName === "style.yml"
          ? await rootDir.getFileHandle("style.yml")
          : await (
              await rootDir.getDirectoryHandle("layers")
            ).getFileHandle(fileName);

      // ファイル内容の読み込み
      const file = await fileHandle.getFile();
      const text = await file.text();
      setContent(text);
      setFileHandle(fileHandle);
      setCurrentFileName(fileName);
    } catch (error) {
      console.error(error);
      setNotification("ファイルの選択に失敗しました");
    }
  };

  // 初回レンダリング時にファイルシステムを初期化
  useEffect(() => {
    void initializeFileSystem();
  }, []);

  return (
    <div
      style={{
        margin: "5px",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "1.5em",
          margin: "4px 0",
        }}
      >
        TRIDENT Charites v0.0.0
      </h1>
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              marginRight: "4px",
            }}
          >
            <div
              style={{
                marginRight: "2px",
                width: "300px",
                backgroundColor: "#2b2b2b",
                color: "white",
              }}
            >
              <ul>
                <li
                  onClick={() => selectFile("style.yml")}
                  style={{
                    cursor: "pointer",
                    color:
                      currentFileName === "style.yml" ? "lightblue" : "white",
                  }}
                >
                  style.yml
                </li>
                <li
                  style={{
                    cursor: "pointer",
                    color:
                      currentFileName !== "style.yml" ? "lightblue" : "white",
                  }}
                >
                  layers/
                </li>
                <ul>
                  {layersFiles.map((fileName) => (
                    <li
                      key={fileName}
                      onClick={() => selectFile(fileName)}
                      style={{
                        cursor: "pointer",
                        color:
                          currentFileName === fileName ? "lightblue" : "white",
                      }}
                    >
                      {fileName}
                    </li>
                  ))}
                </ul>
              </ul>
            </div>
            <div
              style={{
                height: "80vh",
              }}
            >
              <CodeMirror
                value={content}
                theme={vscodeDark}
                extensions={[yaml(), colorForYaml]}
                onChange={(value) => setContent(value)}
                height="80vh"
                width="550px"
              />
            </div>
          </div>
          <div
            style={{
              height: "2vh",
            }}
          >
            <button
              style={{
                margin: "10px",
                borderRadius: "8px",
                border: "1px solid transparent",
                padding: "0.3em 0.6em",
                fontSize: "1em",
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "border-color 0.25s",
              }}
              onClick={saveFile}
              disabled={!fileHandle}
            >
              ファイルを保存 (Ctrl + S)
            </button>
            <span
              style={{
                color: "white",
              }}
            >
              {notification}
            </span>
          </div>
        </div>
        <Map
          initialViewState={{
            longitude: 1,
            latitude: 1,
            zoom: 4,
          }}
          style={{ width: "100vw", height: "80vh" }}
          mapStyle={styleJsonOutput}
        >
          <GeolocateControl />
        </Map>
      </div>
    </div>
  );
};
