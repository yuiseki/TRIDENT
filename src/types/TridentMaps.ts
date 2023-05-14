export type TridentMapsStyle = {
  borderColor?: string;
  fillColor?: string;
  emoji?: string;
};

type TridentMapsSubject = {
  name: string;
  style: TridentMapsStyle;
  query: string;
};

type TridentMapsArea = {
  name: string;
  style: TridentMapsStyle;
  query: string;
  subjects: TridentMapsSubject[];
};

export type TridentMaps = {
  areas: TridentMapsArea[];
};
