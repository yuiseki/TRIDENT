import { FeatureCollection } from "geojson";
import * as turf from "@turf/turf";
import { GeoJsonToMarkers } from "../GeoJsonToMarkers";
import { useEffect, useRef, useState } from "react";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { StaticMap } from "../StaticMap";
import { getNominatimResponseJsonWithCache } from "@/utils/getNominatimResponse";
import { getOverpassResponseJsonWithCache } from "@/utils/getOverpassResponse";
import osmtogeojson from "osmtogeojson";

export const StaticRegionsMap: React.FC<{
  mapStyle: string;
  mapPadding?: number;
  regionNames: string[];
}> = ({
  mapStyle = "/map_styles/fiord-color-gl-style/style.json",
  mapPadding = 200,
  regionNames,
}) => {
  const [geojsonWithStyleList, setGeojsonWithStyleList] = useState<
    Array<{
      id: string;
      style: TridentMapsStyle;
      geojson: FeatureCollection;
    }>
  >([]);

  useEffect(() => {
    regionNames.map(async (regionName, idx) => {
      const nominatimResJson = await getNominatimResponseJsonWithCache(
        regionName
      );
      const osmId = nominatimResJson[0].osm_id;
      const overpassQuery = `[out:json][timeout:30000]; nwr(${osmId}); out geom;`;
      const overpassResJson = await getOverpassResponseJsonWithCache(
        overpassQuery
      );
      const newGeojson = osmtogeojson(overpassResJson);
      setGeojsonWithStyleList((prev) => {
        return [
          ...prev,
          {
            id: idx.toString(),
            style: {
              color: "yellow",
              fillColor: "transparent",
            },
            geojson: newGeojson,
          },
        ];
      });
    });
  }, [regionNames]);

  return (
    <StaticMap
      style={mapStyle}
      mapPadding={mapPadding}
      geojsonWithStyleList={geojsonWithStyleList}
    />
  );
};
