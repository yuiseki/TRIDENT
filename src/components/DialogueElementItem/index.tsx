import { DialogueElement } from "@/types/DialogueElement";
import { AvatarIcon } from "../AvatarIcon";
import { useCallback, useState } from "react";
import { nextPostJson } from "@/utils/nextPostJson";
import { GeoJsonMap } from "../GeoJsonMap";
import { sleep } from "@/utils/sleep";
import { scrollToBottom } from "@/utils/scrollToBottom";
import { FeatureCollection } from "geojson";

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
  const [requestingOverpassQuery, setRequestingOverpassQuery] = useState(false);
  const [requestingOverpassApi, setRequestingOverpassApi] = useState(false);
  const [overpassQuery, setOverpassQuery] = useState<string | undefined>();

  const searchRelatedPlaces = useCallback(
    async (question: string, hint: string) => {
      setRequestingOverpassQuery(true);
      const res = await nextPostJson("/api/geo", {
        query: question,
        hint: hint,
      });
      const newOverpassQuery = await res.text();
      console.log(newOverpassQuery);
      setOverpassQuery(newOverpassQuery);
      setRequestingOverpassQuery(false);
      setRequestingOverpassApi(true);
      const overpassRes = await nextPostJson("/api/overpass", {
        query: newOverpassQuery,
      });
      const newGeojson = await overpassRes.json();
      console.log(newGeojson);
      setGeojson(newGeojson);
      await sleep(500);
      scrollToBottom();
      setRequestingOverpassApi(false);
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
                  !requestingOverpassQuery &&
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
                          padding: "8px",
                          marginRight: 0,
                          marginLeft: "auto",
                          fontSize: "1.1em",
                          fontWeight: "bold",
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
                {(requestingOverpassQuery || requestingOverpassApi) && (
                  <div style={{ width: "100%" }}>Loading...</div>
                )}
                {geojson && overpassQuery && (
                  <div style={{ width: "100%" }}>
                    <details style={{ marginBottom: "25px" }}>
                      <summary>Overpass API query</summary>
                      <pre style={{ paddingLeft: "2em" }}>{overpassQuery}</pre>
                    </details>
                    {geojson && geojson.features.length === 0 ? (
                      <div>Sorry, something went wrong.</div>
                    ) : (
                      <GeoJsonMap geojson={geojson} />
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
