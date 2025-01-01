"use client";

import React, { useEffect, useState } from "react";
import Map, { Source, Layer, MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";

const CountriesDisastersMap: React.FC = () => {
  const [geoJSON, setGeoJSON] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (geoJSON) return;

    fetch(`/data/voyager/latest/data.geojson`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch GeoJSON");
        }
        return res.json();
      })
      .then((data) => setGeoJSON(data))
      .catch((err) => console.error(err));
  }, []);

  // マーカークリック時の処理
  const handleMarkerClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (feature && feature.properties?.country) {
      const countryName = feature.properties.country;
      router.push(`/voyager/${encodeURIComponent(countryName)}`);
    }
  };

  return (
    <Map
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 5,
      }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="/map_styles/fiord-color-gl-style/style.json"
      interactiveLayerIds={["disasters-layer"]} // クリック可能なレイヤーを指定
      onClick={handleMarkerClick} // クリックイベントを追加
    >
      {geoJSON && (
        <Source id="disasters" type="geojson" data={geoJSON}>
          <Layer
            id="disasters-layer"
            type="circle"
            paint={{
              "circle-radius": 5,
              "circle-color": "#ff0000", // 赤色のポイント
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      )}
    </Map>
  );
};

export default CountriesDisastersMap;
