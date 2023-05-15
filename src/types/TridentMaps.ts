export type TridentMapsStyle = {
  color?: string;
  emoji?: string;
};

type TridentMapsConcern = {
  name: string;
  style: TridentMapsStyle;
  query: string;
};

type TridentMapsArea = {
  name: string;
  style: TridentMapsStyle;
  query: string;
  concerns: TridentMapsConcern[];
};

export type TridentMaps = {
  areas: TridentMapsArea[];
};
