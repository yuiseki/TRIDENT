"use client";

import { BaseMap } from "@/components/BaseMap";
import { MapProvider } from "react-map-gl/maplibre";
import { useRef, useState, useCallback } from "react";
import type { MapRef } from "react-map-gl/maplibre";

export default function SplitPage() {
  const mapRefs = Array.from({ length: 6 }, () => useRef<MapRef | null>(null));
  
  // 同期フラグ（簡潔に）
  const [isSyncing, setIsSyncing] = useState(false);

  // メルカトル図法の緯度歪み係数を計算
  const calculateZoomLevel = useCallback((latitude: number, baseZoom: number = 2.9): number => {
    const latRad = (latitude * Math.PI) / 180;
    const distortionFactor = 1 / Math.cos(latRad);
    const adjustedZoom = baseZoom - Math.log2(distortionFactor);
    return Math.max(0.5, adjustedZoom);
  }, []);

  // 世界の重要な地域の座標（基準位置）
  const regions = [
    { 
      name: "アジア太平洋", 
      longitude: 139.6917, 
      latitude: 35.6895, 
      zoom: calculateZoomLevel(35.6895),
    },
    { 
      name: "ヨーロッパ", 
      longitude: 2.3522, 
      latitude: 48.8566, 
      zoom: calculateZoomLevel(48.8566),
    },
    { 
      name: "北アメリカ", 
      longitude: -74.006, 
      latitude: 40.7128, 
      zoom: calculateZoomLevel(40.7128),
    },
    { 
      name: "南アメリカ", 
      longitude: -58.3816, 
      latitude: -34.6037, 
      zoom: calculateZoomLevel(-34.6037),
    },
    { 
      name: "アフリカ", 
      longitude: 18.4241, 
      latitude: -33.9249, 
      zoom: calculateZoomLevel(-33.9249),
    },
    { 
      name: "中東", 
      longitude: 51.5074, 
      latitude: 25.2769, 
      zoom: calculateZoomLevel(25.2769),
    },
  ];

  // シンプルな同期処理
  const handleMapMoveEnd = useCallback((sourceMapIndex: number, viewState: any) => {
    if (isSyncing) return; // 同期中は処理しない
    
    setIsSyncing(true);
    
    // 移動量を計算
    const sourceRegion = regions[sourceMapIndex];
    const lngOffset = viewState.longitude - sourceRegion.longitude;
    const latOffset = viewState.latitude - sourceRegion.latitude;
    
    // 他の地図を同期（requestAnimationFrameで次のフレームで実行）
    requestAnimationFrame(() => {
      mapRefs.forEach((mapRef, index) => {
        if (index !== sourceMapIndex && mapRef.current) {
          const targetRegion = regions[index];
          const targetMap = mapRef.current.getMap();
          
          // 位置を更新（jumpToは内部的にイベントを発火しないモードで実行）
          targetMap.jumpTo({
            center: [
              targetRegion.longitude + lngOffset,
              targetRegion.latitude + latOffset
            ],
            zoom: targetRegion.zoom,
          });
        }
      });
      
      // 同期フラグをリセット
      setTimeout(() => setIsSyncing(false), 10);
    });
  }, [isSyncing, regions]);

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
              onMapMoveEnd={(e) => {
                handleMapMoveEnd(index, e.viewState);
              }}
            />
          </div>
        ))}
      </MapProvider>
    </main>
  );
}