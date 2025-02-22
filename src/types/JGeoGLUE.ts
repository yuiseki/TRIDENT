export type JGeoEAGOptions = "全く同じ" | "部分的に一致" | "全く違う";
export type JGeoETAOptions =
  | "都道府県"
  | "市区町村"
  | "町名"
  | "番地"
  | "施設名"
  | "その他";

export type JGeoEAGTask = {
  type: "GeoEAG";
  question: string;
  correctAnswer: JGeoEAGOptions;
};

export type JGeoETATask = {
  type: "GeoETA";
  question: string;
  correctAnswer: JGeoETAOptions;
};

export type JGeoGLUETask = JGeoEAGTask | JGeoETATask;
