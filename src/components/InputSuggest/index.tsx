import { useCallback, useState } from "react";
import { SuggestByCurrentLocation } from "./SuggestByCurrentLocation";
import { SuggestByTrendButton } from "./SuggestByTrend/button";

import styles from "./styles.module.scss";
import { SuggestByCurrentLocationButton } from "./SuggestByCurrentLocation/button";
import { SuggestByTrend } from "./SuggestByTrend";

export const InputSuggest: React.FC<{
  onSelect?: (value: string) => void;
  onChangeLocation?: (location: string) => void;
}> = ({ onSelect, onChangeLocation }) => {
  const [suggestMode, setSuggestMode] = useState<"location" | "trend" | null>(
    null
  );
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );

  const onChangeSuggestByCurrentLocation = useCallback(
    ({ coordinates }: { coordinates: GeolocationCoordinates | null }) => {
      setCoordinates(coordinates);
    },
    []
  );

  return (
    <div className={styles.inputSuggestWrap}>
      <div className={styles.inputSuggestButtonsWrap}>
        <SuggestByCurrentLocationButton
          onClick={() => {
            setSuggestMode("location");
          }}
          onChange={onChangeSuggestByCurrentLocation}
        />
        <SuggestByTrendButton
          onClick={() => {
            setSuggestMode("trend");
          }}
        />
      </div>
      {suggestMode === "location" && (
        <SuggestByCurrentLocation
          coordinates={coordinates}
          onSelect={onSelect}
          onChangeLocation={onChangeLocation}
        />
      )}
      {suggestMode === "trend" && <SuggestByTrend onSelect={onSelect} />}
    </div>
  );
};
