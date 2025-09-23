import { Zen_Kaku_Gothic_New } from "next/font/google";

export const zenKaku = Zen_Kaku_Gothic_New({
  // 日本語＋ラテンをプリロード対象に（必要なサブセットだけに絞ってOK）
  subsets: ["latin"],
  // 可変フォントではないので必要なウェイトを配列で
  weight: ["300", "400", "500", "700", "900"],
  // Tailwind等で使いやすくするためCSS変数を発行
  variable: "--font-zen-kaku",
  // 予備フォント（環境依存の日本語ゴシック → 最後に汎用）
  fallback: [
    '"Hiragino Kaku Gothic ProN"',
    '"Yu Gothic"',
    "Meiryo",
    "sans-serif",
  ],
});
