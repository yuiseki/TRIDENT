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

type RegionConfig = {
  name: string;
  incident?: string;
  responders?: string[];
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
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

const respondersList = [
  // System-wide coordination
  { name: "OCHA", field: "Coordination", domain: "Inter-Cluster Coordination" },

  // Protection cluster + AoRs
  { name: "UNHCR", field: "Protection", domain: "Cluster" },
  { name: "UNFPA", field: "Protection", domain: "GBV AoR" },
  { name: "UNICEF", field: "Protection", domain: "Child Protection AoR" },
  { name: "UNMAS", field: "Protection", domain: "Mine Action AoR" },
  { name: "NRC", field: "Protection", domain: "HLP AoR" },
  { name: "UN-Habitat", field: "Protection", domain: "HLP AoR" },

  // CCCM
  { name: "IOM", field: "CCCM", domain: "Cluster (Natural disasters lead)" },
  { name: "UNHCR", field: "CCCM", domain: "Cluster (Conflict lead)" },

  // Shelter
  { name: "UNHCR", field: "Shelter", domain: "Cluster (Conflict lead)" },
  {
    name: "IFRC",
    field: "Shelter",
    domain: "Cluster (Natural disasters convenor/lead)",
  },

  // Education
  { name: "UNICEF", field: "Education", domain: "Cluster (Co-lead)" },
  {
    name: "Save the Children",
    field: "Education",
    domain: "Cluster (Co-lead)",
  },

  // Food Security
  { name: "FAO", field: "Food Security", domain: "Cluster (Co-lead)" },
  { name: "WFP", field: "Food Security", domain: "Cluster (Co-lead)" },

  // Health
  { name: "WHO", field: "Health", domain: "Cluster" },

  // Nutrition
  { name: "UNICEF", field: "Nutrition", domain: "Cluster" },

  // WASH
  { name: "UNICEF", field: "WASH", domain: "Cluster" },

  // Logistics
  { name: "WFP", field: "Logistics", domain: "Cluster" },

  // Emergency Telecommunications
  { name: "WFP", field: "Emergency Telecommunications", domain: "Cluster" },

  // Early Recovery
  { name: "UNDP", field: "Early Recovery", domain: "Cluster" },
];

// responders が対応するべきインシデントのリスト
const clusters = [
  {
    name: "Protection",
    nameJa: "保護",
    relatedIncidents: [
      "Conflicts",
      "Terrorism",
      "Mass displacement",
      "GBV",
      "Child rights violations",
      "Mines/ERW",
      "Forced evictions",
      "HLP disputes",
    ],
    relatedIncidentsJa: [
      "紛争",
      "テロ",
      "大規模移動・避難",
      "性暴力",
      "子どもの権利侵害",
      "地雷・不発弾",
      "強制立ち退き",
      "住居・土地・財産問題",
    ],
  },
  {
    name: "CCCM",
    nameJa: "キャンプ管理",
    relatedIncidents: [
      "Mass displacement",
      "IDP camp establishment",
      "Conflicts",
      "Sudden-onset disasters",
    ],
    relatedIncidentsJa: [
      "大規模避難",
      "国内避難民キャンプ設置",
      "紛争",
      "突発災害",
    ],
  },
  {
    name: "Shelter",
    nameJa: "シェルター",
    relatedIncidents: [
      "Earthquakes",
      "Floods",
      "Cyclones/Typhoons",
      "Urban fires",
      "Conflicts",
      "Winter emergencies",
    ],
    relatedIncidentsJa: [
      "地震",
      "洪水",
      "サイクロン／台風",
      "都市火災",
      "紛争",
      "冬季危機",
    ],
  },
  {
    name: "Education",
    nameJa: "教育",
    relatedIncidents: [
      "School closures in emergencies",
      "Conflicts",
      "Natural disasters",
      "Displacement",
      "Attacks on education",
    ],
    relatedIncidentsJa: [
      "緊急時の学校閉鎖",
      "紛争",
      "自然災害",
      "避難・移動",
      "教育への攻撃",
    ],
  },
  {
    name: "Food Security",
    nameJa: "食料安全保障",
    relatedIncidents: [
      "Drought",
      "Floods",
      "Conflicts",
      "Economic shocks",
      "Market disruptions",
      "Locust infestations",
      "Famine risk",
    ],
    relatedIncidentsJa: [
      "干ばつ",
      "洪水",
      "紛争",
      "経済ショック",
      "市場機能不全",
      "サバクトビバッタ被害",
      "飢饉リスク",
    ],
  },
  {
    name: "Health",
    nameJa: "保健",
    relatedIncidents: [
      "Disease outbreaks",
      "Pandemics",
      "Mass casualty events",
      "Conflicts",
      "Natural disasters",
      "Health system collapse",
    ],
    relatedIncidentsJa: [
      "感染症の流行",
      "パンデミック",
      "多数傷病者事案",
      "紛争",
      "自然災害",
      "保健医療体制の崩壊",
    ],
  },
  {
    name: "Nutrition",
    nameJa: "栄養",
    relatedIncidents: [
      "Famine/IPC Phase 5",
      "Acute malnutrition",
      "Drought",
      "Food price spikes",
      "Disease outbreaks",
    ],
    relatedIncidentsJa: [
      "飢饉（IPC5）",
      "急性栄養不良",
      "干ばつ",
      "食料価格高騰",
      "感染症流行",
    ],
  },
  {
    name: "WASH",
    nameJa: "水・衛生（WASH）",
    relatedIncidents: [
      "Cholera and waterborne diseases",
      "Floods",
      "Drought/Water scarcity",
      "Displacement settlements",
      "Damage to water systems",
    ],
    relatedIncidentsJa: [
      "コレラ等の水系感染症",
      "洪水",
      "干ばつ・水不足",
      "避難・仮設居住地",
      "給水・下水インフラ被害",
    ],
  },
  {
    name: "Logistics",
    nameJa: "物流",
    relatedIncidents: [
      "Access constraints",
      "Damaged infrastructure",
      "Air/sea/land corridor disruptions",
      "Import restrictions",
      "Insecurity",
    ],
    relatedIncidentsJa: [
      "アクセス制約",
      "インフラ損壊",
      "空路・海路・陸路の寸断",
      "輸入規制",
      "治安悪化",
    ],
  },
  {
    name: "Emergency Telecommunications",
    nameJa: "緊急通信",
    relatedIncidents: [
      "Communications outages",
      "Power failures",
      "Natural disasters",
      "Conflicts",
      "Coordination ICT needs",
    ],
    relatedIncidentsJa: [
      "通信途絶",
      "停電",
      "自然災害",
      "紛争",
      "調整用ICT需要",
    ],
  },
  {
    name: "Early Recovery",
    nameJa: "早期回復",
    relatedIncidents: [
      "Post-disaster recovery",
      "Post-conflict recovery",
      "Debris management",
      "Livelihoods restoration",
      "Governance and essential services",
    ],
    relatedIncidentsJa: [
      "災害後復旧",
      "紛争後復旧",
      "瓦礫撤去",
      "生計回復",
      "統治・基礎サービス再建",
    ],
  },
];

const respondersByIncidentJa = (incidents: string[]): string[] => {
  const respondersSet = new Set<string>();

  incidents.forEach((incident) => {
    const matched = clusters.find((item) =>
      item.relatedIncidentsJa.includes(incident)
    );
    if (matched) {
      respondersList.forEach((responder) => {
        if (responder.field === matched.name) {
          respondersSet.add(responder.name);
        }
      });
    }
  });

  return Array.from(respondersSet);
};

const generateRandomIncidentsFromSeed = (
  seed: number,
  count: number
): string[] => {
  const allIncidents = clusters.flatMap(
    (cluster) => cluster.relatedIncidentsJa
  );
  const uniqueIncidents = Array.from(new Set(allIncidents));

  // シード値を使った疑似乱数生成器
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const result: string[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count && result.length < uniqueIncidents.length; i++) {
    let randomValue = seededRandom(seed + i * 7 + result.length * 13);
    let index = Math.floor(randomValue * uniqueIncidents.length);

    // 重複を避けるため、使用済みのインデックスをスキップ
    while (usedIndices.has(index)) {
      randomValue = seededRandom(seed + i * 7 + result.length * 13 + index);
      index = Math.floor(randomValue * uniqueIncidents.length);
    }

    usedIndices.add(index);
    result.push(uniqueIncidents[index]);
  }

  return result;
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

  const randomIntValueForIndex = useCallback((index: number) => {
    return (index * 37) % 100;
  }, []);

  const regions = useMemo<RegionConfig[]>(
    () => [
      {
        name: "アジア太平洋",
        incident: generateRandomIncidentsFromSeed(
          randomIntValueForIndex(1),
          2
        ).join(", "),
        responders: respondersByIncidentJa(
          generateRandomIncidentsFromSeed(randomIntValueForIndex(1), 1)
        ),
        longitude: 139.6917,
        latitude: 35.6895,
        zoom: calculateZoomLevel(35.6895),
        bearing: 0,
        pitch: 0,
        data: generateRandomData(),
      },
      {
        name: "ヨーロッパ",
        incident: generateRandomIncidentsFromSeed(
          randomIntValueForIndex(2),
          2
        ).join(", "),
        responders: respondersByIncidentJa(
          generateRandomIncidentsFromSeed(randomIntValueForIndex(2), 2)
        ),
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: calculateZoomLevel(48.8566),
        bearing: 0,
        pitch: 0,
        data: generateRandomData(),
      },
      {
        name: "北アメリカ",
        incident: generateRandomIncidentsFromSeed(
          randomIntValueForIndex(3),
          2
        ).join(", "),
        responders: respondersByIncidentJa(
          generateRandomIncidentsFromSeed(randomIntValueForIndex(3), 2)
        ),
        longitude: -74.006,
        latitude: 40.7128,
        zoom: calculateZoomLevel(40.7128),
        bearing: 0,
        pitch: 0,
        data: generateRandomData(),
      },
      {
        name: "南アメリカ",
        incident: generateRandomIncidentsFromSeed(
          randomIntValueForIndex(4),
          2
        ).join(", "),
        responders: respondersByIncidentJa(
          generateRandomIncidentsFromSeed(randomIntValueForIndex(4), 2)
        ),
        longitude: -58.3816,
        latitude: -34.6037,
        zoom: calculateZoomLevel(-34.6037),
        bearing: 0,
        pitch: 0,
        data: generateRandomData(),
      },
      {
        name: "アフリカ",
        incident: generateRandomIncidentsFromSeed(
          randomIntValueForIndex(5),
          2
        ).join(", "),
        responders: respondersByIncidentJa(
          generateRandomIncidentsFromSeed(randomIntValueForIndex(5), 2)
        ),
        longitude: 18.4241,
        latitude: -33.9249,
        zoom: calculateZoomLevel(-33.9249),
        bearing: 0,
        pitch: 0,
        data: generateRandomData(),
      },
      {
        name: "中東",
        incident: generateRandomIncidentsFromSeed(
          randomIntValueForIndex(6),
          2
        ).join(", "),
        responders: respondersByIncidentJa(
          generateRandomIncidentsFromSeed(randomIntValueForIndex(6), 2)
        ),
        longitude: 51.5074,
        latitude: 25.2769,
        zoom: calculateZoomLevel(25.2769),
        bearing: 0,
        pitch: 0,
        data: generateRandomData(),
      },
    ],
    [calculateZoomLevel]
  );

  const mapRefs = useMemo<MutableRefObject<MapRef | null>[]>(
    () =>
      Array.from(
        { length: regions.length },
        () => ({ current: null } as MutableRefObject<MapRef | null>)
      ),
    [regions.length]
  );

  const suppressMoveEventsRef = useRef<boolean[]>(
    Array(regions.length).fill(false)
  );
  const lastSyncTimeRef = useRef<number>(0);
  const isUserDraggingRef = useRef<boolean>(false);
  const [activeMapIndex, setActiveMapIndex] = useState<number>(-1);

  const performSync = useCallback(
    (sourceMapIndex: number, viewState: ViewState) => {
      const sourceRegion = regions[sourceMapIndex];
      if (!sourceRegion) {
        return;
      }

      const longitude = viewState.longitude ?? sourceRegion.longitude;
      const latitude = viewState.latitude ?? sourceRegion.latitude;
      const zoom = viewState.zoom ?? sourceRegion.zoom;
      const bearing = viewState.bearing ?? sourceRegion.bearing ?? 0;
      const pitch = viewState.pitch ?? sourceRegion.pitch ?? 0;

      const lngOffset = longitude - sourceRegion.longitude;
      const latOffset = latitude - sourceRegion.latitude;

      const sourceExpectedZoom = calculateZoomLevel(latitude);
      const zoomDiffFromExpected = zoom - sourceExpectedZoom;

      mapRefs.forEach((mapRef, index) => {
        if (index === sourceMapIndex) {
          return;
        }

        const targetRegion = regions[index];
        const targetMapRef = mapRef.current;
        if (!targetRegion || !targetMapRef) {
          return;
        }

        const mapInstance = targetMapRef.getMap?.();
        if (!mapInstance) {
          return;
        }

        suppressMoveEventsRef.current[index] = true;

        const clearSuppression = () => {
          if (!suppressMoveEventsRef.current[index]) {
            return;
          }
          suppressMoveEventsRef.current[index] = false;
        };

        const fallback = setTimeout(clearSuppression, SYNC_THROTTLE_MS * 4);

        mapInstance.once("moveend", () => {
          clearTimeout(fallback);
          clearSuppression();
        });

        const targetCenterLatitude = Math.max(
          -85,
          Math.min(85, targetRegion.latitude + latOffset)
        );
        const targetCenterLongitudeRaw = targetRegion.longitude + lngOffset;
        const targetCenterLongitude =
          ((((targetCenterLongitudeRaw + 180) % 360) + 360) % 360) - 180;
        const targetExpectedZoom = calculateZoomLevel(targetCenterLatitude);
        const targetZoom = Math.max(
          MINIMUM_ZOOM,
          targetExpectedZoom + zoomDiffFromExpected
        );

        mapInstance.jumpTo({
          center: [targetCenterLongitude, targetCenterLatitude] as [
            number,
            number
          ],
          zoom: targetZoom,
          bearing,
          pitch,
        });
      });
    },
    [calculateZoomLevel, mapRefs, regions]
  );

  const handleMapMove = useCallback(
    (sourceMapIndex: number, event: ViewStateChangeEvent) => {
      if (suppressMoveEventsRef.current[sourceMapIndex]) {
        return;
      }

      if (!isUserDraggingRef.current || activeMapIndex !== sourceMapIndex) {
        return;
      }

      const now = Date.now();
      if (now - lastSyncTimeRef.current < SYNC_THROTTLE_MS) {
        return;
      }

      lastSyncTimeRef.current = now;
      performSync(sourceMapIndex, event.viewState);
    },
    [activeMapIndex, performSync]
  );

  const handleMapMoveStart = useCallback(
    (index: number, event: ViewStateChangeEvent) => {
      if (suppressMoveEventsRef.current[index]) {
        return;
      }

      isUserDraggingRef.current = true;
      setActiveMapIndex(index);
      lastSyncTimeRef.current = Date.now();
      performSync(index, event.viewState);
    },
    [performSync]
  );

  const handleMapMoveEnd = useCallback(
    (index: number, event: ViewStateChangeEvent) => {
      if (suppressMoveEventsRef.current[index]) {
        return;
      }

      performSync(index, event.viewState);
      isUserDraggingRef.current = false;
      setActiveMapIndex(-1);
    },
    [performSync]
  );

  return (
    <main
      style={{
        width: "100vw",
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
            }}
          >
            <div style={{ height: "70%" }}>
              <BaseMap
                id={`map-${index}`}
                mapRef={mapRefs[index]}
                longitude={region.longitude}
                latitude={region.latitude}
                zoom={region.zoom}
                style="/map_styles/dark-matter-gl-style/style.json"
                onMapMoveStart={(event) => handleMapMoveStart(index, event)}
                onMapMove={(event) => handleMapMove(index, event)}
                onMapMoveEnd={(event) => handleMapMoveEnd(index, event)}
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
                  {region.name}
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
                  <strong>インシデント：</strong>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    {region.incident}
                  </span>
                </p>
                <p>
                  <strong>対応組織：</strong>
                  <span
                    style={{
                      fontSize: "0.9em",
                    }}
                  >
                    {region.responders?.join(", ") ?? "なし"}
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
