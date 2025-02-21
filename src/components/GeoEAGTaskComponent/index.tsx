import { GeoEAGOptions, GeoEAGTask } from "@/types/GeoGLUE";
import { useState } from "react";

export const GeoEAGTaskComponent: React.FC<{
  task: GeoEAGTask;
  onNext: () => void;
}> = ({ task, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<GeoEAGOptions | null>(
    null
  );

  const handleSelect = (option: GeoEAGOptions) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption === task.correctAnswer) {
      alert("正解！");
    } else {
      alert("不正解！");
    }

    onNext();
  };

  return (
    <div>
      <h2>{task.question}</h2>
      <ul>
        {task.options.map((option) => (
          <li key={option}>
            <label>
              <input
                type="radio"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleSelect(option)}
              />
              {option}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>回答</button>
    </div>
  );
};
