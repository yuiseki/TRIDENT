"use client";

import { BaseMap } from "@/components/BaseMap";
import { DialogueElementView } from "@/components/DialogueElementView";
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
import { useLocalStorage } from "@/hooks/localStorage";
import { FloatingChatButton } from "@/components/FloatingActionButton";
import { MapStyleSelector } from "@/components/MapStyleSelector";
import { fitBoundsToGeoJson } from "@/utils/map/fitBoundsToGeoJson";
import { parseInnerResJson } from "@/utils/trident/parseInnerResJson";

const greetings = `Hello! I'm TRIDENT, interactive Smart Maps assistant. Could you indicate me the areas and themes you want to see as the map?`;

export default function Home() {
  // input ref and state
  const [inputText, setInputText] = useState("");

  // dialogue ref and state
  const dialogueRef = useRef<HTMLDivElement | null>(null);
  const dialogueEndRef = useRef<HTMLDivElement | null>(null);
  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([]);
  const [lazyInserting, setLazyInserting] = useState(false);
  const [insertingText, setInsertingText] = useState(greetings);

  const scrollToBottom = useCallback(async () => {
    await sleep(50);
    if (dialogueEndRef.current) {
      dialogueEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  // floating chat button state
  const [showingFloatingChat, setShowingFloatingChat] = useState(true);
  const onChangeFloatingChatButton = useCallback(
    (showing: boolean) => {
      setShowingFloatingChat(showing);
      if (showing) {
        scrollToBottom();
      }
    },
    [scrollToBottom]
  );

  // maps ref and state
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

  // fit bounds to all geojson in the geojsonWithStyleList
  useEffect(() => {
    setTimeout(() => {
      if (!mapRef || !mapRef.current) return;
      if (geojsonWithStyleList.length === 0) return;

      try {
        // everything - all geojson in the geojsonWithStyleList
        const everything: FeatureCollection = {
          type: "FeatureCollection",
          features: geojsonWithStyleList
            .map((item) => item.geojson.features)
            .flat(),
        };

        // padding of the map
        let padding = {
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
        };

        // if floating chat is showing, add more padding
        if (showingFloatingChat) {
          const windowWidth = window.innerWidth;
          // if the window is big like desktop, add little padding to left and bottom
          // if the window is small like mobile, add more padding to bottom
          if (windowWidth > 600) {
            padding = {
              top: 40,
              left: 40,
              right: 120,
              bottom: 120,
            };
          } else {
            padding = {
              top: 40,
              left: 40,
              right: 40,
              bottom: 400,
            };
          }
        }

        fitBoundsToGeoJson(mapRef, everything, padding);
      } catch (error) {
        console.error(error);
      }
    }, 500);
  }, [geojsonWithStyleList, showingFloatingChat]);

  const insertNewDialogue = useCallback(
    (newDialogueElement: DialogueElement, lazy?: boolean) => {
      if (!lazy) {
        setDialogueList((prev) => {
          return [...prev, newDialogueElement];
        });
        scrollToBottom();
        setResponding(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const [pastMessages, setPastMessages] = useState<Array<any> | undefined>();
  const onSubmit = useCallback(async () => {
    const newInputText = inputText.trim();
    setInputText("");
    setResponding(true);

    insertNewDialogue({ who: "user", text: newInputText });

    await sleep(200);
    scrollToBottom();

    const surfaceRes = await nextPostJson("/api/ai/surface", {
      query: newInputText,
      pastMessages: pastMessages ? JSON.stringify(pastMessages) : undefined,
      bounds: JSON.stringify(mapRef.current?.getBounds()),
      center: JSON.stringify(mapRef.current?.getCenter()),
    });
    const surfaceResJson: {
      surface: string;
      history: Array<any>;
    } = await surfaceRes.json();
    console.log(surfaceResJson);
    setPastMessages((prev) => {
      return [prev, surfaceResJson.history].flat().filter((v) => v);
    });
    insertNewDialogue(
      {
        who: "assistant",
        text: surfaceResJson.surface,
      },
      false
    );
    setMapping(true);
    setResponding(true);
    const innerRes = await nextPostJson("/api/ai/inner", {
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

    const {
      styles,
      linesWithTitle,
      linesWithConfirm,
      linesWithAreaAndOrConcern,
    } = parseInnerResJson(innerResJson);

    if (linesWithTitle.length > 0) {
      setMapTitle(linesWithTitle[0].split(":")[1]);
    }

    linesWithAreaAndOrConcern.map(async (line: string, idx: number) => {
      let style = {};
      Object.keys(styles).map((concern) => {
        if (line.includes(concern)) {
          style = styles[concern];
        }
      });
      setMapping(true);
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
        if (newGeojson.features.length !== 0) {
          setGeojsonWithStyleList((prev) => {
            return [
              ...prev,
              { id: idx.toString(), style: style, geojson: newGeojson },
            ];
          });
          if (idx === linesWithAreaAndOrConcern.length - 1) {
            console.log("Finish!!!!!");
            insertNewDialogue(
              {
                who: "assistant",
                text:
                  linesWithConfirm.length > 0
                    ? linesWithConfirm[0].split(":")[1]
                    : "Mapping has been completed. Have we been helpful to you? Do you have any other requests",
              },
              false
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

  const [pageTitle, setPageTitle] = useState("TRIDENT");
  useEffect(() => {
    setPageTitle(mapTitle ? `${mapTitle} | TRIDENT` : "TRIDENT");
  }, [mapTitle]);

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
    }
  }, [mounted, insertNewDialogue]);
  if (!mounted) return null;

  return (
    <>
      <title>{pageTitle}</title>
      <main className="tridentMain">
        <div className="tridentMapWrap">
          <MapStyleSelector
            mapStyleJsonUrl={mapStyleJsonUrl}
            onSelectMapStyleJsonUrl={onSelectMapStyleJsonUrl}
          />
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
          <FloatingChatButton onChange={onChangeFloatingChatButton}>
            <div className="logsOuterWrap" ref={dialogueRef}>
              <div className="tridentMapTitle">
                {mapTitle ? mapTitle : "Untitled Map"}
              </div>
              {dialogueList.map((dialogueElement, dialogueIndex) => {
                return (
                  <div key={dialogueIndex}>
                    <DialogueElementView
                      dialogueElement={dialogueElement}
                      dialogueIndex={dialogueIndex}
                      isResponding={
                        (responding || lazyInserting || mapping) &&
                        dialogueIndex === dialogueList.length - 1
                      }
                    />
                  </div>
                );
              })}
              <div style={{ height: "1px" }} ref={dialogueEndRef} />
            </div>
            <TextInput
              disabled={responding || lazyInserting || mapping}
              placeholder={
                responding || lazyInserting || mapping
                  ? "..."
                  : "Show embassies in Lebanon."
              }
              inputText={inputText}
              setInputText={setInputText}
              onSubmit={onSubmit}
            />
            <div
              style={{
                fontSize: "0.8rem",
                color: "white",
                width: "100%",
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              TRIDENT may produce inaccurate information.
            </div>
          </FloatingChatButton>
        </div>
      </main>
    </>
  );
}
