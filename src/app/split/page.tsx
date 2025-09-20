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

type RegionConfig = {
  name: string;
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

const SYNC_THROTTLE_MS = 30;
const MINIMUM_ZOOM = 0.5;

export default function SplitPage() {
  // メルカトル図法の緯度歪み係数を計算
  const calculateZoomLevel = useCallback(
    (latitude: number, baseZoom: number = 1.8): number => {
      const clampedLat = Math.max(-85, Math.min(85, latitude));
      const latRad = (clampedLat * Math.PI) / 180;
      const cosLat = Math.cos(latRad);
      const distortionFactor = cosLat === 0 ? Number.POSITIVE_INFINITY : 1 / cosLat;
      const adjustedZoom = baseZoom - Math.log2(Math.max(distortionFactor, 1));
      return Math.max(MINIMUM_ZOOM, adjustedZoom);
    },
    []
  );

  const regions = useMemo<RegionConfig[]>(
    () => [
      {
        name: "アジア太平洋",
        longitude: 139.6917,
        latitude: 35.6895,
        zoom: calculateZoomLevel(35.6895),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "ヨーロッパ",
        longitude: 2.3522,
        latitude: 48.8566,
        zoom: calculateZoomLevel(48.8566),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "北アメリカ",
        longitude: -74.006,
        latitude: 40.7128,
        zoom: calculateZoomLevel(40.7128),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "南アメリカ",
        longitude: -58.3816,
        latitude: -34.6037,
        zoom: calculateZoomLevel(-34.6037),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "アフリカ",
        longitude: 18.4241,
        latitude: -33.9249,
        zoom: calculateZoomLevel(-33.9249),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "中東",
        longitude: 51.5074,
        latitude: 25.2769,
        zoom: calculateZoomLevel(25.2769),
        bearing: 0,
        pitch: 0,
      },
    ],
    [calculateZoomLevel]
  );

  const mapRefs = useMemo<MutableRefObject<MapRef | null>[]>(
    () =>
      Array.from({ length: regions.length }, () =>
        ({ current: null } as MutableRefObject<MapRef | null>)
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
          ((targetCenterLongitudeRaw + 180) % 360 + 360) % 360 - 180;
        const targetExpectedZoom = calculateZoomLevel(targetCenterLatitude);
        const targetZoom = Math.max(
          MINIMUM_ZOOM,
          targetExpectedZoom + zoomDiffFromExpected
        );

        mapInstance.jumpTo({
          center: [
            targetCenterLongitude,
            targetCenterLatitude,
          ] as [number, number],
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
        gap: "2px",
      }}
    >
      <MapProvider>
        {regions.map((region, index) => (
          <div key={region.name} style={{ position: "relative" }}>
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
            />
          </div>
        ))}
      </MapProvider>
    </main>
  );
}
