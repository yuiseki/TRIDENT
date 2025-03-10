import React, { useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { colorForYaml } from "@/lib/react-codemirror/extensions/color-yaml/index.ts";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { yaml } from "@codemirror/lang-yaml";
import { useKeyBind } from "@/hooks/keybind";
import { parseYamlWithIncludes } from "@/utils/parseYaml";
import Map, { GeolocateControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { TridentCharitesDefaultContents } from "@/lib/trident/charites/default";
import { TextInput } from "@/components/TextInput";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";

export const TridentFileSystem: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null
  );
  const [notification, setNotification] = useState<string>("");
  const [layersFiles, setLayersFiles] = useState<string[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>("style.yml");
  const [styleJsonOutput, setStyleJsonOutput] = useState<any | null>(null);
  const [inputText, setInputText] = useState<string>("");

  // OPFSを初期化する
  const initializeFileSystem = async () => {
    try {
      // OPFSのルートディレクトリを取得
      const rootDir = await navigator.storage.getDirectory();

      // デフォルト内容を使ってファイルを作成
      for (const { path, content } of TridentCharitesDefaultContents) {
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
        // ファイルが存在する場合はスキップ
        try {
          await dirHandle.getFileHandle(pathParts[pathParts.length - 1]);
          continue;
        } catch (error) {
          // ファイルが存在しない場合は作成
          const fileName = pathParts[pathParts.length - 1];
          const fileHandle = await dirHandle.getFileHandle(fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
        }
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
        if (entry.kind === "file") {
          files.push(entry.name);
        }
      }
      setLayersFiles(files.sort());
      setNotification("ファイルシステムを初期化しました");
    } catch (error) {
      console.error(error);
      setNotification("ファイルシステムの初期化に失敗しました");
    }
  };

  // ファイルシステムの内容全体を地図に反映する
  const updateMapStyleJson = useCallback(async () => {
    try {
      const rootDirHandle = await navigator.storage.getDirectory();
      const styleFileHandle = await rootDirHandle.getFileHandle("style.yml");
      // 再帰的に !!inc/file を処理し、JSON変換
      const data = await parseYamlWithIncludes(styleFileHandle, rootDirHandle);
      setStyleJsonOutput(data); // JSON出力を状態に保存
      setNotification(
        "ファイルシステム内のYAMLをJSONに変換しました。地図を描画します"
      );
    } catch (error) {
      console.error(error);
      setNotification(
        "ファイルシステム内のYAMLのJSONへの変換に失敗しました。文法を確認してください"
      );
    }
  }, []);

  // エディターの内容をファイルシステムに保存する
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

    // ファイル保存後に内容を反映
    await updateMapStyleJson();
  }, [content, fileHandle, updateMapStyleJson]);

  // Ctrl + S で保存
  useKeyBind({
    key: "s",
    ctrlKey: true,
    onKeyDown: () => saveFile(),
  });

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
    const initializeAndSave = async () => {
      await initializeFileSystem();
      await updateMapStyleJson();
    };
    void initializeAndSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = useCallback(async () => {
    if (!inputText) {
      return;
    }

    setInputText("");
    setNotification("AIによるファイルの編集を実行しています……");

    try {
      // 全ファイルの内容をJSONにする
      // rootDirHandleに基づいてファイルシステム内の全ファイルパスと内容をresultsに格納する再帰関数、walk
      const results: { path: string; content: string }[] = [];
      const rootDirHandle = await navigator.storage.getDirectory();
      const walk = async (
        dirHandle: FileSystemDirectoryHandle,
        path: string
      ) => {
        for await (const [name, entry] of dirHandle.entries()) {
          if (entry.kind === "file") {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const content = await file.text();
            results.push({ path: path + name, content });
          } else {
            const subDirHandle = await dirHandle.getDirectoryHandle(name);
            await walk(subDirHandle, path + name + "/");
          }
        }
      };
      await walk(rootDirHandle, "");
      const stringifiedResults = JSON.stringify(results, null, 2);
      const resJson = await nextPostJsonWithCache("/api/ai/charites", {
        fs: stringifiedResults,
        prompt: inputText,
      });
      console.log(resJson.content);
      const resContent = resJson.content as string;
      const regex = /```(?:yaml)?\n([\s\S]+)\n```/;
      const resMatched = resContent.match(regex);
      const resBody = resMatched ? resMatched[1] : null;
      if (!resBody) {
        throw new Error("AIによるファイルの編集に失敗しました");
      }
      const newFilePath = resBody.split("\n")[0].replace("# path: ", "");
      console.log(newFilePath);
      const newDirPath = newFilePath.split("/").slice(0, -1).join("/");
      console.log(newDirPath);
      const newFileName = newFilePath.split("/").pop();
      console.log(newFileName);
      if (!newFileName || !newDirPath) {
        throw new Error("AIによるファイルの編集に失敗しました");
      }
      const newDirHandle = await rootDirHandle.getDirectoryHandle(newDirPath);
      const newContent = resBody.split("\n").slice(1).join("\n");

      const newFileHandle = await newDirHandle.getFileHandle(newFileName, {
        create: true,
      });
      const newWritable = await newFileHandle.createWritable();
      await newWritable.write(newContent);
      await newWritable.close();

      await selectFile(newFileName);
      await updateMapStyleJson();
      setNotification("AIによるファイルの編集が完了しました");
    } catch (error) {
      console.error(error);
    }

    setInputText("");
  }, [inputText, updateMapStyleJson]);

  // OPFSの内容を完全に消去して、初期値に戻し、画面をリロードする
  const resetOPFS = async () => {
    try {
      const rootDirHandle = await navigator.storage.getDirectory();
      const entries = [];
      for await (const entry of rootDirHandle.values()) {
        entries.push(entry);
      }
      for (const entry of entries) {
        if (entry.kind === "file") {
          await rootDirHandle.removeEntry(entry.name);
        } else if (entry.kind === "directory") {
          await rootDirHandle.removeEntry(entry.name, { recursive: true });
        }
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      setNotification("ファイルシステムのリセットに失敗しました");
    }
  };

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
        TRIDENT Charites v0.0.1
      </h1>
      <div
        style={{
          width: "400px",
          marginBottom: "5px",
        }}
      >
        <TextInput
          disabled={false}
          placeholder="国の名前を黄色にして"
          inputText={inputText}
          setInputText={setInputText}
          onSubmit={onSubmit}
        />
      </div>
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
        </div>
        <Map
          initialViewState={{
            longitude: 1,
            latitude: 1,
            zoom: 4,
          }}
          style={{ width: "100vw", height: "80vh" }}
          mapStyle={styleJsonOutput ? styleJsonOutput : {}}
        >
          <GeolocateControl />
        </Map>
      </div>
      <div
        style={{
          display: "flex",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
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
            backgroundColor: "darkred",
          }}
          onClick={resetOPFS}
        >
          ファイルシステムをリセット
        </button>
      </div>
    </div>
  );
};
