export type JGeoGLUETaskType = (typeof JGeoGLUETaskTypes)[number];
export const JGeoGLUETaskTypes = [
  "GeoEAG",
  "GeoETA",
  "GeoQIC",
  "GeoSEC",
  "GeoRCC",
] as const;

// GeoEAG: Geographic Entity AliGnment
// 2つの地名が同じかどうかを判定
export const GeoEAGOptions = [
  { label: "✅ 全く同じ", value: "全く同じ" },
  { label: "🟡 部分的に一致", value: "部分的に一致" },
  { label: "❌️ 全く違う", value: "全く違う" },
];

// GeoETA: Geographic Elements TAgging
// 与えられた地名の種類を判定
export const GeoETAOptions = [
  { label: "🏞️ 都道府県", value: "都道府県" },
  { label: "🏙️ 市区町村", value: "市区町村" },
  { label: "🏘️ 町名", value: "町名" },
  { label: "🏠 番地", value: "番地" },
  { label: "🏢 施設名", value: "施設名" },
  { label: "🏗️ その他", value: "その他" },
];

// GeoQIC: Geospatial Query Intent Classification
// 文章の地理的な質問意図を分類
export const GeoQICOptions = [
  { label: "地名検索", value: "地名検索" },
  // 新宿駅から渋谷駅まで。
  { label: "経路検索", value: "経路検索" },
  // 六本木ヒルズ森タワーの営業時間は？
  // 大阪城の営業時間と入場料は？
  { label: "施設情報検索", value: "施設情報検索" },
  // 渋谷周辺のオススメのレストランを教えて。
  // 東京駅周辺のレストランを教えて。
  { label: "レビュー検索", value: "レビュー検索" },
  { label: "その他", value: "その他" },
];

// GeoSEC: Geospatial Spatial Expression Classification
// 文章内の空間表現を分類
export const GeoSECOptions = [
  // 渋谷駅の北側
  // 上野駅の北側にあるカフェは人気がある
  { label: "方向表現", value: "方向表現" },
  // 徒歩10分
  // あのカフェはここから5キロ離れています
  // 渋谷ヒカリエは渋谷駅から徒歩10分以内に位置している。
  { label: "距離・位置表現", value: "距離・位置表現" },
  // 台東区の人口は？
  // 渋谷駅の周辺にはカフェが多い。
  { label: "領域表現", value: "領域表現" },
  // 台東区は港区より広い。
  // 東京で一番広いのは台東区だ。
  { label: "面積表現", value: "面積表現" },
  { label: "その他", value: "その他" },
];

// GeoRCC: Geospatial Relation Classification
// 文章内の2つの地名の地理的関係を分類
export const GeoRCCOptions = [
  // 「渋谷駅」と「原宿駅」の地理的関係は？
  { label: "隣接", value: "隣接" },
  // 「赤レンガ倉庫」と「みなとみらい21」の地理的関係は？
  // 「札幌駅」と「大通公園」の地理的関係は？
  { label: "近接", value: "近接" },
  // 「大阪市」と「USJ」の地理的関係は？
  { label: "包含", value: "包含" },
  // 「東京タワー」と「東京スカイツリー」の地理的関係は？
  { label: "遠隔", value: "遠隔" },
  { label: "その他", value: "その他" },
];
