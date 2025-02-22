import { JGeoGLUETask } from "@/types/JGeoGLUE";

export const JGeoGLUETasks: JGeoGLUETask[] = [
  {
    type: "GeoEAG",
    question:
      "「東京都千代田区丸の内2-7-2 JPタワー」と「東京都千代田区丸の内二丁目7-2 JPタワー」は同じ場所ですか？",
    correctAnswer: "全く同じ",
  },
  // ユニバーサル・スタジオ・ジャパンとUSJ
  {
    type: "GeoEAG",
    question: "「ユニバーサル・スタジオ・ジャパン」と「USJ」は同じ場所ですか？",
    correctAnswer: "全く同じ",
  },
  // 六本木ヒルズ森タワーと六本木ヒルズ
  {
    type: "GeoEAG",
    question: "「六本木ヒルズ森タワー」と「六本木ヒルズ」は同じ場所ですか？",
    correctAnswer: "部分的に一致",
  },
  // 東京ビッグサイトと東京国際展示場
  {
    type: "GeoEAG",
    question: "「東京ビッグサイト」と「東京国際展示場」は同じ場所ですか？",
    correctAnswer: "全く同じ",
  },
  // 関空と関西国際空港
  {
    type: "GeoEAG",
    question: "「関空」と「関西国際空港」は同じ場所ですか？",
    correctAnswer: "全く同じ",
  },
  // 代々木公園と明治神宮
  {
    type: "GeoEAG",
    question: "「代々木公園」と「明治神宮」は同じ場所ですか？",
    correctAnswer: "全く違う",
  },
  // 原爆ドームと広島平和記念公園
  {
    type: "GeoEAG",
    question: "「原爆ドーム」と「広島平和記念公園」は同じ場所ですか？",
    correctAnswer: "部分的に一致",
  },
  // 東京大学本郷キャンパスと東大
  {
    type: "GeoEAG",
    question: "「東京大学本郷キャンパス」と「東大」は同じ場所ですか？",
    correctAnswer: "部分的に一致",
  },
  {
    type: "GeoETA",
    question:
      "「東京都港区芝公園4-2-8 東京タワー」 の「東京タワー」は何に分類される？",
    correctAnswer: "施設名",
  },
];
