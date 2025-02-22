import { JGeoGLUETask } from "@prisma/client";
import { useState } from "react";
import { useSWRConfig } from "swr";

const GeoEAGOptions = [
  { label: "✅ 全く同じ", value: "全く同じ" },
  { label: "🟡 部分的に一致", value: "部分的に一致" },
  { label: "❌️ 全く違う", value: "全く違う" },
];

const GeoETAOptions = [
  { label: "🏞️ 都道府県", value: "都道府県" },
  { label: "🏙️ 市区町村", value: "市区町村" },
  { label: "🏘️ 町名", value: "町名" },
  { label: "🏠 番地", value: "番地" },
  { label: "🏢 施設名", value: "施設名" },
  { label: "🏗️ その他", value: "その他" },
];

export const GeoGLUETaskCard: React.FC<{
  task: JGeoGLUETask;
  onNext: () => void;
}> = ({ task, onNext }) => {
  const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);
  const { mutate } = useSWRConfig();

  const options = task.type === "GeoEAG" ? GeoEAGOptions : GeoETAOptions;

  const handleAnswer = (optionValue: string) => {
    const isCorrect = task.correctAnswer === optionValue;
    setAnswerIsCorrect(isCorrect);
    fetch("/api/tasks/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: {
          taskId: task.id,
          answer: optionValue,
          isCorrect,
        },
      }),
    });
    mutate("/api/q");
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
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              style={{
                border: "none",
                borderRadius: "0.375rem",
                display: "block",
                padding: "10px",
              }}
              disabled={
                answerIsCorrect !== null && option.value !== task.correctAnswer
              }
            >
              {option.label}
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
