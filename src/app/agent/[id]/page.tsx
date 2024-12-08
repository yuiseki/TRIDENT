"use client";

import useSWR from "swr";
import { jsonFetcher } from "@/utils/jsonFetcher";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { nextPostJson, nextPostJsonWithCache } from "@/utils/nextPostJson";
import { MapProvider, MapRef } from "react-map-gl/maplibre";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { FeatureCollection } from "geojson";
import { useLocalStorage } from "@/hooks/localStorage";
import * as turf from "@turf/turf";
import osmtogeojson from "osmtogeojson";
import { getOverpassResponseJsonWithCache } from "@/lib/osm/getOverpass";
import { BaseMap } from "@/components/BaseMap";
import { GeoJsonToSourceLayer } from "@/components/GeoJsonToSourceLayer";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const formatDate = (date: Date) => {
  const userLang = navigator.language;
  console.log(userLang);
  switch (userLang) {
    case "ja-JP":
      return `${date.getFullYear()}年${
        date.getMonth() + 1
      }月${date.getDate()}日`;
    default:
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
};

type ConcernEvent = {
  url: string;
  description: string;
  title: string;
  pubDate: string;
  currentDate: string;
  whatHappenings: string[];
  displayMaps: string[];
};

export default function Page() {
  // Next.js routerからidを得る
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const mapRef = useRef<MapRef | null>(null);
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{ id: string; style: TridentMapsStyle; geojson: FeatureCollection }>
  >([]);
  const [mapTitle, setMapTitle] = useState<string | undefined>(undefined);
  const [concern, setConcern] = useState<ConcernEvent | undefined>(undefined);
  const [mapping, setMapping] = useState(true);

  // base maps
  const [mapStyleJsonUrl, setMapStyleJsonUrl] = useLocalStorage<string>(
    "trident-selected-map-style-json-url",
    "/map_styles/fiord-color-gl-style/style.json"
  );

  const { data: newsData, error: newsDataError } = useSWR<Array<ConcernEvent>>(
    "/data/www3.nhk.or.jp/concerns/latest_concerns.json",
    jsonFetcher
  );

  const { data: disasterData, error: disasterDataError } = useSWR<
    Array<ConcernEvent>
  >("/data/api.reliefweb.int/concerns/latest_concerns.json", jsonFetcher);

  const onSelectMapStyleJsonUrl = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMapStyleJsonUrl(e.target.value);
    },
    [setMapStyleJsonUrl]
  );

  useEffect(() => {
    // idがない場合は何もしない
    if (!id) {
      return;
    }
    // dataがない場合は何もしない
    if (!newsData || !disasterData) {
      return;
    }
    // idに該当するconcernを探し、newConcernに格納する
    const data = [...newsData, ...disasterData];
    const newConcern = data.find((concern) =>
      concern.url.includes(id as string)
    );
    if (!newConcern) {
      return;
    }
    // concernが変わったら、stateを更新する
    setConcern(newConcern);
  }, [disasterData, id, newsData]);

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
          { padding: 100, duration: 1000 }
        );
      } catch (error) {
        console.error(error);
      }
    }, 500);
  }, [geojsonWithStyleList]);

  const whenAndWhatHappens = useMemo(() => {
    // concernがない場合は何もしない
    if (!concern) {
      return "";
    }
    const currentDate = new Date(concern.currentDate);
    const whenHappens = `${formatDate(currentDate)}`;
    return whenHappens;
  }, [concern]);

  useEffect(() => {
    const f = async () => {
      const pastMessages = concern?.displayMaps.map((displayMap) => {
        const cleanedDisplayMap = displayMap
          .replaceAll("北東部", "")
          .replaceAll("東部", "")
          .replaceAll("西部", "")
          .replaceAll("山岳地帯の", "");
        return {
          type: "constructor",
          id: ["langchain", "schema", "HumanMessage"],
          kwargs: {
            content: cleanedDisplayMap,
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
      console.log("styles", styles);

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
  }, [concern]);

  // concernがない場合は何もしない
  if (!concern) {
    return <div></div>;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: "40vw",
          padding: "1rem",
          overflowY: "scroll",
        }}
      >
        <Link href="/agent">&lt; /agent</Link>
        <h2 style={{ fontSize: "2em", padding: "0.2em 0" }}>
          {whenAndWhatHappens}
        </h2>
        <div>
          {concern.whatHappenings.map((line, idx) => {
            return (
              <h4
                key={idx}
                style={{ fontSize: "1.5em", paddingBottom: "0.4em" }}
              >
                {line}
              </h4>
            );
          })}
        </div>
        <p>
          <ul
            style={{
              marginTop: "0.5rem",
              marginLeft: "1.5rem",
            }}
          >
            {concern.displayMaps.map((req, idx) => {
              return <li key={`${concern.url}-req-${idx}`}>{req}</li>;
            })}
            {mapping && <li>loading...</li>}
          </ul>
        </p>
      </div>
      <div className="tridentInlineMapWrap" style={{ width: "60vw" }}>
        <MapProvider>
          <BaseMap
            id="mainMap"
            mapRef={mapRef}
            longitude={0}
            latitude={0}
            zoom={1}
            style={mapStyleJsonUrl}
            enableInteractions={true}
          >
            {geojsonWithStyleList &&
              geojsonWithStyleList.map((geojsonWithStyle, idx) => {
                console.log(geojsonWithStyle);
                return (
                  <GeoJsonToSourceLayer
                    key={`${concern.url}-geojson-${idx}`}
                    geojson={geojsonWithStyle.geojson}
                    style={geojsonWithStyle.style}
                  />
                );
              })}
          </BaseMap>
        </MapProvider>
      </div>
    </div>
  );
}
