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
      <option value={"/map_styles/fiord-color-gl-style/style.json"}>
        🌍 OSM Fiord color (vector)
      </option>
      <option value={"/map_styles/dark-matter-gl-style/style.json"}>
        🌍 OSM Dark Matter (vector)
      </option>
      <option
        value={"https://tile.openstreetmap.jp/styles/osm-bright/style.json"}
      >
        🌍 OSM JP Bright (vector)
      </option>
      <option value={"https://tile.yuiseki.net/styles/osm-fiord/style.json"}>
        🌍 yuiseki Fiord color (vector)
      </option>
      <option value={"https://tile.yuiseki.net/styles/osm-bright/style.json"}>
        🌍 yuiseki Bright (vector)
      </option>
      <option value={"/map_styles/osm-hot/style.json"}>
        🗺️ OSM HOT (raster)
      </option>
      <option value={"/map_styles/arcgis-world-imagery/style.json"}>
        🛰 ArcGIS World Imagery (raster)
      </option>
    </select>
  );
};
