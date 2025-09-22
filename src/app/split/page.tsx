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
import { StaticRegionsGlobeMap } from "@/components/StaticRegionsGlobeMap";

type RegionConfig = {
  name: string;
  title: string;
  description: string;
  updatedAt: Date;
  type: string;
  countries: string[];
  organizations: string[];
  activitiesCount: number;
  adminUnitsCount: number;
  priorityNeeds: string[];
  sources: {
    url: string;
    title: string;
  }[];
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
  const regions = useMemo<RegionConfig[]>(() => {
    return realDisasters.map((disaster, index) => {
      return {
        name: disaster.countries[0],
        title: disaster.title,
        description: disaster.description,
        updatedAt: disaster.updatedAt,
        type: disaster.type,
        countries: disaster.countries,
        organizations: disaster.organizations,
        activitiesCount: disaster.activitiesCount,
        adminUnitsCount: disaster.adminUnitsCount,
        priorityNeeds: disaster.priorityNeeds,
        sources: disaster.sources,
        data: generateRandomData(),
      };
    });
  }, [realDisasters]);

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
              height: "500px",
            }}
          >
            <div style={{ height: "70%", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  zIndex: 100,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
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
                <div
                  style={{
                    color: "rgb(0, 158, 219)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "end",
                    justifyContent: "end",
                    position: "absolute",
                    bottom: "5px",
                    right: "5px",
                    padding: "5px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <h4
                    style={{
                      fontWeight: "normal",
                    }}
                  >
                    Orgs: {region.organizations.length}
                  </h4>
                  <h4
                    style={{
                      fontWeight: "normal",
                    }}
                  >
                    Activities: {region.activitiesCount}
                  </h4>
                  <h4
                    style={{
                      fontWeight: "normal",
                    }}
                  >
                    Admin Units: {region.adminUnitsCount}
                  </h4>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  zIndex: 90,
                  width: "335px",
                  height: "335px",
                  pointerEvents: "none",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <StaticRegionsGlobeMap
                  mapStyle="/map_styles/dark-matter-gl-style/style.json"
                  regionNames={[region.name]}
                  showAttribution={false}
                  showControls={false}
                />
              </div>
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
                  justifyContent: "space-between",
                  height: "100%",
                  width: "50%",
                  paddingTop: "1%",
                  paddingBottom: "1%",
                  color: "rgb(0, 158, 219)",
                }}
              >
                <p>
                  <strong>優先ニーズ：</strong>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    {region.priorityNeeds.join(", ")}
                  </span>
                </p>
                <p>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    Updated at: {region.updatedAt.toLocaleDateString()}
                  </span>
                  <span>, </span>
                  <span>
                    Sources:{" "}
                    {region.sources.map((item, idx) => {
                      return (
                        <>
                          <a
                            key={idx}
                            href={item.url}
                            title={item.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "rgba(0, 158, 219, 0.8)" }}
                          >
                            {idx}
                          </a>{" "}
                        </>
                      );
                    })}
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
