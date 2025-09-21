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
import { incidents } from "@/constants/Incidents";
import { responders } from "@/constants/Responders";

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

const respondersByIncidentJa = (inputIncidents: string[]): string[] => {
  const respondersSet = new Set<string>();

  inputIncidents.forEach((incidentJa) => {
    incidents.forEach((incident) => {
      if (incident.relatedIncidentsJa.includes(incidentJa)) {
        responders.forEach((responder) => {
          if (responder.field === incident.name) {
            respondersSet.add(responder.name);
          }
        });
      }
    });
  });
  return Array.from(respondersSet);
};

const realDisasters = [
  {
    id: "AC-2025-000098-PAN",
    title: "Panama: River Pollution - Jun 2025",
    type: "Technological Disaster",
    incidents: [
      "Cholera and waterborne diseases",
      "Damage to water systems",
      "Water trucking needs",
      "Livelihood disruption",
    ],
    countries: ["Panama"],
    description:
      "ラ・ビジャ川の汚染で飲料水供給が停止し、広域で給水支援が必要。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "WF-2025-000109-SYR",
    title: "Syria: Wild Fires - Jul 2025",
    type: "Wild Fire",
    incidents: [
      "Mass displacement",
      "Air quality deterioration",
      "Shelter/NFI needs",
      "Health risks (smoke)",
    ],
    countries: ["Syria"],
    description: "ラタキア周辺で大規模森林火災が発生し避難と消火支援が継続。",
    responders: ["SARC", "IFRC", "OCHA"],
  },
  {
    id: "FL-2025-000112-HND",
    title: "Honduras: Floods - Jun 2025",
    type: "Flood",
    incidents: ["Flooding", "Landslides", "Shelter damage", "WASH needs"],
    countries: ["Honduras"],
    description:
      "豪雨による洪水・土砂災害で被害が拡大し、緊急WASHと避難支援が必要。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "ST-2025-000097-GNB",
    title: "Guinea-Bissau: Severe Local Storm - Jun 2025",
    type: "Severe Local Storm",
    incidents: [
      "Wind damage",
      "Roof destruction",
      "Power outages",
      "WASH needs",
    ],
    countries: ["Guinea-Bissau"],
    description: "ガブ地域を強風と豪雨が直撃し家屋損壊と生活基盤に被害。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "EP-2025-000087-CIV",
    title: "Côte d'Ivoire: Cholera Outbreak - Jun 2025",
    type: "Epidemic",
    incidents: [
      "Cholera and waterborne diseases",
      "Strain on health services",
      "Risk communication needs",
      "WASH response",
    ],
    countries: ["Côte d'Ivoire"],
    description: "15年ぶりのコレラ流行が発生し、保健・WASH体制の強化が急務。",
    responders: ["UNICEF", "IFRC", "WHO", "OCHA"],
  },
  {
    id: "FL-2025-000151-YEM",
    title: "Yemen: Floods - Aug 2025",
    type: "Flood",
    incidents: [
      "Flooding",
      "Infrastructure damage",
      "Disease risk",
      "Shelter/NFI needs",
    ],
    countries: ["Yemen"],
    description: "南部で洪水が発生し数十万人規模で支援需要が増大。",
    responders: ["IRC", "OCHA"],
  },
  {
    id: "WF-2025-000163-BOL",
    title: "Bolivia: Wild Fires - Aug 2025",
    type: "Wild Fire",
    incidents: [
      "Large wildfires",
      "Air quality deterioration",
      "Livelihood disruption",
      "Protection risks",
    ],
    countries: ["Bolivia (Plurinational State of)"],
    description: "東部中心に大規模山林火災が拡大し緊急支援が展開。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "EQ-2025-000153-AFG",
    title: "Afghanistan: Earthquakes - Aug 2025",
    type: "Earthquake",
    incidents: [
      "Building collapse",
      "Mass displacement",
      "Trauma/injuries",
      "Emergency shelter",
    ],
    countries: ["Afghanistan"],
    description: "東部でM6.0地震が連続発生し死傷と家屋倒壊が広範に発生。",
    responders: ["IFRC", "OCHA", "IOM", "UNICEF", "WHO"],
  },
  {
    id: "FL-2025-000145-GNQ",
    title: "Equatorial Guinea: Floods - Aug 2025",
    type: "Flood",
    incidents: [
      "Urban flooding",
      "WASH disruption",
      "Health risks",
      "Shelter damage",
    ],
    countries: ["Equatorial Guinea"],
    description: "マラボを中心に豪雨浸水が発生し都市部のWASH・保健対応が必要。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "FL-2025-000126-LAO",
    title: "Lao PDR: Floods - Jul 2025",
    type: "Flood",
    incidents: ["Flooding", "Landslides", "Transport disruption", "WASH needs"],
    countries: ["Lao People's Democratic Republic"],
    description: "熱帯低気圧・台風影響の豪雨で各県が冠水し交通と生活がまひ。",
    responders: ["IFRC", "OCHA"],
  },
];

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

  const randomIntValueForIndex = useCallback((index: number) => {
    return (index * 37) % 100;
  }, []);

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
        gridTemplateColumns: "1fr 1fr",
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
              minHeight: "500px"
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
                <h3
                  style={{
                    color: "rgb(0, 158, 219)",
                    position: "absolute",
                    top: "5px",
                    left: "0px",
                    fontWeight: "bold",
                    fontSize: "1.4em",
                  }}
                >
                  {region.title}
                </h3>
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
                  <strong>概要：</strong>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    {region.description}
                  </span>
                </p>
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
                    {region.responders ? region.responders.join(", ") : "情報なし"}
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
