"use client";

import { BaseMap } from "@/components/BaseMap";
import { DialogueElementItem } from "@/components/DialogueElementItem";
import { TextInput } from "@/components/TextInput";
import { DialogueElement } from "@/types/DialogueElement";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapProvider, MapRef } from "react-map-gl";

const greetings = `Hello! I'm TRIDENT, an unofficial UN dedicated interactive information retrieval and humanity assistance system. What kind of information are you looking for?`;

export default function Home() {
  const mapRef = useRef<MapRef | null>(null);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState(greetings);

  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([
    {
      who: "assistant",
      text: "",
    },
  ]);

  const [initialized, setInitialized] = useState(false);
  const [lazyInserting, setLazyInserting] = useState(false);
  const [responding, setResponding] = useState(false);

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

  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "50%",
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
          margin: "0px",
          width: "50%",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "95%",
            margin: "auto",
            height: "92vh",
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
                    (responding || lazyInserting) &&
                    dialogueIndex === dialogueList.length - 1
                  }
                />
              </div>
            );
          })}
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
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          margin: "0px",
          width: "50%",
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
          ></BaseMap>
        </MapProvider>
      </div>
    </main>
  );
}
