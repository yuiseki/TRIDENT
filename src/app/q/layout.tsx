import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TRIDENT Quiz",
  description: "地理クイズに挑戦＆出題しよう！",
  openGraph: {
    title: "TRIDENT Quiz",
    description: "地理クイズに挑戦＆出題しよう！",
    images: [
      {
        url: "https://trident.yuiseki.net/og_images/quiz.png",
        width: 1200,
        height: 630,
        alt: "TRIDENT Quiz",
      },
    ],
  },
  twitter: {
    title: "TRIDENT Quiz",
    description: "地理クイズに挑戦＆出題しよう！",
    images: ["https://trident.yuiseki.net/og_images/quiz.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}