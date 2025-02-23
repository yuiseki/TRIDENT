// label: 「隣接」、「近接」、「包含」、「遠隔」、「その他」
// adjacent, close, contain, distant, others
const examples = [
  {
    sentence1: "新宿駅",
    sentence2: "渋谷駅",
    label: "adjacent",
  },
  {
    sentence1: "原宿駅",
    sentence2: "渋谷駅",
    label: "adjacent",
  },
  {
    sentence1: "札幌駅",
    sentence2: "大通公園",
    label: "close",
  },
  {
    sentence1: "大阪市",
    sentence2: "USJ",
    label: "contain",
  },
  {
    sentence1: "東京",
    sentence2: "台東区",
    label: "contain",
  },
  {
    sentence1: "東京タワー",
    sentence2: "東京スカイツリー",
    label: "distant",
  },
  {
    sentence1: "赤レンガ倉庫",
    sentence2: "みなとみらい21",
    label: "close",
  },
];
