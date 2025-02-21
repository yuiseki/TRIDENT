"use client";

import { GeoEAGTaskComponent } from "@/components/GeoEAGTaskComponent";
import { GeoETATaskComponent } from "@/components/GeoETATaskComponent";
import { GeoGLUETask } from "@/types/GeoGLUE";
/*
1️⃣ 同じ場所を指しているかクイズ（GeoEAG - エンティティアライメント）
📖 ルール: 2つの住所や施設名が 同じ場所かどうかを判定 する
📝 選択肢: ✅「完全一致」 ✅「部分的に一致」 ❌「不一致」

🖼️ 例


Q: 「東京都千代田区丸の内2-7-2 JPタワー」 と 「東京都千代田区丸の内二丁目7-2 JPタワー」は同じ場所ですか？

2️⃣ 正しい住所を選ぼう！（GeoETA - 地理エンティティタグ付け）
📖 ルール: テキストから 地理情報を抽出し、適切なタグを選ぶ
📝 選択肢: 「都道府県」「市区町村」「町名」「番地」「施設名」「その他」

🖼️ 例

Q: 「東京都港区芝公園4-2-8 東京タワー」 の「東京タワー」は何に分類される？

選択肢
🏞️ 都道府県
🏙️ 市区町村
🏘️ 町名
🏠 番地
🏢 施設名
🏗️ その他

*/

import { useState } from "react";

const tasks: GeoGLUETask[] = [
  {
    type: "GeoEAG",
    question:
      "「東京都千代田区丸の内2-7-2 JPタワー」と「東京都千代田区丸の内二丁目7-2 JPタワー」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "全く同じ",
  },
  // ユニバーサル・スタジオ・ジャパンとUSJ
  {
    type: "GeoEAG",
    question: "「ユニバーサル・スタジオ・ジャパン」と「USJ」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "全く同じ",
  },
  // 六本木ヒルズ森タワーと六本木ヒルズ
  {
    type: "GeoEAG",
    question: "「六本木ヒルズ森タワー」と「六本木ヒルズ」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "部分的に一致",
  },
  // 東京ビッグサイトと東京国際展示場
  {
    type: "GeoEAG",
    question: "「東京ビッグサイト」と「東京国際展示場」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "全く同じ",
  },
  // 関空と関西国際空港
  {
    type: "GeoEAG",
    question: "「関空」と「関西国際空港」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "全く同じ",
  },
  // 代々木公園と明治神宮
  {
    type: "GeoEAG",
    question: "「代々木公園」と「明治神宮」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "全く違う",
  },
  // 原爆ドームと広島平和記念公園
  {
    type: "GeoEAG",
    question: "「原爆ドーム」と「広島平和記念公園」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "部分的に一致",
  },
  // 東京大学本郷キャンパスと東大
  {
    type: "GeoEAG",
    question: "「東京大学本郷キャンパス」と「東大」は同じ場所ですか？",
    options: ["全く同じ", "部分的に一致", "全く違う"],
    correctAnswer: "部分的に一致",
  },
  {
    type: "GeoETA",
    question:
      "「東京都港区芝公園4-2-8 東京タワー」 の「東京タワー」は何に分類される？",
    options: ["都道府県", "市区町村", "町名", "番地", "施設名", "その他"],
    correctAnswer: "施設名",
  },
];

export default function Page() {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask = tasks[currentTaskIndex];

  const handleNext = () => {
    setCurrentTaskIndex((prev) => prev + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        borderRadius: "5px",
        margin: "20px",
        width: "100vw",
      }}
    >
      <div
        style={{
          width: "80%",
          border: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          padding: "20px",
        }}
      >
        {currentTask.type === "GeoEAG" ? (
          <GeoEAGTaskComponent task={currentTask} onNext={handleNext} />
        ) : (
          <GeoETATaskComponent task={currentTask} onNext={handleNext} />
        )}
      </div>
    </div>
  );
}
