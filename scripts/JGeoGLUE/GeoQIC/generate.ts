// GeoQIC: Geospatial Query Intent Classification
// 具体例
// sentence: 台東区のラーメン屋を教えて
// label: 「地名検索」、「経路検索」、「施設情報検索」、「レビュー検索」、「その他」
// name, route, facilities, facility_detail, review, statistics, others

const examples = [
  {
    sentence: "新宿駅から渋谷駅まで",
    label: "route",
  },
  {
    sentence: "東京タワーに行きたい",
    label: "route",
  },
  {
    sentence: "大阪城の入場料は？",
    label: "facility",
  },
  {
    sentence: "東京スカイツリーの営業時間は？ ",
    label: "facility",
  },
  {
    sentence: "台東区の家系ラーメンを教えて",
    label: "review",
  },
  {
    sentence: "台東区の人口は？",
    label: "statistics",
  },
  {
    sentence: "渋谷周辺のオススメのレストランを教えて",
    label: "review",
  },
];
