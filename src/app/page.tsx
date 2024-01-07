"use client";

import { BaseMap } from "@/components/BaseMap";
import { DialogueElementView } from "@/components/DialogueElementView";
import { GeoJsonToMarkers } from "@/components/GeoJsonToMarkers";
import { TextInput } from "@/components/TextInput";
import { DialogueElement } from "@/types/DialogueElement";
import { nextPostJson, nextPostJsonWithCache } from "@/utils/nextPostJson";
import { sleep } from "@/utils/sleep";
import { useCallback, useEffect, useRef, useState } from "react";
import { GeolocateControlRef, MapProvider, MapRef } from "react-map-gl";
import { FeatureCollection } from "geojson";
import { getOverpassResponseJsonWithCache } from "@/utils/getOverpassResponse";
import osmtogeojson from "osmtogeojson";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { useLocalStorage } from "@/hooks/localStorage";
import { FloatingChatButton } from "@/components/FloatingActionButton";
import { MapStyleSelector } from "@/components/MapStyleSelector";
import { fitBoundsToGeoJson } from "@/utils/map/fitBoundsToGeoJson";
import { parseInnerResJson } from "@/utils/trident/parseInnerResJson";
import { LegalNotice } from "@/components/LegalNotice";
import { SuggestByCurrentLocation } from "@/components/SuggestByCurrentLocation";

const greetings = {
  en: "Welcome! I'm TRIDENT, interactive Smart Maps assistant. Could you indicate me the areas and themes you want to see as the map?",
  ja: "ようこそ！私は対話型スマート地図アシスタント、TRIDENTです。地図に表示したいエリアやテーマを教えてください。",
  ch: "欢迎您！我是互动智能地图助理 TRIDENT。您能告诉我您想在地图上看到的区域和主题吗？",
  fr: "Bienvenue! Je suis TRIDENT, assistant de cartes intelligentes interactives. Pourriez-vous m'indiquer les zones et les thèmes que vous souhaitez voir sur la carte?",
};

const untitledMaps = {
  en: "Untitled Map",
  ja: "無題の地図",
  ch: "无标题地图",
  fr: "Carte sans titre",
};

const placeholders = {
  en: "Show embassies in Lebanon",
  ja: "レバノンの大使館を表示して",
  ch: "在黎巴嫩显示大使馆",
  fr: "Afficher les ambassades au Liban",
};

export default function Home() {
  // all state
  const [mounted, setMounted] = useState(false);
  const [pageTitle, setPageTitle] = useState("TRIDENT");
  const [mapInputPlaceholder, setMapInputPlaceholder] = useState<
    string | undefined
  >(undefined);

  // maps ref and state
  const mapRef = useRef<MapRef | null>(null);
  const geolocationControlRef = useRef<GeolocateControlRef | null>(null);
  const [mapTitle, setMapTitle] = useState<string | undefined>(undefined);
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{ id: string; style: TridentMapsStyle; geojson: FeatureCollection }>
  >([]);

  // base maps style state
  const [mapStyleJsonUrl, setMapStyleJsonUrl] = useLocalStorage<string>(
    "trident-selected-map-style-json-url",
    "/map_styles/fiord-color-gl-style/style.json"
  );

  // dialogue ref and state
  const dialogueRef = useRef<HTMLDivElement | null>(null);
  const dialogueEndRef = useRef<HTMLDivElement | null>(null);
  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([]);

  // communication state
  const [responding, setResponding] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [pastMessages, setPastMessages] = useState<Array<any> | undefined>();

  // floating chat button state
  const [showingFloatingChat, setShowingFloatingChat] = useState(true);

  // input ref and state
  const [inputText, setInputText] = useState("");

  const scrollToBottom = useCallback(async () => {
    await sleep(50);
    if (dialogueEndRef.current) {
      dialogueEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  const onChangeFloatingChatButton = useCallback(
    (showing: boolean) => {
      setShowingFloatingChat(showing);
      if (showing) {
        scrollToBottom();
      }
    },
    [scrollToBottom]
  );

  const onSelectMapStyleJsonUrl = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMapStyleJsonUrl(e.target.value);
    },
    [setMapStyleJsonUrl]
  );

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

  const onSubmit = useCallback(
    async (newestInputText?: string) => {
      let newInputText = inputText.trim();
      if (newestInputText) {
        newInputText = newestInputText;
      }

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
        setGeojsonWithStyleList([]);
        const overpassQuery = deepResJson.deep.split("```")[1];

        const handleOverpassResponseJson = async (
          overpassResponseJson: any,
          retry: boolean
        ) => {
          const newGeojson = osmtogeojson(overpassResponseJson);
          console.log("features", newGeojson.features.length);
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
    [inputText, insertNewDialogue, pastMessages, scrollToBottom]
  );

  const onSelectedSuggestions = useCallback(
    async (value: string) => {
      await onSubmit(value);
    },
    [onSubmit]
  );

  useEffect(() => {
    setPageTitle(mapTitle ? `${mapTitle} | TRIDENT` : "TRIDENT");
  }, [mapTitle]);

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

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      console.log("mounted");

      let greeting = greetings.en;
      let initialTitle = untitledMaps.en;
      let placeholder = placeholders.en;
      if (window) {
        const language = window.navigator.language;
        if (language.includes("ja")) {
          greeting = greetings.ja;
          initialTitle = untitledMaps.ja;
          placeholder = placeholders.ja;
        } else if (language.includes("ch")) {
          greeting = greetings.ch;
          initialTitle = untitledMaps.ch;
          placeholder = placeholders.ch;
        } else if (language.includes("fr")) {
          greeting = greetings.fr;
          initialTitle = untitledMaps.fr;
          placeholder = placeholders.fr;
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
              {dialogueList.length === 1 && inputText.length === 0 && (
                <SuggestByCurrentLocation onSelected={onSelectedSuggestions} />
              )}
              <div style={{ height: "1px" }} ref={dialogueEndRef} />
            </div>
            <TextInput
              disabled={responding || mapping}
              placeholder={
                responding || mapping
                  ? "..."
                  : mapInputPlaceholder
                  ? mapInputPlaceholder
                  : placeholders.en
              }
              inputText={inputText}
              setInputText={setInputText}
              onSubmit={onSubmit}
            />
            <LegalNotice />
          </FloatingChatButton>
        </div>
      </main>
    </>
  );
}
