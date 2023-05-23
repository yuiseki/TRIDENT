/* eslint-disable @next/next/no-img-element */
import { RefObject, useCallback, useRef } from "react";

export const TextInput = ({
  disabled,
  placeholder,
  inputText,
  setInputText,
  onSubmit,
  textareaRef,
}: {
  disabled: boolean;
  placeholder: string;
  inputText: string;
  setInputText: (inputText: string) => void;
  onSubmit: () => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
}) => {
  //const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> =
    useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          console.log(
            "TextInput: onKeyDown, ctrl + Enter,",
            event.currentTarget.value,
            event.currentTarget.value.length
          );
          if (0 < event.currentTarget.value.length) {
            onSubmit();
          }
        }
      },
      [onSubmit]
    );

  return (
    <div className="textInput" style={{ position: "relative" }}>
      <textarea
        className="textInputTextarea"
        ref={textareaRef}
        value={inputText}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = "0px";
              textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
            }
          }, 100);
          setInputText(e.currentTarget.value);
        }}
        rows={inputText ? inputText.split("\n").length : 1}
        maxLength={400}
      />
      <button
        className="textInputButton"
        onClick={onSubmit}
        disabled={disabled}
        style={{
          display: "block",
          padding: "4px",
          height: "34px",
          width: "34px",
        }}
      >
        <img
          style={{ height: "24px", width: "24px" }}
          src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
          alt="Request information retrieval"
          title="Request information retrieval"
        />
      </button>
    </div>
  );
};
