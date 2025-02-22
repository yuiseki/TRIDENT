import { useMemo, useState } from "react";
import { useSWRConfig } from "swr";

export const AddTaskForm: React.FC = () => {
  const [type, setType] = useState<"GeoEAG" | "GeoETA" | undefined>(undefined);
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const { mutate } = useSWRConfig();

  const canSubmit = useMemo(() => {
    return !!question && !!correctAnswer && !!type;
  }, [question, correctAnswer, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    const body = {
      task: {
        type,
        question,
        correctAnswer,
      },
    };

    const res = await fetch("/api/q", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setType(undefined);
      setQuestion("");
      setCorrectAnswer("");
    }
    mutate("/api/q");
  };

  return (
    <div
      style={{
        margin: "20px auto",
        width: "80vw",
        padding: "20px",
        backgroundColor: "white",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        Add New Task
      </h2>
      <form onSubmit={handleSubmit}>
        <div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "GeoEAG" | "GeoETA")}
            style={{
              fontSize: "1.2rem",
              padding: "0.5rem",
            }}
          >
            <option value="">Select Task Type</option>
            <option value="GeoEAG">GeoEAG</option>
            <option value="GeoETA">GeoETA</option>
          </select>
        </div>
        <div>
          {type === "GeoEAG" && (
            <p>
              GeoEAG(Geographic Entity AliGnment): 2つの地名が同じかどうかを判定
            </p>
          )}
          {type === "GeoETA" && (
            <p>
              GeoETA(Geographic Elements TAgging): 与えられた地名の種類を判定
            </p>
          )}
        </div>
        <div
          style={{
            marginTop: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{
              fontSize: "1.2rem",
              padding: "0.5rem",
              width: "50%",
            }}
          />
        </div>
        <div
          style={{
            marginTop: "1rem",
            fontSize: "1.2rem",
          }}
        >
          {type === "GeoEAG" && (
            <>
              {["全く同じ", "部分的に一致", "全く違う"].map((answer) => (
                <label
                  key={answer}
                  style={{
                    fontSize: "1.2rem",
                    padding: "0.5rem",
                  }}
                >
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={answer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    style={{
                      marginRight: "0.25rem",
                    }}
                  />
                  {answer}
                </label>
              ))}
            </>
          )}
          {type === "GeoETA" && (
            <>
              {["都道府県", "市区町村", "町名", "番地", "施設名", "その他"].map(
                (answer) => (
                  <label
                    key={answer}
                    style={{
                      fontSize: "1.2rem",
                      padding: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={answer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      style={{
                        marginRight: "0.25rem",
                      }}
                    />
                    {answer}
                  </label>
                )
              )}
            </>
          )}
        </div>
        <br />
        <button type="submit" disabled={!canSubmit}>
          Add Task
        </button>
      </form>
    </div>
  );
};
