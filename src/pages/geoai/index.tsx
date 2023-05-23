"use client";

import { BaseMap } from "@/components/BaseMap";
import { DialogueElementItem } from "@/components/DialogueElementItem";
import { GeoJsonToMarkers } from "@/components/GeoJsonToMarkers";
import { TextInput } from "@/components/TextInput";
import { DialogueElement } from "@/types/DialogueElement";
import { nextPostJson, nextPostJsonWithCache } from "@/utils/nextPostJson";
import { sleep } from "@/utils/sleep";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapProvider, MapRef } from "react-map-gl";
import { FeatureCollection } from "geojson";
import { getOverpassResponseJsonWithCache } from "@/utils/getOverpassResponse";
import osmtogeojson from "osmtogeojson";
import * as turf from "@turf/turf";
import { TridentMapsStyle } from "@/types/TridentMaps";
import Head from "next/head";
import { useLocalStorage } from "@/hooks/localStorage";

const greetings = `Hello! I'm TRIDENT GeoAI, interactive geospatial situation awareness empowerment system. Could you indicate me the areas and themes you want to see as the map?`;

export default function Home() {
  // input ref and state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputText, setInputText] = useState("");

  // maps ref and state
  const mapRef = useRef<MapRef | null>(null);
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{ id: string; style: TridentMapsStyle; geojson: FeatureCollection }>
  >([]);
  // base maps
  const [mapStyleJsonUrl, setMapStyleJsonUrl] = useLocalStorage<string>(
    "trident-geoai-selected-map-style-json-url",
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

  // dialogue ref and state
  const dialogueRef = useRef<HTMLDivElement | null>(null);
  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([]);
  const [lazyInserting, setLazyInserting] = useState(false);
  const [insertingText, setInsertingText] = useState(greetings);
  const scrollToBottom = useCallback(async () => {
    await sleep(100);
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, []);
  const insertNewDialogue = useCallback(
    (newDialogueElement: DialogueElement, lazy?: boolean) => {
      if (!lazy) {
        setDialogueList((prev) => {
          return [...prev, newDialogueElement];
        });
      } else {
        const lazyNewDialogueElement = {
          ...newDialogueElement,
          text: "",
        };
        setDialogueList((prev) => {
          return [...prev, lazyNewDialogueElement];
        });
        setInsertingText(newDialogueElement.text);
        setLazyInserting(true);
      }
    },
    []
  );
  const [lazyInsertingInitialized, setLazyInsertingInitialized] =
    useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();
  useEffect(() => {
    if (lazyInserting) {
      if (!lazyInsertingInitialized) {
        const newIntervalId = setInterval(() => {
          setDialogueList((prev) => {
            const last = prev[prev.length - 1];
            last.text = insertingText.slice(0, last.text.length + 1);
            scrollToBottom();
            if (insertingText.length === last.text.length) {
              setLazyInserting(false);
              setLazyInsertingInitialized(false);
              setInsertingText("");
              setResponding(false);
            }
            return [...prev.slice(0, prev.length - 1), last];
          });
        }, 50);
        setIntervalId(newIntervalId);
        setLazyInsertingInitialized(true);
      }
    } else {
      clearInterval(intervalId);
      setIntervalId(undefined);
    }
    return () => {
      if (!lazyInserting) {
        clearInterval(intervalId);
        setIntervalId(undefined);
      }
    };
  }, [
    intervalId,
    lazyInserting,
    lazyInsertingInitialized,
    insertingText,
    scrollToBottom,
  ]);

  // communication state
  const [responding, setResponding] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [pastMessages, setPastMessages] = useState<
    { messages: Array<any> } | undefined
  >();
  const onSubmit = useCallback(async () => {
    const newInputText = inputText.trim();
    setInputText("");
    setResponding(true);

    insertNewDialogue({ who: "user", text: newInputText });

    await sleep(200);
    scrollToBottom();

    const surfaceRes = await nextPostJson("/api/geoai/surface", {
      query: newInputText,
      pastMessages: pastMessages ? JSON.stringify(pastMessages) : undefined,
      bounds: JSON.stringify(mapRef.current?.getBounds()),
      center: JSON.stringify(mapRef.current?.getCenter()),
    });
    const surfaceResJson: {
      surface: string;
      history: { messages: Array<any> };
    } = await surfaceRes.json();
    setPastMessages(surfaceResJson.history);
    insertNewDialogue(
      {
        who: "assistant",
        text: surfaceResJson.surface,
      },
      true
    );
    setMapping(true);
    setResponding(true);
    const innerRes = await nextPostJson("/api/geoai/inner", {
      pastMessages: JSON.stringify(surfaceResJson.history),
      bounds: JSON.stringify(mapRef.current?.getBounds()),
      center: JSON.stringify(mapRef.current?.getCenter()),
    });
    const innerResJson = await innerRes.json();
    setResponding(false);
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
        const color = line.split(":")[1].split(",")[1];
        if (styles[concern] === undefined) {
          styles[concern] = {};
        }
        styles[concern].color = color;
      }
    });

    // determine confirm message
    const linesWithConfirm = lines.filter((line: string) =>
      line.includes("ConfirmHelpful:")
    );

    const linesWithArea = lines.filter((line: string) =>
      line.includes("Area:")
    );
    const linesWithAreaWithConcern = lines.filter((line: string) =>
      line.includes("AreaWithConcern:")
    );

    linesWithArea.map(async (line: string, idx: number) => {
      const areaName = line.split(":")[1];
      const areaRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${areaName}&format=json&limit=5`
      );
      const areasJson: Array<{ osm_type: string; osm_id: string }> =
        await areaRes.json();
      let osm_id: string;
      let areaOverpassQuery;
      const areasNodes = areasJson.filter((area) => {
        return area.osm_type === "node";
      });
      if (0 < areasNodes.length) {
        osm_id = areasNodes[0].osm_id;
        areaOverpassQuery = `
[out:json][timeout:30000];
node(id:${osm_id});
out geom;
        `;
      }
      const areasRelations = areasJson.filter((area) => {
        return area.osm_type === "relation";
      });
      if (0 < areasRelations.length) {
        osm_id = areasRelations[0].osm_id;
        areaOverpassQuery = `
[out:json][timeout:30000];
relation(id:${osm_id});
out geom;
        `;
      }
      if (!areaOverpassQuery) {
        return;
      }
      const areaOverpassResponseJson = await getOverpassResponseJsonWithCache(
        areaOverpassQuery
      );
      try {
        const newAreaGeojson = osmtogeojson(areaOverpassResponseJson);
        console.log(newAreaGeojson);
        setGeojsonWithStyleList((prev) => {
          return [
            ...prev,
            { id: osm_id, style: { emoji: "🚩" }, geojson: newAreaGeojson },
          ];
        });
        if (
          linesWithAreaWithConcern.length === 0 &&
          idx === linesWithArea.length - 1
        ) {
          console.log("Finish!!!!!");
          insertNewDialogue(
            {
              who: "assistant",
              text:
                linesWithConfirm.length > 0
                  ? linesWithConfirm[0].split(":")[1]
                  : "Mapping has been completed. Have we been helpful to you? Do you have any other requests",
            },
            true
          );
          setMapping(false);
        }
      } catch (error) {
        console.error(error);
      }
    });

    linesWithAreaWithConcern.map(async (line: string, idx: number) => {
      let style = {};
      Object.keys(styles).map((concern) => {
        if (line.includes(concern)) {
          style = styles[concern];
        }
      });
      setMapping(true);
      const deepResJson = await nextPostJsonWithCache("/api/geoai/deep", {
        query: line,
      });
      console.log("deep: ", deepResJson.deep);
      if (deepResJson.deep.toLowerCase().includes("no valid")) {
        setMapping(false);
        return;
      }
      const overpassQuery = deepResJson.deep.split("```")[1];
      console.log(overpassQuery);

      const handleOverpassResponseJson = async (
        overpassResponseJson: any,
        retry: boolean
      ) => {
        const newGeojson = osmtogeojson(overpassResponseJson);
        if (newGeojson.features.length !== 0) {
          setGeojsonWithStyleList((prev) => {
            return [
              ...prev,
              { id: idx.toString(), style: style, geojson: newGeojson },
            ];
          });
          if (idx === linesWithAreaWithConcern.length - 1) {
            console.log("Finish!!!!!");
            insertNewDialogue(
              {
                who: "assistant",
                text:
                  linesWithConfirm.length > 0
                    ? linesWithConfirm[0].split(":")[1]
                    : "Mapping has been completed. Have we been helpful to you? Do you have any other requests",
              },
              true
            );
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
  }, [inputText, insertNewDialogue, pastMessages, scrollToBottom]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      insertNewDialogue(
        {
          who: "assistant",
          text: greetings,
        },
        false
      );
    } else {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [mounted, insertNewDialogue]);
  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>
          TRIDENT GeoAI - Interactive geospatial situation awareness empowerment
          system
        </title>
        <meta
          name="description"
          content="TRIDENT GeoAI - Interactive geospatial situation awareness empowerment system"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="https://i.gyazo.com/36f5e676caec5f5e746a95054a46504f.png"
        />
      </Head>
      <main className="geoaiMain">
        <div className="geoAIBackgroundWrap">
          <div className="geoAIBackgroundFlag"></div>
          <div className="geoAIBackgroundOverlay"></div>
        </div>
        <div className="geoAIDialogueOuterWrap" ref={dialogueRef}>
          <div className="geoAIDialogueInnerWrap">
            {dialogueList.map((dialogueElement, dialogueIndex) => {
              return (
                <div key={dialogueIndex}>
                  <DialogueElementItem
                    prevDialogueElement={
                      0 < dialogueIndex
                        ? dialogueList[dialogueIndex - 1]
                        : undefined
                    }
                    dialogueElement={dialogueElement}
                    dialogueIndex={dialogueIndex}
                    isResponding={
                      (responding || lazyInserting || mapping) &&
                      dialogueIndex === dialogueList.length - 1
                    }
                    mode="geoai"
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="geoAIInputOuterWrap">
          <div className="geoAIInputInnerWrap">
            <TextInput
              textareaRef={textareaRef}
              disabled={responding || lazyInserting || mapping}
              placeholder={
                responding || lazyInserting || mapping
                  ? "..."
                  : "Show sushi shops in Taito-ku, Tokyo"
              }
              inputText={inputText}
              setInputText={setInputText}
              onSubmit={onSubmit}
            />
          </div>
          <div
            style={{
              color: "white",
              width: "100%",
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            TRIDENT may produce inaccurate information.
          </div>
        </div>
        <div className="geoAIMapWrap">
          <select
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              zIndex: 10000,
              height: "1.8em",
              maxWidth: "250px",
              textOverflow: "ellipsis",
              fontSize: "0.8em",
              fontFamily: "sans-serif, emoji",
            }}
            value={mapStyleJsonUrl}
            onChange={onSelectMapStyleJsonUrl}
          >
            <option value={"/map_styles/fiord-color-gl-style/style.json"}>
              🗺 OSM Fiord color (vector)
            </option>
            <option
              value={
                "https://tile.openstreetmap.jp/styles/osm-bright/style.json"
              }
            >
              🗺 OSM JP bright (vector)
            </option>
            <option value={"/map_styles/osm-hot/style.json"}>
              🗺 OSM HOT (raster)
            </option>
            <option value={"/map_styles/arcgis-world-imagery/style.json"}>
              🛰 ArcGIS World Imagery (raster)
            </option>
          </select>
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
                geojsonWithStyleList.map((geojsonWithStyle) => {
                  return (
                    <GeoJsonToMarkers
                      key={geojsonWithStyle.id}
                      geojson={geojsonWithStyle.geojson}
                      style={geojsonWithStyle.style}
                    />
                  );
                })}
            </BaseMap>
          </MapProvider>
        </div>
      </main>
    </>
  );
}
