import React, { createContext } from "react";

export type LocationInfo = {
  location: string | undefined;
};

export const LocationContext = createContext<LocationInfo>({
  location: undefined,
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

