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

type StyleConfig = {
  name: string;
  styleUrl: string;
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

const SYNC_THROTTLE_MS = 30;
const MINIMUM_ZOOM = 0.5;

export default function PlanetilerPage() {
  // メルカトル図法の緯度歪み係数を計算
  const calculateZoomLevel = useCallback(
    (latitude: number, baseZoom: number = 1.8): number => {
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

  const styles = useMemo<StyleConfig[]>(
    () => [
      {
        name: "Fiord color",
        styleUrl: "/map_styles/fiord-color-gl-style/style.json",
        longitude: 0,
        latitude: 0,
        zoom: calculateZoomLevel(0),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "Railways",
        styleUrl: "https://tile.yuiseki.net/styles/railways/style.json",
        longitude: 0,
        latitude: 0,
        zoom: calculateZoomLevel(0),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "Rivers",
        styleUrl: "https://tile.yuiseki.net/styles/rivers/style.json",
        longitude: 0,
        latitude: 0,
        zoom: calculateZoomLevel(0),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "Global Connectivity",
        styleUrl:
          "https://tile.yuiseki.net/styles/global_connectivity/style.json",
        longitude: 0,
        latitude: 0,
        zoom: calculateZoomLevel(0),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "Water Stress",
        styleUrl: "https://tile.yuiseki.net/styles/water_stress/style.json",
        longitude: 0,
        latitude: 0,
        zoom: calculateZoomLevel(0),
        bearing: 0,
        pitch: 0,
      },
      {
        name: "Biodiversity",
        styleUrl: "https://tile.yuiseki.net/styles/biodiversity/style.json",
        longitude: 0,
        latitude: 0,
        zoom: calculateZoomLevel(0),
        bearing: 0,
        pitch: 0,
      },
    ],
    [calculateZoomLevel]
  );

  const mapRefs = useMemo<MutableRefObject<MapRef | null>[]>(
    () =>
      Array.from(
        { length: styles.length },
        () => ({ current: null } as MutableRefObject<MapRef | null>)
      ),
    [styles.length]
  );

  const suppressMoveEventsRef = useRef<boolean[]>(
    Array(styles.length).fill(false)
  );
  const lastSyncTimeRef = useRef<number>(0);
  const isUserDraggingRef = useRef<boolean>(false);
  const [activeMapIndex, setActiveMapIndex] = useState<number>(-1);

  const performSync = useCallback(
    (sourceMapIndex: number, viewState: ViewState) => {
      const sourceStyle = styles[sourceMapIndex];
      if (!sourceStyle) {
        return;
      }

      const longitude = viewState.longitude ?? sourceStyle.longitude;
      const latitude = viewState.latitude ?? sourceStyle.latitude;
      const zoom = viewState.zoom ?? sourceStyle.zoom;
      const bearing = viewState.bearing ?? sourceStyle.bearing ?? 0;
      const pitch = viewState.pitch ?? sourceStyle.pitch ?? 0;

      const lngOffset = longitude - sourceStyle.longitude;
      const latOffset = latitude - sourceStyle.latitude;

      const sourceExpectedZoom = calculateZoomLevel(latitude);
      const zoomDiffFromExpected = zoom - sourceExpectedZoom;

      mapRefs.forEach((mapRef, index) => {
        if (index === sourceMapIndex) {
          return;
        }

        const targetStyle = styles[index];
        const targetMapRef = mapRef.current;
        if (!targetStyle || !targetMapRef) {
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
          Math.min(85, targetStyle.latitude + latOffset)
        );
        const targetCenterLongitudeRaw = targetStyle.longitude + lngOffset;
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
    [calculateZoomLevel, mapRefs, styles]
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
        {styles.map((style, index) => (
          <div key={style.name} style={{ position: "relative" }}>
            <BaseMap
              id={`map-${index}`}
              mapRef={mapRefs[index]}
              longitude={style.longitude}
              latitude={style.latitude}
              zoom={style.zoom}
              style={style.styleUrl}
              projection="globe"
              onMapMoveStart={(event) => handleMapMoveStart(index, event)}
              onMapMove={(event) => handleMapMove(index, event)}
              onMapMoveEnd={(event) => handleMapMoveEnd(index, event)}
              showControls={false}
            />
          </div>
        ))}
      </MapProvider>
    </main>
  );
}
