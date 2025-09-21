"use client";

import { BaseMap } from "@/components/BaseMap";
import { MapProvider } from "react-map-gl/maplibre";
import { useCallback, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  MapRef,
  ViewState,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Legend,
} from "recharts";

import { realDisasters } from "@/constants/RealDisasters";

type RegionConfig = {
  name: string;
  title: string;
  incidents: string[];
  responders?: string[];
  description: string;
  longitude: number;
  latitude: number;
  data?: { name: string; amt: number; pv: number; uv: number }[];
};

const SYNC_THROTTLE_MS = 30;
const MINIMUM_ZOOM = 0.5;

const generateRandomData = () => {
  const data = [];
  for (let i = 0; i < 8; i++) {
    data.push({
      name: `Page ${String.fromCharCode(65 + i)}`,
      amt: Math.floor(Math.random() * 200) + 100,
      pv: Math.floor(Math.random() * 200) + 100,
      uv: Math.floor(Math.random() * 200) + 100,
      nv: Math.floor(Math.random() * 200) + 100,
    });
  }
  return data;
};

export default function SplitPage() {
  // メルカトル図法の緯度歪み係数を計算
  const calculateZoomLevel = useCallback(
    (latitude: number, baseZoom: number = 1.2): number => {
      const clampedLat = Math.max(-85, Math.min(85, latitude));
      const latRad = (clampedLat * Math.PI) / 180;
      const cosLat = Math.cos(latRad);
      const distortionFactor =
        cosLat === 0 ? Number.POSITIVE_INFINITY : 1 / cosLat;
      const adjustedZoom = baseZoom - Math.log2(Math.max(distortionFactor, 1));
      return Math.max(MINIMUM_ZOOM, adjustedZoom);
    },
    []
  );

  const regions = useMemo<RegionConfig[]>(() => {
    return realDisasters.map((disaster, index) => {
      return {
        name: disaster.countries[0],
        title: disaster.title,
        incidents: disaster.incidents,
        responders: disaster.responders,
        description: disaster.description,
        longitude: 0 + index * 10,
        latitude: -10 + index * 5,
        data: generateRandomData(),
      };
    });
  }, [calculateZoomLevel]);

  const mapRefs = useMemo<MutableRefObject<MapRef | null>[]>(
    () =>
      Array.from(
        { length: regions.length },
        () => ({ current: null } as MutableRefObject<MapRef | null>)
      ),
    [regions.length]
  );

  return (
    <main
      style={{
        width: "99vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        padding: "5px",
      }}
    >
      <MapProvider>
        {regions.map((region, index) => (
          <div
            key={region.name}
            style={{
              position: "relative",
              border: "1px solid rgba(0, 158, 219, 0.6)",
              margin: "5px",
              padding: "10px",
              minHeight: "300px",
              maxHeight: "500px",
            }}
          >
            <div style={{ height: "70%" }}>
              <BaseMap
                id={`map-${index}`}
                mapRef={mapRefs[index]}
                longitude={region.longitude}
                latitude={region.latitude}
                zoom={calculateZoomLevel(region.latitude)}
                style="/map_styles/dark-matter-gl-style/style.json"
                showAtmosphere={true}
                showAttribution={false}
                showControls={false}
              >
                <div
                  style={{
                    color: "rgb(0, 158, 219)",
                    position: "absolute",
                    top: "5px",
                    left: "5px",
                    padding: "5px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.4em",
                      marginBottom: "6px",
                    }}
                  >
                    {region.title}
                  </h3>
                  <h4
                    style={{
                      fontWeight: "normal",
                    }}
                  >
                    {region.description}
                  </h4>
                </div>
              </BaseMap>
            </div>
            <div
              style={{
                height: "33%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderTop: "1px solid rgba(0, 158, 219, 0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "start",
                  height: "100%",
                  width: "50%",
                  paddingTop: "1%",
                  color: "rgb(0, 158, 219)",
                }}
              >
                <p>
                  <strong>インシデント：</strong>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    {region.incidents.join(", ")}
                  </span>
                </p>
                <p>
                  <strong>対応組織：</strong>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    {region.responders
                      ? region.responders.join(", ")
                      : "情報なし"}
                  </span>
                </p>
              </div>
              <ResponsiveContainer height={"100%"} width="50%">
                <ComposedChart
                  accessibilityLayer
                  barCategoryGap="10%"
                  barGap={6}
                  data={region.data}
                  margin={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 15,
                  }}
                  syncMethod="index"
                >
                  <CartesianGrid stroke="rgba(0, 158, 219, 0.4)" />
                  <XAxis tick={{ fill: "rgba(0, 158, 219, 0.8)" }} />
                  <YAxis
                    dataKey="uv"
                    orientation="left"
                    yAxisId={0}
                    ticks={[0, 50, 100, 150, 200, 250, 300]}
                    tick={{ fill: "rgba(0, 158, 219, 0.8)" }}
                  />
                  <Area
                    dataKey="amt"
                    name="影響面積"
                    fill="rgba(0, 158, 219, 0.4)"
                    stroke="rgba(0, 158, 219, 0.6)"
                    type="monotone"
                  />
                  <Bar
                    dataKey="uv"
                    name="要救助者"
                    fill="rgba(0, 158, 219, 0.6)"
                    barSize={20}
                  />
                  <Line
                    dataKey="pv"
                    name="支援者"
                    fill="rgba(74, 128, 70, 0.8)"
                    stroke="rgba(74, 128, 70, 0.8)"
                    type="monotone"
                  />
                  <Line
                    dataKey="nv"
                    name="損壊施設"
                    fill="rgba(185, 117, 72, 0.6)"
                    stroke="rgba(185, 117, 72, 0.6)"
                    type="monotone"
                    yAxisId={0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </MapProvider>
    </main>
  );
}
