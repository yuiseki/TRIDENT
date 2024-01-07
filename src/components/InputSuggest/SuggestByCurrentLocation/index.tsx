import { getNominatimReverseResponseJsonWithCache } from "@/utils/getNominatimReverseResponse";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";
import { useCallback, useEffect, useState } from "react";

import styles from "./styles.module.scss";

export const SuggestByCurrentLocation: React.FC<{
  coordinates: GeolocationCoordinates | null;
  onSelected?: (value: string) => void;
}> = ({ coordinates, onSelected }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [suggests, setSuggests] = useState<string[]>([]);

  useEffect(() => {
    if (!coordinates) {
      return;
    }
    const { longitude, latitude } = coordinates;
    if (!longitude || !latitude) {
      return;
    }
    console.log("onGeolocate", latitude, longitude);
    const thisEffect = async () => {
      const address = await getNominatimReverseResponseJsonWithCache(
        latitude,
        longitude,
        10
      );
      console.log("address", address);
      const name = address.display_name;
      setAddress(name);
      setSuggests([]);
    };
    thisEffect();
  }, [coordinates]);

  useEffect(() => {
    if (!address) {
      return;
    }
    if (suggests.length > 0) {
      return;
    }
    const thisEffect = async () => {
      const resJson = await nextPostJsonWithCache("/api/ai/suggests", {
        query: address,
      });
      console.log(resJson.suggests);
      if (!resJson.suggests) {
        return;
      }
      const newSuggests = resJson.suggests.split("\n");
      setSuggests(newSuggests);
    };
    thisEffect();
  }, [address, suggests]);

  return (
    <div className={styles.geolocationWrap}>
      {address && <div className={styles.suggestAddress}>{address}</div>}
      {coordinates && suggests?.length > 0 && (
        <div className={styles.suggestListWrap}>
          {suggests.map((suggest) => (
            <button
              key={suggest}
              className={styles.suggestListItem}
              onClick={() => {
                if (onSelected) {
                  onSelected(suggest);
                }
              }}
            >
              {suggest}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
