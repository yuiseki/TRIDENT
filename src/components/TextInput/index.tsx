import { useRef } from "react";

export const TextInput = ({
  disabled,
  placeholder,
  inputText,
  setInputText,
  onSubmit,
}: {
  disabled: boolean;
  placeholder: string;
  inputText: string;
  setInputText: (inputText: string) => void;
  onSubmit: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={textareaRef}
        value={inputText}
        placeholder={placeholder}
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
        style={{
          overflowY: "hidden",
          resize: "none",
          minHeight: "50px",
          maxHeight: "200px",
          whiteSpace: "pre-wrap",
          height: "auto",
          width: "100%",
          color: "rgba(0, 0, 0, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "2px",
          padding: "8px 46px 8px 12px",
          fontWeight: 400,
        }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          position: "absolute",
          bottom: 18,
          right: 15,
          color: "rgb(253, 254, 255)",
          backgroundColor: "rgba(0, 158, 219, 1)",
          boxShadow: "0 2px 6px 0 rgba(0, 158, 219, 0.6)",
          border: "2px solid rgba(0, 158, 219, 0.6)",
          borderRadius: "2px",
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