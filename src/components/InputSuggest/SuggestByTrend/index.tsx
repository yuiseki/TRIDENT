import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";

export const SuggestByTrend: React.FC<{
  onSelect?: (value: string) => void;
}> = ({ onSelect }) => {
  const [trends, setTrends] = useState<string[]>([
    "ガザ地区の避難所を表示して",
    "ウクライナの首都を表示して",
  ]);

  useEffect(() => {
    const thisEffect = async () => {
      const resJson = await nextPostJsonWithCache("/api/ai/trends", {});
      console.log(resJson.trends);
      if (!resJson.trends) {
        return;
      }
      const newTrends = resJson.trends.split("\n");
      setTrends(newTrends);
    };
    //thisEffect();
  }, []);

  return (
    <>
      <div className={styles.suggestListHeader}>Trends</div>
      <div className={styles.suggestListWrap}>
        {trends.map((trend) => {
          return (
            <button
              className={styles.suggestListItem}
              key={trend}
              onClick={() => {
                onSelect && onSelect(trend);
              }}
            >
              {trend}
            </button>
          );
        })}
      </div>
    </>
  );
};
