import { FeatureCollection } from "geojson";
import * as turf from "@turf/turf";
import { GeoJsonToSourceLayer } from "../GeoJsonToSourceLayer";
import { useEffect, useRef, useState } from "react";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { StaticMap } from "../StaticMap";
import { getNominatimResponseJsonWithCache } from "@/lib/osm/getNominatim";
import { getOverpassResponseJsonWithCache } from "@/lib/osm/getOverpass";
import osmtogeojson from "osmtogeojson";

export const StaticRegionsMap: React.FC<{
  mapStyle: string | maplibregl.StyleSpecification;
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
      if (nominatimResJson.length === 0) {
        return;
      }
      const osmId = nominatimResJson[0].osm_id;
      console.log(regionName, osmId);
      const overpassQuery = `[out:json][timeout:30000]; nwr(${osmId}); out geom;`;
      const overpassResJson = await getOverpassResponseJsonWithCache(
        overpassQuery
      );
      const newGeojson = osmtogeojson(overpassResJson);
      setGeojsonWithStyleList((prev) => {
        return [
          ...prev,
          {
            regionName,
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
