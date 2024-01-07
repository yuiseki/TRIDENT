import { getNominatimReverseResponseJsonWithCache } from "@/utils/getNominatimReverseResponse";
import { nextPostJsonWithCache } from "@/utils/nextPostJson";
import { useCallback, useEffect, useState } from "react";

import styles from "./styles.module.scss";

const suggestLocationTexts = {
  en: "Suggest by current location",
  ja: "現在地から提案",
};

const getSuggestLocationText = () => {
  const lang = navigator.language;
  if (lang.startsWith("ja")) {
    return suggestLocationTexts.ja;
  }
  return suggestLocationTexts.en;
};

export const SuggestByCurrentLocation: React.FC<{
  onSelected?: (value: string) => void;
}> = ({ onSelected }) => {
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoLocated, setGeoLocated] = useState(false);
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [suggests, setSuggests] = useState<string[]>([]);

  const onGeolocate = useCallback(() => {
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocating(false);
        setGeoLocated(true);
        setCoordinates(position.coords);
      },
      (error) => {
        setGeoLocating(false);
        setGeoLocated(true);
        setCoordinates(null);
      }
    );
  }, []);

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
      const name = address.name;
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
    <div>
      <div>
        <button
          onClick={onGeolocate}
          disabled={geoLocating}
          className={styles.geolocateButton}
        >
          {geoLocating
            ? `${getSuggestLocationText()}...`
            : getSuggestLocationText()}
        </button>
      </div>
      {geoLocated && address && (
        <div className={styles.suggestAddress}>{address}</div>
      )}
      {!geoLocating && suggests?.length > 0 && (
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
