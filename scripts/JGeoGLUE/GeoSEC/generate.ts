// label: 「方向表現」、「距離・位置表現」、「領域表現」、「面積表現」、「その他」
// direction, distance, area, others
const examples = [
  {
    sentence: "東京で一番広いのは台東区だ",
    label: "area",
  },
  {
    sentence: "台東区は港区より広い",
    label: "area",
  },
  {
    sentence: "渋谷駅の周辺にはカフェが多い",
    label: "area",
  },
  {
    sentence: "台東区の人口は？",
    label: "area",
  },
  {
    sentence: "渋谷ヒカリエは渋谷駅から徒歩10分以内です",
    label: "distance",
  },
  {
    sentence: "私の家は渋谷駅から5キロ離れています",
    label: "distance",
  },
  {
    sentence: "上野駅の南側には人気の居酒屋がたくさんある",
    label: "direction",
  },
  {
    sentence: "道玄坂は渋谷駅の西側だ",
    label: "direction",
  },
];
