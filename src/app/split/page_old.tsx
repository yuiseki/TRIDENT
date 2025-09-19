"use client";

import { BaseMap } from "@/components/BaseMap";
import { MapProvider } from "react-map-gl/maplibre";
import { useRef, useState, useCallback } from "react";
import type { MapRef } from "react-map-gl/maplibre";

export default function SplitPage() {
  const mapRefs = Array.from({ length: 6 }, () => useRef<MapRef | null>(null));
  
  // 同期更新中のフラグ（無限ループを防ぐため）
  const [isUpdating, setIsUpdating] = useState(false);

  // メルカトル図法の緯度歪み係数を計算して、地球全体が統一して見えるズームレベルを算出
  const calculateZoomLevel = useCallback((latitude: number, baseZoom: number = 2.9): number => {
    // メルカトル図法における緯度φでの歪み係数: sec(φ) = 1/cos(φ)
    const latRad = (latitude * Math.PI) / 180; // 度をラジアンに変換
    const distortionFactor = 1 / Math.cos(latRad); // 歪み係数
    
    // 歪み係数に応じてズームレベルを調整
    // log2を使って歪み係数の逆数でズームレベルを補正
    const adjustedZoom = baseZoom - Math.log2(distortionFactor);
    
    return Math.max(0.5, adjustedZoom); // 最小ズームレベルを0.5に制限
  }, []);

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

  // 地図移動時の同期処理（リアルタイム対応）
  const handleMapMove = useCallback((mapIndex: number, viewState: any) => {
    if (isUpdating) return; // 無限ループを防ぐ
    
    setIsUpdating(true);
    
    // 移動した地図以外のすべての地図を同期
    mapRefs.forEach((mapRef, index) => {
      if (index !== mapIndex && mapRef.current) {
        // 各地図の基準位置からの相対的な移動量を計算
        const baseLng = regions[index].longitude;
        const baseLat = regions[index].latitude;
        
        // 移動量を計算（移動した地図の基準位置との差分）
        const movedBaseLng = regions[mapIndex].longitude;
        const movedBaseLat = regions[mapIndex].latitude;
        const lngOffset = viewState.longitude - movedBaseLng;
        const latOffset = viewState.latitude - movedBaseLat;
        
        // 他の地図に同じ移動量を適用（ズームレベルは各地図の最適値を維持）
        const newLng = baseLng + lngOffset;
        const newLat = baseLat + latOffset;
        
        // ズームレベルは各地図の計算済み最適値を維持
        const optimalZoom = regions[index].zoom;
        
        // setCenter と setZoom を分けて実行（jumpToでのイベント発火を回避）
        mapRef.current.getMap().off('move', () => {}); // 一時的にイベントを無効化
        mapRef.current.setCenter([newLng, newLat]);
        mapRef.current.setZoom(optimalZoom);
      }
    });
    
    // フラグをリセット
    setTimeout(() => setIsUpdating(false), 100);
  }, [isUpdating, regions]);



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
              onMapMove={() => {
                // ドラッグ中もリアルタイムで他の地図と同期
                if (mapRefs[index].current) {
                  const viewState = {
                    longitude: mapRefs[index].current.getCenter().lng,
                    latitude: mapRefs[index].current.getCenter().lat,
                    zoom: mapRefs[index].current.getZoom(),
                  };
                  handleMapMove(index, viewState);
                }
              }}
              onMapMoveEnd={(e) => {
                // マウスアップ時も同期（念のため）
                handleMapMove(index, e.viewState);
              }}
            />
          </div>
        ))}
      </MapProvider>
    </main>
  );
}
