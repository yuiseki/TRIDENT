import yaml from "yaml";

export const parseYamlWithIncludes = async (
  fileHandle: FileSystemFileHandle,
  rootDirHandle: FileSystemDirectoryHandle
): Promise<any> => {
  const file = await fileHandle.getFile();
  let text = await file.text();

  // 正規表現で !!inc/file のパスとその前のインデントを取得（配列のリスト記号はインデントのみ）
  const includePattern = /^(\s*-\s*)?!!inc\/file\s+([^\s]+)$/gm;
  let match;

  // すべての !!inc/file を YAMLテキストの内容で置換
  while ((match = includePattern.exec(text)) !== null) {
    const listIndent = match[1] || ""; // `- `を含むインデント
    const filePath = match[2]; // ファイルパス
    const fullIndent = listIndent ? listIndent.replace(/- /, "") : ""; // `- `をインデントに置換

    // インデントを調整したYAMLテキストを取得
    const includedYamlText = await loadIncludedFileAsYamlText(
      filePath,
      rootDirHandle,
      fullIndent
    );

    // `!!inc/file` 参照部分をインデント済みYAMLテキストで置換
    text = text.replace(match[0], includedYamlText);
  }

  console.log(text);

  // すべての !!inc/file を置換した後にYAML全体をパースしてJSONに変換
  return yaml.parse(text);
};

// 指定されたパスのファイルを読み込み、指定されたインデントでYAMLテキストとして返す
const loadIncludedFileAsYamlText = async (
  filePath: string,
  rootDirHandle: FileSystemDirectoryHandle,
  indent: string
): Promise<string> => {
  const [dirName, fileName] = filePath.split("/");
  const subDirHandle = await rootDirHandle.getDirectoryHandle(dirName);
  const includedFileHandle = await subDirHandle.getFileHandle(fileName);
  const file = await includedFileHandle.getFile();
  const yamlText = await file.text();

  // 各行にインデントを追加して返す
  return yamlText
    .split("\n")
    .map((line, index) => (index === 0 ? `- ${line}` : indent + line)) // 初行にのみ `- `を追加し、以降はインデントのみ
    .join("\n");
};
