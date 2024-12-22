import React from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const CountryDisasterMap: React.FC<{ disasters: any[] }> = ({ disasters }) => {
  const geoJSON = {
    type: "FeatureCollection",
    features: disasters,
  };

  return (
    <Map
      initialViewState={{
        longitude: disasters[0]?.geometry.coordinates[0] || 0,
        latitude: disasters[0]?.geometry.coordinates[1] || 0,
        zoom: 5,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="/map_styles/fiord-color-gl-style/style.json"
    >
      <Source id="disasters" type="geojson" data={geoJSON}>
        <Layer
          id="disasters-layer"
          type="circle"
          paint={{
            "circle-radius": 8,
            "circle-color": "#ff0000",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
    </Map>
  );
};

export default CountryDisasterMap;
