import { LocationContext } from "@/contexts/LocationContext";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";
import { useContext, useEffect, useState } from "react";

import styles from "./styles.module.scss";
import { DialogueElement } from "@/types/DialogueElement";

export const InputPredict: React.FC<{
  dialogueList: DialogueElement[];
  onUpdateSuggestions?: () => void;
  onSelect?: (value: string) => void;
}> = ({ dialogueList, onUpdateSuggestions, onSelect }) => {
  const locationInfo = useContext(LocationContext);
  const [requesting, setRequesting] = useState(false);
  const [suggests, setSuggests] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (requesting) {
      return;
    }
    const thisEffect = async () => {
      setRequesting(true);
      const resJson = await nextPostJsonWithCache("/api/ai/suggests", {
        lang: window.navigator.language,
        location: locationInfo.center,
        dialogueList: dialogueList
          .filter((d) => d.who === "user")
          .map((d) => d.text)
          .join("\n"),
      });
      if (!resJson.suggests) {
        return;
      }
      const newSuggests = resJson.suggests.split("\n");
      setSuggests(newSuggests);
      onUpdateSuggestions && onUpdateSuggestions();
      setRequesting(false);
    };
    thisEffect();
  }, [dialogueList, locationInfo, onUpdateSuggestions, requesting]);

  return (
    <>
      <div className={styles.suggestListWrap}>
        {suggests?.map((suggest) => {
          return (
            <button
              className={styles.suggestListItem}
              key={suggest}
              onClick={() => {
                onSelect && onSelect(suggest);
              }}
            >
              {suggest}
            </button>
          );
        })}
      </div>
    </>
  );
};
