"use client";

import { BaseMap } from "@/components/BaseMap";
import { DialogueElementItem } from "@/components/DialogueElementItem";
import { GeoJsonToMarkers } from "@/components/GeoJsonToMarkers";
import { TextInput } from "@/components/TextInput";
import { DialogueElement } from "@/types/DialogueElement";
import { nextPostJson } from "@/utils/nextPostJson";
import { scrollToBottom } from "@/utils/scrollToBottom";
import { sleep } from "@/utils/sleep";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapProvider, MapRef } from "react-map-gl";
import { FeatureCollection } from "geojson";
import { getOverpassResponse } from "@/utils/getOverpassResponse";
import osmtogeojson from "osmtogeojson";
import * as turf from "@turf/turf";
import { TridentMapsStyle } from "@/types/TridentMaps";
import Head from "next/head";

const greetings = `Hello! I'm TRIDENT GeoAI, interactive geospatial situation awareness empowerment system. Could you indicate me the areas and themes you want to see as the map?`;

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState(greetings);
  const [pastMessages, setPastMessages] = useState<
    { messages: Array<{ text: string }> } | undefined
  >();
  const mapRef = useRef<MapRef | null>(null);
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{ id: string; style: TridentMapsStyle; geojson: FeatureCollection }>
  >([]);

  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([
    {
      who: "assistant",
      text: "",
    },
  ]);

  const [initialized, setInitialized] = useState(false);
  const [lazyInserting, setLazyInserting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [mapping, setMapping] = useState(false);

  const initializer = useCallback(() => {
    if (initialized) {
      return;
    }
    setResponding(true);
    const outputtingTextLength =
      dialogueList[dialogueList.length - 1].text.length;
    if (outputtingTextLength < outputText.length) {
      const newDialogueList = [
        {
          who: "assistant",
          text: outputText.slice(0, outputtingTextLength + 1),
        },
      ];
      setDialogueList(newDialogueList);
    } else {
      setOutputText("");
      setResponding(false);
      setInitialized(true);
      // TODO: focus TextInput when initialize finished
    }
  }, [dialogueList, initialized, outputText]);

  useEffect(() => {
    setTimeout(initializer, 25);
  }, [initializer]);

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
        setOutputText(newDialogueElement.text);
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
            last.text = outputText.slice(0, last.text.length + 1);
            scrollToBottom();
            if (outputText.length === last.text.length) {
              setLazyInserting(false);
              setLazyInsertingInitialized(false);
              setOutputText("");
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
  }, [intervalId, lazyInserting, lazyInsertingInitialized, outputText]);

  const onSubmit = useCallback(async () => {
    const newInputText = inputText.trim();
    setInputText("");

    insertNewDialogue({ who: "user", text: newInputText });

    await sleep(200);
    scrollToBottom();
    setResponding(true);

    const surfaceRes = await nextPostJson("/api/geoai/surface", {
      query: newInputText,
      pastMessages: pastMessages ? JSON.stringify(pastMessages) : undefined,
    });
    const surfaceResJson: {
      surface: string;
      history: { messages: Array<{ text: string }> };
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
    });
    const innerResJson = await innerRes.json();
    setResponding(false);
    if (!innerResJson.inner.toLowerCase().includes("no map")) {
      setGeojsonWithStyleList([]);
      setMapping(true);
      const styles: {
        [key: string]: {
          emoji?: string;
          color?: string;
        };
      } = {};
      const lines = innerResJson.inner.split("\n");
      lines.map(async (line: string, idx: number) => {
        console.log(line);
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

      const linesWithArea = lines.filter((line: string) =>
        line.includes("Area")
      );
      linesWithArea.map(async (line: string, idx: number) => {
        let style = {};
        Object.keys(styles).map((concern) => {
          if (line.includes(concern)) {
            style = styles[concern];
          }
        });
        setMapping(true);
        const deepRes = await nextPostJson("/api/geoai/deep", {
          query: line,
        });
        const deepResJson = await deepRes.json();
        console.log(deepResJson.deep);
        if (deepResJson.deep.toLowerCase().includes("no valid")) {
          return;
        }
        const overpassQuery = deepResJson.deep.split("```")[1];
        const handleOverpassResponse = async (
          overpassResponse: Response,
          retry: boolean
        ) => {
          const overpassResponseJson = await overpassResponse.json();
          setMapping(false);
          const newGeojson = osmtogeojson(overpassResponseJson);
          if (newGeojson.features.length !== 0) {
            setGeojsonWithStyleList((prev) => {
              return [
                ...prev,
                { id: idx.toString(), style: style, geojson: newGeojson },
              ];
            });
            if (idx === linesWithArea.length - 1) {
              console.log("Finish!!!!!");
              insertNewDialogue(
                {
                  who: "assistant",
                  text: "Mapping has been completed. Do you have any other requests?",
                },
                true
              );
            }
          } else {
            if (retry) {
              getOverpassResponse(overpassQuery).then((overpassResponse) => {
                handleOverpassResponse(overpassResponse, false);
              });
            }
          }
        };
        console.log(overpassQuery);
        getOverpassResponse(
          overpassQuery.replace('["name"', '["name:en"')
        ).then((overpassResponse) => {
          handleOverpassResponse(overpassResponse, true);
        });
      });
    } else {
      setResponding(false);
      setMapping(false);
    }
  }, [inputText, insertNewDialogue, pastMessages]);

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
      } catch (e) {
        console.error(e);
      }
    }, 500);
  }, [geojsonWithStyleList]);

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
      <main style={{ width: "100vw", height: "100vh" }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "40%",
            height: "100vh",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 158, 219, 1)",
              backgroundImage: 'url("/Flag_of_the_United_Nations.svg")',
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              zIndex: 9,
            }}
          ></div>
          <div
            style={{
              position: "relative",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 10,
            }}
          ></div>
        </div>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            margin: "0px 0px 5vh",
            width: "40%",
            height: "100vh",
            overflowY: "scroll",
          }}
        >
          <div
            style={{
              width: "95%",
              margin: "0 auto 15vh",
              zIndex: 1000,
              background: "transparent",
            }}
          >
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
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: "20px",
            height: "8vh",
            width: "40%",
            margin: "auto",
          }}
        >
          <div
            style={{
              width: "95%",
              margin: "auto",
            }}
          >
            <TextInput
              disabled={false}
              placeholder="..."
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "40%",
            margin: "0px",
            width: "60%",
            height: "100%",
            zIndex: 1000,
          }}
        >
          <MapProvider>
            <BaseMap
              id="mainMap"
              mapRef={mapRef}
              longitude={0}
              latitude={0}
              zoom={1}
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
