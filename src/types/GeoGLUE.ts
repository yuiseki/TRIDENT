export type GeoEAGOptions = "全く同じ" | "部分的に一致" | "全く違う";
export type GeoETAOptions =
  | "都道府県"
  | "市区町村"
  | "町名"
  | "番地"
  | "施設名"
  | "その他";

export type GeoEAGTask = {
  type: "GeoEAG";
  question: string;
  correctAnswer: GeoEAGOptions;
};

export type GeoETATask = {
  type: "GeoETA";
  question: string;
  correctAnswer: GeoETAOptions;
};

export type GeoGLUETask = GeoEAGTask | GeoETATask;
