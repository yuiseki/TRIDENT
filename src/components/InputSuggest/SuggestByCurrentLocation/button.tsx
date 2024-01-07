import { useCallback, useState } from "react";
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

export const SuggestByCurrentLocationButton: React.FC<{
  onClick: () => void;
  onChange: ({
    coordinates,
  }: {
    coordinates: GeolocationCoordinates | null;
  }) => void;
}> = ({ onClick, onChange }) => {
  const [geoLocating, setGeoLocating] = useState(false);

  const onGeolocate = useCallback(() => {
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          coordinates: position.coords,
        });
        setGeoLocating(false);
      },
      (error) => {
        onChange({
          coordinates: null,
        });
        setGeoLocating(false);
      }
    );
  }, [onChange]);

  return (
    <div className={styles.currentLocationButtonWrap}>
      <button
        className={styles.currentLocationButton}
        onClick={() => {
          onGeolocate();
          onClick();
        }}
        disabled={geoLocating}
      >
        {geoLocating
          ? `${getSuggestLocationText()}...`
          : getSuggestLocationText()}
      </button>
    </div>
  );
};
