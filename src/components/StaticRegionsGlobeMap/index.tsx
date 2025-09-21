import { FeatureCollection } from "geojson";
import { StyleSpecification } from "react-map-gl/maplibre";
import { useEffect, useState } from "react";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { StaticMap } from "../StaticMap";
import { getNominatimResponseJsonWithCache } from "@/lib/osm/getNominatim";
import { getOverpassResponseJsonWithCache } from "@/lib/osm/getOverpass";
import osmtogeojson from "osmtogeojson";

export const StaticRegionsGlobeMap: React.FC<{
  children?: any;
  mapStyle: string | StyleSpecification;
  mapPadding?: number;
  regionNames: string[];
  showAttribution?: boolean;
  showControls?: boolean;
}> = ({
  children,
  mapStyle = "/map_styles/fiord-color-gl-style/style.json",
  mapPadding = 50,
  regionNames,
  showAttribution = false,
  showControls = false,
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
      const overpassQuery = `[out:json][timeout:30000]; relation(${osmId}); out geom;`;
      const overpassResJson = await getOverpassResponseJsonWithCache(
        overpassQuery
      );
      const newGeojson = osmtogeojson(overpassResJson) as FeatureCollection;
      setGeojsonWithStyleList((prev) => {
        return [
          ...prev,
          {
            regionName,
            id: `region-${idx}-${osmId}`,
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
      projection="globe"
      showAtmosphere={true}
      showAttribution={showAttribution}
      showControls={showControls}
      maxZoom={1.3}
    >
      {children}
    </StaticMap>
  );
};
