import { MAP_STYLE_PRESETS } from "@/constants/MapStylePresets";
import styles from "./styles.module.scss";

export const MapStyleSelector: React.FC<{
  mapStyleJsonUrl: string;
  onSelectMapStyleJsonUrl: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ mapStyleJsonUrl, onSelectMapStyleJsonUrl }) => {
  return (
    <select
      className={styles.select}
      value={mapStyleJsonUrl}
      onChange={onSelectMapStyleJsonUrl}
    >
      {MAP_STYLE_PRESETS.map((preset) => (
        <option key={preset.id} value={preset.url}>
          {preset.label}
        </option>
      ))}
    </select>
  );
};
