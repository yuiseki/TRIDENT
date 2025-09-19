"use client";

import { BaseMap } from "@/components/BaseMap";
import { MapProvider } from "react-map-gl/maplibre";
import { useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";

export default function SplitPage() {
  const mapRefs = Array.from({ length: 6 }, () => useRef<MapRef | null>(null));

  // 世界の重要な地域の座標
  const regions = [
    { name: "アジア太平洋", longitude: 139.6917, latitude: 35.6895, zoom: 2.8 }, // 東京
    { name: "ヨーロッパ", longitude: 2.3522, latitude: 48.8566, zoom: 2.8 }, // パリ
    { name: "北アメリカ", longitude: -74.006, latitude: 40.7128, zoom: 2.8 }, // ニューヨーク
    { name: "南アメリカ", longitude: -58.3816, latitude: -34.6037, zoom: 2.8 }, // ブエノスアイレス
    { name: "アフリカ", longitude: 18.4241, latitude: -33.9249, zoom: 2.8 }, // ケープタウン
    { name: "中東", longitude: 51.5074, latitude: 25.2769, zoom: 2.8 }, // ドバイ
  ];

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "2px",
      }}
    >
      <MapProvider>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} style={{ position: "relative" }}>
            <BaseMap
              id={`map-${index}`}
              mapRef={mapRefs[index]}
              longitude={regions[index].longitude}
              latitude={regions[index].latitude}
              zoom={regions[index].zoom}
              style="/map_styles/fiord-color-gl-style/style.json"
            />
          </div>
        ))}
      </MapProvider>
    </main>
  );
}
