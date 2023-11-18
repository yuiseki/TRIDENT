import fs from "node:fs/promises";

const reportBaseDir = `./tmp/api.reliefweb.int/v1/reports`;

// tmp/api.reliefweb.int/v1/reports/4/40/4015894.json のようなパスにJSONがある
// reportBaseDir内のディレクトリ内を再帰的に探索して、すべてのファイルの一覧を生成する
// 関数を定義して再帰呼び出しする
const reportJsonPaths: string[] = [];
const walk = async (dir: string) => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      await walk(`${dir}/${dirent.name}`);
    } else {
      reportJsonPaths.push(`${dir}/${dirent.name}`);
    }
  }
};
await walk(reportBaseDir);

//console.log("reportJsonPaths:", reportJsonPaths);

// JSONを一つづつ読み込む
for (const reportJsonPath of reportJsonPaths) {
  const reportListJson = JSON.parse(await fs.readFile(reportJsonPath, "utf-8"));
  for (const reportData of reportListJson) {
    // reportData.fields.language[].codeに"en"が無かったらスキップ
    if (
      !reportData.fields.language.some(
        (language: { code: string }) => language.code === "en"
      )
    ) {
      continue;
    } else {
      // reportData.fields.date.createdの日付を取得
      const reportDateCreated = new Date(reportData.fields.date.created);
      // reportData.fields.date.originalの日付を取得
      const reportDateOriginal = new Date(reportData.fields.date.original);
      // reportDateOriginalが一週間前より古かったらスキップ
      const dateOneWeekAgo = new Date();
      dateOneWeekAgo.setDate(dateOneWeekAgo.getDate() - 7);
      if (reportDateOriginal < dateOneWeekAgo) {
        continue;
      }
      // reportData.fields.titleの文字列を取得
      const reportTitle = reportData.fields.title;
      // reportData.fields.bodyの文字列を取得
      const reportBody = reportData.fields.body;

      console.log("===== ===== ===== =====");
      console.log("===== ===== ===== =====");
      console.log("===== ===== ===== =====");
      // reportDateCreatedとreportDateOriginalとreportTitleを改行区切りで出力
      console.log(`${reportDateOriginal}\n${reportTitle}\n${reportBody}\n`);
    }
  }
}
