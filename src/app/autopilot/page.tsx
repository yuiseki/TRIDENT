"use client";

import useSWR from "swr";
import { jsonFetcher } from "@/utils/jsonFetcher";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { nextPostJson, nextPostJsonWithCache } from "@/utils/nextPostJson";
import { MapProvider, MapRef } from "react-map-gl";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { FeatureCollection } from "geojson";
import { useLocalStorage } from "@/hooks/localStorage";
import * as turf from "@turf/turf";
import osmtogeojson from "osmtogeojson";
import { getOverpassResponseJsonWithCache } from "@/utils/getOverpassResponse";
import { BaseMap } from "@/components/BaseMap";
import { GeoJsonToMarkers } from "@/components/GeoJsonToMarkers";

const formatDate = (date: Date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

type ConcernEvent = {
  link: string;
  description: string;
  title: string;
  pubDate: string;
  currentDate: string;
  where: string;
  whatHappenings: string[];
  requestToDisplayMaps: string[];
};

const NewsWithMap: React.FC<{ concern: ConcernEvent }> = ({ concern }) => {
  const mapRef = useRef<MapRef | null>(null);
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{ id: string; style: TridentMapsStyle; geojson: FeatureCollection }>
  >([]);
  const [mapTitle, setMapTitle] = useState<string | undefined>(undefined);

  // base maps
  const [mapStyleJsonUrl, setMapStyleJsonUrl] = useLocalStorage<string>(
    "trident-selected-map-style-json-url",
    "/map_styles/fiord-color-gl-style/style.json"
  );
  const onSelectMapStyleJsonUrl = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMapStyleJsonUrl(e.target.value);
    },
    [setMapStyleJsonUrl]
  );

  useEffect(() => {
    setTimeout(() => {
      if (!mapRef || !mapRef.current) return;
      if (geojsonWithStyleList.length === 0) return;
      try {
        console.log(geojsonWithStyleList);
        const everything: FeatureCollection = {
          type: "FeatureCollection",
          features: geojsonWithStyleList
            .map((item) => item.geojson.features)
            .flat(),
        };
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(everything);
        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 40, duration: 1000 }
        );
      } catch (error) {
        console.error(error);
      }
    }, 500);
  }, [geojsonWithStyleList]);

  const [responding, setResponding] = useState(false);
  const [mapping, setMapping] = useState(false);

  const currentDate = new Date(concern.currentDate);
  const whenHappens = `${formatDate(currentDate)}、`;
  const whereHappens = `${concern.where}。`;
  const whereAndWhenHappens = whenHappens + whereHappens;
  const whatHappens = concern.whatHappenings;
  const displayMaps = concern.requestToDisplayMaps;

  useEffect(() => {
    const f = async () => {
      const pastMessages = displayMaps.map((requestToDisplayMap) => {
        return {
          type: "constructor",
          id: ["langchain", "schema", "HumanMessage"],
          kwargs: {
            content: requestToDisplayMap,
          },
        } as {
          type: string;
          id: string[];
          kwargs: { content: string };
        };
      });
      console.log("pastMessages", pastMessages);

      // call inner layer
      const innerRes = await nextPostJson("/api/ai/inner", {
        pastMessages: JSON.stringify(pastMessages),
      });
      const innerResJson = await innerRes.json();
      if (innerResJson.inner === undefined) {
        setGeojsonWithStyleList([]);
        setMapping(false);
        return;
      }
      if (innerResJson.inner.toLowerCase().includes("no map")) {
        setResponding(false);
        setMapping(false);
        return;
      }

      setGeojsonWithStyleList([]);
      setMapping(true);

      // determine style of concerns
      const styles: {
        [key: string]: {
          emoji?: string;
          color?: string;
        };
      } = {};
      const lines = innerResJson.inner.split("\n");
      lines.map(async (line: string, idx: number) => {
        console.log(`inner line ${idx}:`, line);
        if (line.includes("Title")) {
          const newMapTitle = line.split(":")[1];
          setMapTitle(newMapTitle);
        }
        if (line.includes("Emoji")) {
          const concern = line.split(":")[1].split(",")[0];
          const emoji = line.split(":")[1].split(",")[1];
          if (styles[concern] === undefined) {
            styles[concern] = {};
          }
          styles[concern].emoji = emoji;
        }
        if (line.includes("Color")) {
          const concern = line.split(":")[1].split(",")[0];
          const color = line.split(":")[1].split(", ")[1];
          if (styles[concern] === undefined) {
            styles[concern] = {};
          }
          styles[concern].color = color;
        }
      });

      // extract correct lines
      const linesWithAreaAndOrConcern = lines.filter((line: string) =>
        line.includes("Area")
      );

      linesWithAreaAndOrConcern.map(async (line: string, idx: number) => {
        let style = {};
        Object.keys(styles).map((concern) => {
          if (line.includes(concern)) {
            style = styles[concern];
          }
        });
        setMapping(true);

        // call deep layer
        const deepResJson = await nextPostJsonWithCache("/api/ai/deep", {
          query: line,
        });
        if (deepResJson.deep.toLowerCase().includes("no valid")) {
          setMapping(false);
          return;
        }
        const overpassQuery = deepResJson.deep.split("```")[1];

        const handleOverpassResponseJson = async (
          overpassResponseJson: any,
          retry: boolean
        ) => {
          const newGeojson = osmtogeojson(overpassResponseJson);
          console.log("newGeojson", newGeojson);
          if (newGeojson.features.length !== 0) {
            setGeojsonWithStyleList((prev) => {
              return [
                ...prev,
                { id: idx.toString(), style: style, geojson: newGeojson },
              ];
            });
            if (idx === linesWithAreaAndOrConcern.length - 1) {
              console.log("Finish!!!!!");

              setMapping(false);
            }
          } else {
            if (retry) {
              getOverpassResponseJsonWithCache(overpassQuery).then(
                (overpassResponseJson) => {
                  handleOverpassResponseJson(overpassResponseJson, false);
                }
              );
            }
          }
        };
        getOverpassResponseJsonWithCache(
          overpassQuery.replaceAll('["name"', '["name:en"')
        ).then((overpassResponseJson) => {
          handleOverpassResponseJson(overpassResponseJson, true);
        });
      });
    };
    f();
  }, [displayMaps]);

  return (
    <div
      key={concern.title}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          height: "20vh",
        }}
      >
        <h2>{whereAndWhenHappens}</h2>
        <h3>{whatHappens}</h3>
      </div>
      <div className="tridentInlineMapWrap" style={{ height: "75vh" }}>
        <MapProvider>
          <BaseMap
            id="mainMap"
            mapRef={mapRef}
            longitude={0}
            latitude={0}
            zoom={1}
            style={mapStyleJsonUrl}
          >
            {geojsonWithStyleList &&
              geojsonWithStyleList.map((geojsonWithStyle, idx) => {
                //console.log(geojsonWithStyle);
                return (
                  <GeoJsonToMarkers
                    key={idx}
                    geojson={geojsonWithStyle.geojson}
                    style={geojsonWithStyle.style}
                  />
                );
              })}
          </BaseMap>
        </MapProvider>
      </div>
      <div style={{ height: "5vh", display: "flex", justifyContent: "center", alignContent: "center"}}>
        <div style={{height: "5vh", lineHeight: "5vh"}}>
        ↓
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [sortedConcerns, setSortedConcerns] = useState<
    Array<ConcernEvent> | undefined
  >(undefined);

  const { data, error } = useSWR<Array<ConcernEvent>>(
    "/data/www3.nhk.or.jp/concerns/latest_concerns.json",
    jsonFetcher
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const newSortedConcerns = data
      .filter((v) => v)
      .filter((element, index: number, self) => {
        return self.findIndex((e) => e.link === element.link) === index;
      })
      .filter((concern) => {
        if (
          concern.currentDate === null ||
          concern.currentDate === "Unknown" ||
          concern.currentDate === "unknown" ||
          concern.where === "Unknown" ||
          concern.where === "unknown"
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        return (
          new Date(b.currentDate).getTime() - new Date(a.currentDate).getTime()
        );
      });
    setSortedConcerns(newSortedConcerns);
  }, [data]);

  const getConcerns = useCallback(
    (start: Date, end: Date) => {
      if (!sortedConcerns) {
        return;
      }
      const filteredConcerns = sortedConcerns.filter((event) => {
        return (
          start.getTime() <= new Date(event.currentDate).getTime() &&
          new Date(event.currentDate).getTime() <= end.getTime()
        );
      });
      return filteredConcerns;
    },
    [sortedConcerns]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      {Array.from({ length: 1 }, (_, i) => i + 1).map((idx) => {
        const now = new Date();
        // 今日が何曜日かを取得する
        const dayOfWeek = now.getDay();
        // 日曜日を基準として、startDateとendDateは、1週間ごとに設定する
        // ただし、今日が日曜日の場合は、startDateとendDateは、今日から1週間前とする
        const startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7 * (idx - 1) - dayOfWeek
        );

        const endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7 * (idx - 1) - dayOfWeek + 6
        );

        const weeklyConcerns = getConcerns(startDate, endDate);
        if (!weeklyConcerns) return null;
        if (weeklyConcerns.length === 0) return null;
        return (
          <>
            {weeklyConcerns &&
              weeklyConcerns.slice(0, 1).map((concern) => {
                return <NewsWithMap key={concern.link} concern={concern} />;
              })}
          </>
        );
      })}
    </div>
  );
}
