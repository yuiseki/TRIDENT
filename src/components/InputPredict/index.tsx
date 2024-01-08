import { LocationContext } from "@/contexts/LocationContext";
import { DialogueElement } from "@/types/DialogueElement";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";
import { useContext, useEffect, useState } from "react";

import styles from "./styles.module.scss";

export const InputPredict: React.FC<{
  pastMessages?: any[];
  onUpdateSuggestions?: () => void;
  onSelected?: (value: string) => void;
}> = ({ pastMessages, onUpdateSuggestions, onSelected }) => {
  const locationInfo = useContext(LocationContext);
  const [requesting, setRequesting] = useState(false);
  const [suggests, setSuggests] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (!pastMessages) {
      return;
    }
    if (pastMessages.length === 0) {
      return;
    }
    if (requesting) {
      return;
    }
    const thisEffect = async () => {
      setRequesting(true);
      const resJson = await nextPostJsonWithCache("/api/ai/suggests", {
        lang: window.navigator.language,
        location: locationInfo.location,
        pastMessages: JSON.stringify(pastMessages),
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
  }, [locationInfo, onUpdateSuggestions, pastMessages, requesting]);

  return (
    <>
      <div className={styles.suggestListWrap}>
        {suggests?.map((suggest) => {
          return (
            <button
              className={styles.suggestListItem}
              key={suggest}
              onClick={() => {
                onSelected && onSelected(suggest);
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
