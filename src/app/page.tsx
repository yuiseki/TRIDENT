"use client";

import { BaseMap } from "@/components/BaseMap";
import { DialogueElementView } from "@/components/DialogueElementView";
import { GeoJsonToSourceLayer } from "@/components/GeoJsonToSourceLayer";
import { TextInput } from "@/components/TextInput";
import { DialogueElement } from "@/types/DialogueElement";
import { nextPostJson, nextPostJsonWithCache } from "@/utils/nextPostJson";
import { sleep } from "@/lib/sleep";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LngLatBoundsLike,
  LngLatLike,
  MapProvider,
  MapRef,
  useMap,
} from "react-map-gl/maplibre";
import { FeatureCollection } from "geojson";
import { getOverpassResponseJsonWithCache } from "@/lib/osm/getOverpass";
import osmtogeojson from "osmtogeojson";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { useLocalStorage } from "@/hooks/localStorage";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { MapStyleSelector } from "@/components/MapStyleSelector";
import { fitBoundsToGeoJson } from "@/lib/maplibre/fitBoundsToGeoJson";
import { parseInnerResJson } from "@/utils/trident/parseInnerResJson";
import { LegalNotice } from "@/components/LegalNotice";
import { InputSuggest } from "@/components/InputSuggest";
import { InputPredict } from "@/components/InputPredict";
import { LocationProvider } from "@/contexts/LocationContext";
import { greetings } from "@/constants/Greetings";
import { untitledMaps } from "@/constants/UntitledMap";
import { tridentPlaceholders } from "@/constants/TridentPlaceholder";
import { useScrollToBottom } from "@/hooks/scrollToBottom";
import { parseSurfaceResJson } from "@/utils/trident/parseSurfaceResJson";
import { Ability } from "@/types/Ability";
import { AccountButton } from "@/components/AccountButton";
import * as turf from "@turf/turf";

