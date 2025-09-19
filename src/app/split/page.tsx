"use client";

import { BaseMap } from "@/components/BaseMap";
import { MapProvider } from "react-map-gl/maplibre";
import { useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";

export default function SplitPage() {
  const mapRefs = Array.from({ length: 6 }, () => useRef<MapRef | null>(null));

  // メルカトル図法の緯度歪み係数を計算して、地球全体が統一して見えるズームレベルを算出
  const calculateZoomLevel = (latitude: number, baseZoom: number = 2.9): number => {
    // メルカトル図法における緯度φでの歪み係数: sec(φ) = 1/cos(φ)
    const latRad = (latitude * Math.PI) / 180; // 度をラジアンに変換
    const distortionFactor = 1 / Math.cos(latRad); // 歪み係数
    
    // 歪み係数に応じてズームレベルを調整
    // log2を使って歪み係数の逆数でズームレベルを補正
    const adjustedZoom = baseZoom - Math.log2(distortionFactor);
    
    return Math.max(0.5, adjustedZoom); // 最小ズームレベルを0.5に制限
  };

  // 世界の重要な地域の座標
  // 各地点の緯度に基づいて数学的に計算されたズームレベルを適用
  const regions = [
    { 
      name: "アジア太平洋", 
      longitude: 139.6917, 
      latitude: 35.6895, 
      zoom: calculateZoomLevel(35.6895), // 計算結果: 約1.81
    }, // 東京
    { 
      name: "ヨーロッパ", 
      longitude: 2.3522, 
      latitude: 48.8566, 
      zoom: calculateZoomLevel(48.8566), // 計算結果: 約1.42（高緯度で大幅調整）
    }, // パリ
    { 
      name: "北アメリカ", 
      longitude: -74.006, 
      latitude: 40.7128, 
      zoom: calculateZoomLevel(40.7128), // 計算結果: 約1.68
    }, // ニューヨーク
    { 
      name: "南アメリカ", 
      longitude: -58.3816, 
      latitude: -34.6037, 
      zoom: calculateZoomLevel(-34.6037), // 計算結果: 約1.83（南緯でも同様に計算）
    }, // ブエノスアイレス
    { 
      name: "アフリカ", 
      longitude: 18.4241, 
      latitude: -33.9249, 
      zoom: calculateZoomLevel(-33.9249), // 計算結果: 約1.84
    }, // ケープタウン
    { 
      name: "中東", 
      longitude: 51.5074, 
      latitude: 25.2769, 
      zoom: calculateZoomLevel(25.2769), // 計算結果: 約1.88（低緯度で最小調整）
    }, // ドバイ
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
              enableInteractions={false}
              style="/map_styles/fiord-color-gl-style/style.json"
            />
          </div>
        ))}
      </MapProvider>
    </main>
  );
}
