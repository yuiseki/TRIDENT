"use client";

import { BaseMap } from "@/components/BaseMap";
import { TextInput } from "@/components/TextInput";
import { useRef, useState } from "react";
import { MapProvider, MapRef } from "react-map-gl";

export default function Home() {
  const mapRef = useRef<MapRef | null>(null);
  const [inputText, setInputText] = useState("");

  return (
    <main style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <div
        style={{
          margin: "0px",
          width: "50%",
          height: "100vh",
          backgroundColor: "rgba(0, 158, 219, 1)",
          backgroundImage: 'url("/Flag_of_the_United_Nations.svg")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        ></div>
        <div
          style={{
            height: "92vh",
          }}
        >
          hogehoge
        </div>
        <div
          style={{
            height: "8vh",
            maxWidth: "90%",
            margin: "auto",
          }}
        >
          <TextInput
            disabled={false}
            placeholder="..."
            inputText={inputText}
            setInputText={setInputText}
            onSubmit={() => console.log(inputText)}
          />
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
      </div>
      <div
        style={{ margin: "0px", width: "50%", height: "100%", zIndex: 1000 }}
      >
        <MapProvider>
          <BaseMap
            id="mainMap"
            mapRef={mapRef}
            longitude={0}
            latitude={0}
            zoom={1}
          ></BaseMap>
        </MapProvider>
      </div>
    </main>
  );
}