export default function Home() {
  // all state
  const [mounted, setMounted] = useState(false);
  const [mapInputPlaceholder, setMapInputPlaceholder] = useState<
    string | undefined
  >(undefined);
  const [pageTitle, setPageTitle] = useState("TRIDENT");
  const [mapTitle, setMapTitle] = useState<string | undefined>(undefined);

  // maps ref and state
  const mapRef = useRef<MapRef | null>(null);
  const [geoJsonWithStyleList, setGeoJsonWithStyleList] = useState<
    Array<{
      id: string;
      line: string;
      style: TridentMapsStyle;
      geojson: FeatureCollection;
    }>
  >([]);

  const [center, setCenter] = useState<LngLatLike | undefined>(undefined);
  const [bounds, setBounds] = useState<LngLatBoundsLike | undefined>(undefined);

  // base maps style state
  const [mapStyleJsonUrl, setMapStyleJsonUrl] = useLocalStorage<string>(
    "trident-selected-map-style-json-url",
    "/map_styles/dark-matter-gl-style/style.json"
  );

  // floating chat button state
  const [showingFloatingChat, setShowingFloatingChat] = useState(true);

  // dialogue ref and state
  const dialogueRef = useRef<HTMLDivElement | null>(null);
  const dialogueEndRef = useRef<HTMLDivElement | null>(null);
  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([]);
  const scrollToBottom = useScrollToBottom(dialogueEndRef);

  // ability state
  const [ability, setAbility] = useState<Ability | undefined>(undefined);

  // communication state
  const [responding, setResponding] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [pastMessages, setPastMessages] = useState<Array<string> | undefined>();

  // input ref and state
  const [inputText, setInputText] = useState("");

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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const invokeOverpassInner = useCallback(
    async (history: string[]) => {
      setMapping(true);
      setResponding(true);
      // invoke inner layer
      const innerRes = await nextPostJson("/api/ai/inner", {
        pastMessages: JSON.stringify(history),
        bounds: JSON.stringify(mapRef.current?.getBounds()),
        center: JSON.stringify(mapRef.current?.getCenter()),
      });
      const innerResJson = await innerRes.json();
      setResponding(false);
      if (innerResJson.inner === undefined) {
        setGeoJsonWithStyleList([]);
        setMapping(false);
        return;
      }
      if (innerResJson.inner.toLowerCase().includes("no map")) {
        setResponding(false);
        setMapping(false);
        return;
      }

      setMapping(true);

      const newParsedInnerResJson = parseInnerResJson(innerResJson);
      await invokeOverpassDeep(newParsedInnerResJson);
    },
    [insertNewDialogue]
  );

  const invokeOverpassDeep = useCallback(
    async (parsedInnerResJson: {
      styles: {
        [key: string]: {
          emoji?: string;
          color?: string;
        };
      };
      mapTitle?: string;
      confirmMessage: string;
      linesWithAreaAndOrConcern: string[];
    }) => {
      const { styles, mapTitle, confirmMessage, linesWithAreaAndOrConcern } =
        parsedInnerResJson;

      if (mapTitle) {
        setMapTitle(mapTitle);
        setPageTitle(mapTitle ? `${mapTitle} | TRIDENT` : "TRIDENT");
      }
      // invoke deep layer by each item of linesWithAreaAndOrConcern
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
          const newGeoJson = osmtogeojson(
            overpassResponseJson
          ) as FeatureCollection;
          console.log("features", newGeoJson.features.length);
          if (newGeoJson.features.length !== 0) {
            setGeoJsonWithStyleList((prev) => {
              return [
                ...prev,
                {
                  id: "layer-" + prev.length + 1,
                  line: line,
                  style: style,
                  geojson: newGeoJson,
                },
              ];
            });
            if (idx === linesWithAreaAndOrConcern.length - 1) {
              console.log("Finish!!!!!");
              setMapping(false);
              insertNewDialogue(
                {
                  who: "assistant",
                  text: confirmMessage,
                },
                false
              );
            }
          } else {
            if (retry) {
              getOverpassResponseJsonWithCache(
                overpassQuery.replace('["name"', '["name:en"')
              ).then((overpassResponseJson) => {
                handleOverpassResponseJson(overpassResponseJson, false);
              });
            }
          }
        };
        getOverpassResponseJsonWithCache(overpassQuery).then(
          (overpassResponseJson) => {
            handleOverpassResponseJson(overpassResponseJson, true);
          }
        );
      });
    },
    []
  );

  const onSubmit = useCallback(async () => {
    const newInputText = inputText.trim();
    console.log("newInputText", newInputText);

    setInputText("");
    setResponding(true);
    setMapping(true);

    insertNewDialogue({ who: "user", text: newInputText });

    await sleep(200);
    scrollToBottom();

    // invoke surface layer
    const surfaceRes = await nextPostJson("/api/ai/surface", {
      query: newInputText,
      pastMessages: pastMessages ? JSON.stringify(pastMessages) : undefined,
      bounds: JSON.stringify(mapRef.current?.getBounds()),
      center: JSON.stringify(mapRef.current?.getCenter()),
    });
    const surfaceResJson: {
      surface: string;
      history: Array<string>;
    } = await surfaceRes.json();
    setPastMessages(surfaceResJson.history);
    console.log(surfaceResJson.history);
    const { ability, reply } = parseSurfaceResJson(surfaceResJson);
    insertNewDialogue(
      {
        who: "assistant",
        text: reply,
      },
      false
    );

    setAbility(ability);

    switch (ability) {
      case "overpass-api":
        console.debug("ability: overpass-api");
        await invokeOverpassInner(surfaceResJson.history);
        break;
      case "apology":
      case "ask-more":
        break;
      default:
        break;
    }
    setResponding(false);
    setMapping(false);
  }, [
    inputText,
    insertNewDialogue,
    invokeOverpassInner,
    pastMessages,
    scrollToBottom,
  ]);

  const onSelect = useCallback((newText: string) => {
    setInputText(newText);
    /*
    setTimeout(() => {
      onSubmit();
    }, 200);
    */
  }, []);

  // fit bounds to all geojson in the geojsonWithStyleList
  const fitBounds = useCallback(() => {
    console.log("geoJsonWithStyleList", geoJsonWithStyleList);
    console.log("mapRef", mapRef);
    if (geoJsonWithStyleList.length === 0) return;

    try {
      // everything - all geojson in the geojsonWithStyleList
      const everything: FeatureCollection = {
        type: "FeatureCollection",
        features: geoJsonWithStyleList
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
      if (!mapRef || mapRef === undefined) return;

      fitBoundsToGeoJson(mapRef, everything, padding);
    } catch (error) {
      console.error(error);
      setResponding(false);
      setMapping(false);
    }
  }, [geoJsonWithStyleList, showingFloatingChat, mapRef]);

  useEffect(() => {
    fitBounds();
  }, [fitBounds]);

  // initialize at mount
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      console.log("mounted");

      let greeting = greetings.en;
      let initialTitle = untitledMaps.en;
      let placeholder = tridentPlaceholders.en;
      if (window) {
        const language = window.navigator.language;
        if (language.includes("ja")) {
          greeting = greetings.ja;
          initialTitle = untitledMaps.ja;
          placeholder = tridentPlaceholders.ja;
        } else if (language.includes("ch")) {
          greeting = greetings.ch;
          initialTitle = untitledMaps.ch;
          placeholder = tridentPlaceholders.ch;
        } else if (language.includes("fr")) {
          greeting = greetings.fr;
          initialTitle = untitledMaps.fr;
          placeholder = tridentPlaceholders.fr;
        }
      }

      setDialogueList([
        {
          who: "assistant",
          text: greeting,
        },
      ]);
      setMapTitle(initialTitle);
      setMapInputPlaceholder(placeholder);
      scrollToBottom();
      setResponding(false);
    }
  }, [mounted, insertNewDialogue, dialogueList.length, scrollToBottom]);

  return (
    <LocationProvider locationInfo={{ center: center, bounds: bounds }}>
      <title>{pageTitle}</title>
      <main className="tridentMain">
        <div className="tridentMapWrap">
          <AccountButton />
          <MapStyleSelector
            mapStyleJsonUrl={mapStyleJsonUrl}
            onSelectMapStyleJsonUrl={(
              e: React.ChangeEvent<HTMLSelectElement>
            ) => {
              setMapStyleJsonUrl(e.target.value);
            }}
          />
          <MapProvider>
            <BaseMap
              id="mainMap"
              mapRef={mapRef}
              longitude={0}
              latitude={0}
              zoom={2.5}
              projection="globe"
              style={mapStyleJsonUrl}
              onMapLoad={() => {
                console.log("Map loaded");
              }}
              onMapMoveEnd={(e) => {
                console.log("Map moved", e.viewState);
                if (mapRef.current) {
                  const bounds = mapRef.current.getBounds();
                  const center = mapRef.current.getCenter();
                  console.log("New bounds:", bounds);
                  console.log("New center:", center);
                  setCenter(center);
                  setBounds(bounds);
                }
              }}
            >
              {geoJsonWithStyleList &&
                geoJsonWithStyleList.map((geojsonWithStyle) => {
                  return (
                    <GeoJsonToSourceLayer
                      key={geojsonWithStyle.id}
                      geojson={geojsonWithStyle.geojson}
                      style={geojsonWithStyle.style}
                    />
                  );
                })}
            </BaseMap>
          </MapProvider>
          <FloatingChatButton
            onChange={(showing: boolean) => {
              setShowingFloatingChat(showing);
              if (showing) {
                scrollToBottom();
              }
            }}
          >
            <div className="logsOuterWrap" ref={dialogueRef}>
              <div className="tridentMapTitle">
                {mapTitle ? mapTitle : "Loading..."}
              </div>
              {dialogueList.map((dialogueElement, dialogueIndex) => {
                return (
                  <div key={dialogueIndex}>
                    <DialogueElementView
                      dialogueElement={dialogueElement}
                      dialogueIndex={dialogueIndex}
                      isResponding={
                        (responding || mapping) &&
                        dialogueIndex === dialogueList.length - 1
                      }
                    />
                  </div>
                );
              })}
              {/*
                {dialogueList.length === 1 && inputText.length === 0 && (
                  <InputSuggest
                    onSelect={onSelect}
                    onChangeLocation={(v) => {
                      setLocation(v);
                    }}
                  />
                )}
                {!responding &&
                  !mapping &&
                  dialogueList.length > 1 &&
                  !(ability && ["apology", "ask-more"].includes(ability)) && (
                    <InputPredict
                      dialogueList={dialogueList}
                      onUpdateSuggestions={() => {
                        scrollToBottom();
                      }}
                      onSelect={onSelect}
                    />
                  )}
               */}
              <div style={{ height: "1px" }} ref={dialogueEndRef} />
            </div>
            <TextInput
              disabled={responding || mapping}
              placeholder={
                responding || mapping
                  ? "..."
                  : mapInputPlaceholder
                  ? mapInputPlaceholder
                  : tridentPlaceholders.en
              }
              inputText={inputText}
              setInputText={setInputText}
              onSubmit={onSubmit}
            />
            <LegalNotice />
          </FloatingChatButton>
        </div>
      </main>
    </LocationProvider>
  );
}
