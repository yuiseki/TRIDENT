/* eslint-disable @next/next/no-img-element */
import { DialogueElement } from "@/types/DialogueElement";
import { AvatarIcon } from "@/components/AvatarIcon";
import styles from "./styles.module.css";

export const DialogueElementView: React.FC<{
  dialogueElement: DialogueElement;
  dialogueIndex: number;
  isResponding: boolean;
}> = ({ dialogueElement, dialogueIndex, isResponding }) => {
  return (
    <div
      className={`${styles.dialogueElementView} ${
        dialogueElement.who === "assistant"
          ? styles.dialogueElementViewAssistant
          : styles.dialogueElementViewHuman
      }`}
      key={dialogueIndex}
    >
      <div
        className="avatarIconWrap"
        style={{
          display: "flex",
          justifyItems: "center",
          flexShrink: 0,
        }}
      >
        <AvatarIcon who={dialogueElement.who} />
      </div>
      <div className="dialogueElementWrap">
        <div
          className="dialogueTextWrap"
          style={{
            paddingLeft: "5px",
            paddingRight: "5px",
            flexGrow: 1,
            maxWidth: "100%",
          }}
        >
          {dialogueElement.text?.split("\n").map((row, rowIdx) => {
            return (
              <div
                className="dialogueTextRow"
                key={`${dialogueIndex}-${rowIdx}`}
                style={{
                  minHeight: "1em",
                  maxWidth: "100%",
                  wordBreak: "break-all",
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
