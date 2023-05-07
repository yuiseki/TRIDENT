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
import { placeholders } from "@/const/placeholders";
import { summary } from "../../../public/api.reliefweb.int/disasters/summaries/latest_summary.json";

export const DialogueElementItem: React.FC<{
  prevDialogueElement?: DialogueElement;
  dialogueElement: DialogueElement;
  dialogueIndex: number;
  isResponding: boolean;
  setInputText?: (text: string) => void;
}> = ({
  prevDialogueElement,
  dialogueElement,
  dialogueIndex,
  isResponding,
  setInputText,
}) => {
  const [generatingOverpassQuery, setGeneratingOverpassQuery] = useState(false);
  const [overpassQueries, setOverpassQueries] = useState<
    string[] | undefined
  >();
  const [overpassQuery, setOverpassQuery] = useState<string | undefined>();
  const [requestingOverpassApi, setRequestingOverpassApi] = useState(false);
  const [geojson, setGeojson] = useState<FeatureCollection>();
  const [analyze, setAnalyze] = useState<string>();

  const searchRelatedPlaces = useCallback(
    async (question: string, hint: string) => {
      setGeneratingOverpassQuery(true);
      const res = await nextPostJson("/api/generateOverpassQuery", {
        query: question,
        hint: hint,
      });
      const newOverpassQueries = await res.json();
      setGeneratingOverpassQuery(false);
      setOverpassQueries(newOverpassQueries);
      let newGeojson: FeatureCollection;
      for await (const query of newOverpassQueries) {
        console.log(query);
        setOverpassQuery(query);
        setRequestingOverpassApi(true);
        try {
          const overpassRes = await getOverpassResponse(query);
          const overpassJson = await overpassRes.json();
          newGeojson = osmtogeojson(overpassJson);
          console.log(JSON.stringify(newGeojson));
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
            try {
              const analyzeRes = await nextPostJson(
                "/api/analyzeOverpassResponse",
                {
                  query: question,
                  hint: hint,
                  overpassJson: JSON.stringify(overpassJson),
                }
              );
              const analyzeJson = await analyzeRes.json();
              console.log(analyzeJson.text);
              setAnalyze(analyzeJson.text);
            } catch (error) {
              console.log(error);
            }
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
          {!isResponding &&
            dialogueIndex === 0 &&
            dialogueElement.text.length > 0 && (
              <>
                <details style={{ marginTop: "10px" }}>
                  <summary>
                    Summary of ongoing disasters around the world
                  </summary>
                  {summary}
                </details>
                <details style={{ marginTop: "10px" }}>
                  <summary>Examples</summary>
                  <ul style={{ paddingLeft: "2em" }}>
                    {placeholders.map((placeholder, placeholderIdx) => {
                      return (
                        <li
                          key={`${dialogueIndex}-${placeholderIdx}`}
                          style={{
                            minHeight: "1em",
                          }}
                        >
                          <span>{placeholder}</span>
                          <button
                            onClick={() => {
                              setInputText && setInputText(placeholder);
                            }}
                            style={{
                              fontSize: "0.8em",
                              padding: "0 4px",
                              margin: "4px 0px 4px 20px",
                              color: "rgb(253, 254, 255)",
                              backgroundColor: "rgba(0, 158, 219, 1)",
                              boxShadow: "0 2px 6px 0 rgba(0, 158, 219, 0.6)",
                              border: "2px solid rgba(0, 158, 219, 0.6)",
                              borderRadius: "2px",
                            }}
                          >
                            Ask this
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </>
            )}
          {!isResponding &&
            dialogueElement.docs &&
            0 < dialogueElement.docs.length &&
            !dialogueElement.text.includes("I don't know.") &&
            !dialogueElement.text.includes("Sorry, something went wrong.") && (
              <details>
                <summary>
                  Related documents {`(${dialogueElement.docs.length})`}
                </summary>
                <ul style={{ paddingLeft: "2em" }}>
                  {dialogueElement.docs?.map((doc, docIdx) => {
                    return (
                      <li
                        key={`${dialogueIndex}-${docIdx}`}
                        style={{
                          minHeight: "1em",
                        }}
                      >
                        <a
                          href={doc.metadata.source}
                          title={
                            doc.metadata.title
                              ? doc.metadata.title
                              : doc.metadata.name
                          }
                          target="_blank"
                        >
                          {doc.metadata.id}
                        </a>
                        {" - "}
                        <span>
                          {doc.metadata.created_at
                            ? new Date(
                                doc.metadata.created_at * 1000
                              ).toLocaleDateString()
                            : new Date(
                                doc.metadata.date_created
                              ).toLocaleDateString()}
                        </span>
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
            dialogueElement.who === "assistant" &&
            !dialogueElement.text.includes("I don't know.") &&
            !dialogueElement.text.includes("Sorry, something went wrong.") && (
              <div style={{ margin: "25px 0", width: "100%" }}>
                {geojson === undefined &&
                  overpassQuery === undefined &&
                  !generatingOverpassQuery &&
                  !requestingOverpassApi && (
                    <div style={{ width: "100%", textAlign: "right" }}>
                      <button
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
                      >
                        Search related places
                      </button>
                    </div>
                  )}
                {generatingOverpassQuery && (
                  <div style={{ width: "100%" }}>
                    Generating query for Overpass API, please wait...
                    <span className="blinkingCursor" />
                  </div>
                )}
                {!generatingOverpassQuery && requestingOverpassApi && (
                  <div style={{ width: "100%" }}>
                    Generating query for Overpass API finished.
                  </div>
                )}
                {requestingOverpassApi && overpassQueries && overpassQuery && (
                  <div style={{ width: "100%" }}>
                    Waiting response from Overpass API...
                    {` (${overpassQueries.indexOf(overpassQuery) + 1} / ${
                      overpassQueries.length
                    })`}
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
                        {analyze ? (
                          <div style={{ width: "100%" }}>
                            <strong>Insights from TRIDENT: </strong>
                            {analyze}
                          </div>
                        ) : (
                          <div style={{ width: "100%" }}>
                            Analyzing geospatial characteristics...
                          </div>
                        )}
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
