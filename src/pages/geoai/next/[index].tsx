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
import { TridentMaps, TridentMapsStyle } from "@/types/TridentMaps";
import { useRouter } from "next/router";

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const mapRef = useRef<MapRef | null>(null);
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{ id: string; style: TridentMapsStyle; geojson: FeatureCollection }>
  >([]);

  const router = useRouter();

  useEffect(() => {
    if (!router.query.index) {
      return;
    }
    if (initialized) {
      return;
    }
    setInitialized(true);
    const effect = async () => {
      const mapsRes = await nextPostJson("/api/geoai/maps", {
        index: router.query.index,
      });
      const mapsResJson: TridentMaps = await mapsRes.json();
      mapsResJson.areas.map((area) => {
        getOverpassResponse(area.query).then(async (areaOverpassResponse) => {
          const areaOverpassJson = await areaOverpassResponse.json();
          const areaGeojson = osmtogeojson(areaOverpassJson);
          if (areaGeojson.features.length !== 0) {
            setGeojsonWithStyleList((prev) => {
              return [
                ...prev,
                { id: area.name, style: area.style, geojson: areaGeojson },
              ];
            });
          }
        });
        area.subjects.map((subject) => {
          getOverpassResponse(subject.query).then(
            async (subjectOverpassResponse) => {
              const subjectOverpassJson = await subjectOverpassResponse.json();
              const subjectGeojson = osmtogeojson(subjectOverpassJson);
              if (subjectGeojson.features.length !== 0) {
                setGeojsonWithStyleList((prev) => {
                  return [
                    ...prev,
                    {
                      id: `${area.name}-${subject.name}`,
                      style: subject.style,
                      geojson: subjectGeojson,
                    },
                  ];
                });
              }
            }
          );
        });
      });
    };
    effect();
  }, [initialized, router.query.index]);

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
    <main style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          margin: "0px",
          width: "100%",
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
  );
}
