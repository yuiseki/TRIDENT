"use client";

import { BaseMap } from "@/components/BaseMap";
import { useRef } from "react";
import { MapProvider, MapRef } from "react-map-gl";

export default function Page() {
  const mapRef = useRef<MapRef | null>(null);
  return (
    <div style={{ background: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h1>TRIDENT Agent</h1>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2>Report of the Morocco: Earthquake - Sep 2023</h2>
        </div>
        <div
          style={{
            width: "90vw",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "6px 6px 6px 5px rgba(0, 0, 0, 0.2);",
            marginBottom: "16px",
          }}
        >
          <h3>Position of the Morocco</h3>
          <div style={{ width: "90vw", height: "85vh" }}>
            <MapProvider>
              <BaseMap
                id="map1"
                mapRef={mapRef}
                style="/map_styles/fiord-color-gl-style/style.json"
                longitude={0}
                latitude={0}
                zoom={1}
              />
            </MapProvider>
          </div>
        </div>
        <div
          style={{
            width: "90vw",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "6px 6px 6px 5px rgba(0, 0, 0, 0.2);",
            marginBottom: "16px",
            padding: "6px",
          }}
        >
          <h3>Geographical features of the Morocco</h3>
          <div style={{ width: "90vw", height: "85vh" }}>
            <MapProvider>
              <BaseMap
                id="map2"
                mapRef={mapRef}
                style="/map_styles/arcgis-world-imagery/style.json"
                longitude={0}
                latitude={0}
                zoom={1}
              />
            </MapProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
