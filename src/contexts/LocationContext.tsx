import { LngLatBoundsLike, LngLatLike } from "maplibre-gl";
import React, { createContext } from "react";

export type LocationInfo = {
  center: LngLatLike | undefined;
  bounds: LngLatBoundsLike | undefined;
};

export const LocationContext = createContext<LocationInfo>({
  center: undefined,
  bounds: undefined,
});

export const LocationProvider = ({
  locationInfo,
  children,
}: {
  locationInfo: LocationInfo;
  children: React.ReactNode;
}) => {
  return (
    <LocationContext.Provider value={locationInfo}>
      {children}
    </LocationContext.Provider>
  );
};
