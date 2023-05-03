import { DialogueElement } from "@/types/DialogueElement";
import { AvatarIcon } from "../AvatarIcon";
import { useCallback, useState } from "react";
import { nextPostJson } from "@/utils/nextPostJson";
import { GeoJsonMap } from "../GeoJsonMap";
import { sleep } from "@/utils/sleep";
import { scrollToBottom } from "@/utils/scrollToBottom";
import { FeatureCollection } from "geojson";
import { getOverpassResponse } from "@/utils/getOverpassResponse";
import osmtogeojson from "osmtogeojson";

export const DialogueElementItem: React.FC<{
  prevDialogueElement?: DialogueElement;
  dialogueElement: DialogueElement;
  dialogueIndex: number;
  isResponding: boolean;
}> = ({
  prevDialogueElement,
  dialogueElement,
  dialogueIndex,
  isResponding,
}) => {
  const [geojson, setGeojson] = useState<FeatureCollection>();
  const [generatingOverpassQuery, setGeneratingOverpassQuery] = useState(false);
  const [requestingOverpassApi, setRequestingOverpassApi] = useState(false);
  const [overpassQuery, setOverpassQuery] = useState<string | undefined>();

  const searchRelatedPlaces = useCallback(
    async (question: string, hint: string) => {
      setGeneratingOverpassQuery(true);
      const res = await nextPostJson("/api/geo", {
        query: question,
        hint: hint,
      });
      const newOverpassQueries = await res.json();
      setGeneratingOverpassQuery(false);
      let newGeojson;
      for await (const query of newOverpassQueries) {
        console.log(query);
        setOverpassQuery(query);
        setRequestingOverpassApi(true);
        try {
          const overpassRes = await getOverpassResponse(query);
          const overpassJson = await overpassRes.json();
          newGeojson = osmtogeojson(overpassJson);
          console.log(newGeojson);
          if (newGeojson.features.length === 0) {
            if (
              newOverpassQueries.indexOf(query) ===
              newOverpassQueries.length - 1
            ) {
              setGeojson(newGeojson);
              setRequestingOverpassApi(false);
              scrollToBottom();
              break;
            } else {
              await sleep(500);
              continue;
            }
          } else {
            setGeojson(newGeojson);
            await sleep(200);
            setRequestingOverpassApi(false);
            await sleep(200);
            scrollToBottom();
            break;
          }
        } catch (error) {
          console.log(error);
          continue;
        }
      }
    },
    []
  );

  return (
    <div
      key={dialogueIndex}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        padding: "14px",
        marginTop: "20px",
        marginBottom: "30px",
        border: "2px solid rgba(219, 219, 219, 0.5)",
        borderRadius: "2px",
        boxShadow: " 0 2px 6px 0 rgba(219, 219, 219, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyItems: "center",
          alignItems: "center",
        }}
      >
        <AvatarIcon who={dialogueElement.who} />
        <div
          style={{
            fontWeight: "bold",
            fontSize: "1.4em",
            marginLeft: "4px",
          }}
        >
          {dialogueElement.who === "assistant" ? "TRIDENT" : "USER"}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: "1.2em",
            paddingLeft: "70px",
          }}
        >
          {dialogueElement.text?.split("\n").map((row, rowIdx) => {
            return (
              <div
                key={`${dialogueIndex}-${rowIdx}`}
                style={{
                  minHeight: "1em",
                  marginLeft: row.startsWith(" ") ? "1em" : "0px",
                }}
              >
                {row}
                {isResponding &&
                  rowIdx === dialogueElement.text.split("\n").length - 1 && (
                    <span className="blinkingCursor" />
                  )}
              </div>
            );
          })}
          {!isResponding && dialogueElement.docs && (
            <details>
              <summary>Related documents</summary>
              <ul style={{ paddingLeft: "2em" }}>
                {dialogueElement.docs?.map((doc, docIdx) => {
                  return (
                    <li
                      key={`${dialogueIndex}-${docIdx}`}
                      style={{
                        minHeight: "1em",
                      }}
                    >
                      <a href={doc.metadata.source} target="_blank">
                        {doc.metadata.title
                          ? doc.metadata.title
                          : doc.metadata.source}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
          {!isResponding &&
            dialogueElement.textEnd?.split("\n").map((row, rowIdx) => {
              return (
                <div
                  key={`${dialogueIndex}-${rowIdx}-end`}
                  style={{
                    minHeight: "1em",
                    marginLeft: row.startsWith(" ") ? "1em" : "0px",
                  }}
                >
                  {row}
                </div>
              );
            })}
          {!isResponding &&
            prevDialogueElement &&
            dialogueElement.who === "assistant" && (
              <div style={{ margin: "25px 0", width: "100%" }}>
                {geojson === undefined &&
                  overpassQuery === undefined &&
                  !generatingOverpassQuery &&
                  !requestingOverpassApi && (
                    <div style={{ width: "100%", textAlign: "right" }}>
                      <input
                        type="button"
                        value="Search related places"
                        style={{
                          color: "rgb(253, 254, 255)",
                          backgroundColor: "rgba(0, 158, 219, 1)",
                          boxShadow: "0 2px 6px 0 rgba(0, 158, 219, 0.6)",
                          border: "2px solid rgba(0, 158, 219, 0.6)",
                          borderRadius: "2px",
                          display: "block",
                          textAlign: "right",
                          padding: "6px",
                          marginRight: 0,
                          marginLeft: "auto",
                          fontSize: "1em",
                          fontWeight: "normal",
                          letterSpacing: "2px",
                        }}
                        onClick={() => {
                          const question = prevDialogueElement.text;
                          const hint = dialogueElement.text;
                          searchRelatedPlaces(question, hint);
                        }}
                      />
                    </div>
                  )}
                {generatingOverpassQuery && (
                  <div style={{ width: "100%" }}>
                    Generating query for Overpass API, please wait...
                    <span className="blinkingCursor" />
                  </div>
                )}
                {requestingOverpassApi && (
                  <div style={{ width: "100%" }}>
                    Waiting response from Overpass API, please wait...
                    <span className="blinkingCursor" />
                  </div>
                )}
                {geojson && overpassQuery && (
                  <div style={{ width: "100%" }}>
                    {geojson && geojson.features.length === 0 ? (
                      <div>Sorry, something went wrong.</div>
                    ) : (
                      <>
                        <div style={{ marginBottom: "10px" }}>
                          Related places
                        </div>
                        <GeoJsonMap geojson={geojson} />
                      </>
                    )}
                    <details style={{ marginTop: "25px" }}>
                      <summary>Overpass API query</summary>
                      <pre style={{ paddingLeft: "2em" }}>{overpassQuery}</pre>
                    </details>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
