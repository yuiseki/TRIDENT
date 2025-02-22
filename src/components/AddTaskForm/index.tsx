import { useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import {
  JGeoGLUETaskType,
  GeoEAGOptions,
  GeoETAOptions,
  GeoQICOptions,
  GeoRCCOptions,
  GeoSECOptions,
  JGeoGLUETaskTypes,
} from "@/constants/JGeoGLUE";

export const AddTaskForm: React.FC = () => {
  const [type, setType] = useState<JGeoGLUETaskType | "">("");
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
      setType("");
      setQuestion("");
      setCorrectAnswer("");
    } else {
      const data = await res.json();
      console.error(data);
      alert(`Failed to add task, ${data.error}`);
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
            onChange={(e) => setType(e.target.value as JGeoGLUETaskType)}
            style={{
              fontSize: "1.2rem",
              padding: "0.5rem",
            }}
          >
            <option value="">Select Task Type</option>
            {JGeoGLUETaskTypes.map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
          </select>
        </div>
        <div>
          {(() => {
            switch (type) {
              case "GeoEAG":
                return (
                  <p>
                    GeoEAG(Geographic Entity AliGnment):
                    2つの地名が同じかどうかを判定
                  </p>
                );
              case "GeoETA":
                return (
                  <p>
                    GeoETA(Geographic Elements TAgging):
                    与えられた地名の種類を判定
                  </p>
                );
              case "GeoQIC":
                return (
                  <p>
                    GeoQIC(Geospatial Query Intent Classification):
                    文章の地理的な質問意図を分類
                  </p>
                );
              case "GeoSEC":
                return (
                  <p>
                    GeoSEC(Geospatial Spatial Expression Classification):
                    文章内の空間表現を分類
                  </p>
                );
              case "GeoRCC":
                return (
                  <p>
                    GeoRCC(Geospatial Relation Classification):
                    文章内の2つの地名の関係を分類
                  </p>
                );
              default:
                return <p></p>;
            }
          })()}
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
          {(() => {
            let options: { label: string; value: string }[] = [];
            switch (type) {
              case "GeoEAG":
                options = GeoEAGOptions;
                break;
              case "GeoETA":
                options = GeoETAOptions;
                break;
              case "GeoQIC":
                options = GeoQICOptions;
                break;
              case "GeoSEC":
                options = GeoSECOptions;
                break;
              case "GeoRCC":
                options = GeoRCCOptions;
                break;
              default:
                options = [];
                break;
            }
            console.log(options);
            return options.map((option) => (
              <label
                key={option.value}
                style={{
                  fontSize: "1.2rem",
                  padding: "0.5rem",
                }}
              >
                <input
                  type="radio"
                  name="correctAnswer"
                  value={option.value}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  style={{
                    marginRight: "0.25rem",
                  }}
                />
                {option.label}
              </label>
            ));
          })()}
        </div>
        <br />
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            fontSize: "1.2rem",
            padding: "0.5rem",
          }}
        >
          Add Task
        </button>
      </form>
    </div>
  );
};
