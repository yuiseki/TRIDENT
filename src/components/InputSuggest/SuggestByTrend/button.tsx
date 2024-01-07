import styles from "./styles.module.scss";

const suggestLocationTexts = {
  en: "Suggest by trend",
  ja: "トレンドから提案",
};

const getSuggestTrendText = () => {
  const lang = navigator.language;
  if (lang.startsWith("ja")) {
    return suggestLocationTexts.ja;
  }
  return suggestLocationTexts.en;
};

export const SuggestByTrendButton: React.FC<{
  onClick?: () => void;
}> = ({ onClick }) => {
  return (
    <div className={styles.trendButtonWrap}>
      <button className={styles.trendButton} onClick={onClick} disabled={true}>
        {getSuggestTrendText()}
      </button>
    </div>
  );
};
