"use client";

import dynamic from "next/dynamic";

// 動的に地図コンポーネントを読み込む
const MyMap = dynamic(() => import("./MyMap"), { ssr: false });

const MapPage: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MyMap />
    </div>
  );
};

export default MapPage;
