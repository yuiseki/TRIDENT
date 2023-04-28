import { DialogueElement } from "@/types/DialogueElement";
import { AvatarIcon } from "../AvatarIcon";

export const DialogueElementItem: React.FC<{
  dialogueElement: DialogueElement;
  dialogueIndex: number;
  isResponding: boolean;
}> = ({ dialogueElement, dialogueIndex, isResponding }) => {
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
            <ul style={{ paddingLeft: "2em" }}>
              {dialogueElement.docs?.map((doc, docIdx) => {
                return (
                  <li
                    key={`${dialogueIndex}-${docIdx}`}
                    style={{
                      minHeight: "1em",
                    }}
                  >
                    <a href={doc[0].metadata.source} target="_blank">
                      {doc[0].metadata.title
                        ? doc[0].metadata.title
                        : doc[0].metadata.source}
                    </a>
                  </li>
                );
              })}
            </ul>
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
        </div>
      </div>
    </div>
  );
};
