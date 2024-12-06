import fs from "node:fs/promises";
const disastersBaseDir = `./tmp/api.reliefweb.int/v1/disasters`;

export const getDisasterJsonPaths = async () => {
  // tmp/api.reliefweb.int/v1/disasters/9/90/9014.json のようなパスにJSONがある
  // disastersBaseDir内のディレクトリ内を再帰的に探索して、すべてのファイルの一覧を生成する
  // 関数を定義して再帰呼び出しする
  const disasterJsonPaths: string[] = [];
  const walk = async (dir: string) => {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        await walk(`${dir}/${dirent.name}`);
      } else {
        // jsonファイルのみを対象とする
        if (!dirent.name.endsWith(".json")) {
          continue;
        }
        disasterJsonPaths.push(`${dir}/${dirent.name}`);
      }
    }
  };
  await walk(disastersBaseDir);
  return disasterJsonPaths;
};
