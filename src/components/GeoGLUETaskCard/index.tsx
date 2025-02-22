import { GeoEAGTask, GeoETATask } from "@/types/JGeoGLUE";
import { useState } from "react";

const GeoEAGOptions = ["✅ 全く同じ", "🟡 部分的に一致", "❌️ 全く違う"];

const GeoETAOptions = [
  "🏞️ 都道府県",
  "🏙️ 市区町村",
  "🏘️ 町名",
  "🏠 番地",
  "🏢 施設名",
  "🏗️ その他",
];

export const GeoGLUETaskCard: React.FC<{
  task: GeoEAGTask | GeoETATask;
  onNext: () => void;
}> = ({ task, onNext }) => {
  const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);

  const options = task.type === "GeoEAG" ? GeoEAGOptions : GeoETAOptions;

  const handleAnswer = (option: string) => {
    setAnswerIsCorrect(option.includes(task.correctAnswer));
  };

  const handleNext = () => {
    setAnswerIsCorrect(null);
    onNext();
  };

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          padding: "20px",
          color: "black",
        }}
      >
        {task.question}
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "space-between",
          alignContent: "space-between",
          justifyContent: "center",
          gap: "20px",
          margin: "20px",
        }}
      >
        {options.map((option) => {
          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              style={{
                border: "none",
                borderRadius: "0.375rem",
                display: "block",
                padding: "10px",
              }}
              disabled={
                answerIsCorrect !== null && option !== task.correctAnswer
              }
            >
              {option}
            </button>
          );
        })}
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            color:
              answerIsCorrect === null
                ? "inherit"
                : answerIsCorrect === true
                ? "green"
                : "red",
            fontWeight: "bold",
          }}
        >
          <img
            width={20}
            height={20}
            src="icons/icon-48x48.png"
            alt="TRIDENT"
            style={{ marginRight: "5px" }}
          />
          {answerIsCorrect === true
            ? "正解!"
            : answerIsCorrect === false
            ? "不正解!"
            : "答えを選択してください"}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleNext}
            disabled={answerIsCorrect === null}
            style={{
              border: "none",
              borderRadius: "0.375rem",
              display: "block",
              padding: "10px",
              backgroundColor:
                answerIsCorrect === null
                  ? "rgba(0, 158, 219, 0.4)"
                  : "rgba(0, 158, 219, 0.8)",
              opacity: answerIsCorrect === null ? 0.8 : 1,
            }}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};
