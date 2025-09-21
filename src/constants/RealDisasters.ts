export const realDisasters: {
  id: string;
  title: string;
  type: string;
  incidents: string[];
  countries: string[];
  description: string;
  responders: string[];
}[] = [
  {
    id: "AC-2025-000098-PAN",
    title: "Panama: River Pollution - Jun 2025",
    type: "Technological Disaster",
    incidents: [
      "コレラおよび水系感染症",
      "水システムの損傷",
      "給水車による支援ニーズ",
      "生計の混乱",
    ],
    countries: ["Panama"],
    description:
      "ラ・ビジャ川の汚染で飲料水供給が停止し、広域で給水支援が必要。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "WF-2025-000109-SYR",
    title: "Syria: Wild Fires - Jul 2025",
    type: "Wild Fire",
    incidents: [
      "大規模避難",
      "大気質の悪化",
      "シェルター・生活必需品ニーズ",
      "健康リスク（煙害）",
    ],
    countries: ["Syria"],
    description: "ラタキア周辺で大規模森林火災が発生し避難と消火支援が継続。",
    responders: ["SARC", "IFRC", "OCHA"],
  },
  {
    id: "FL-2025-000112-HND",
    title: "Honduras: Floods - Jun 2025",
    type: "Flood",
    incidents: ["洪水", "地滑り", "シェルターの損傷", "給水・衛生ニーズ"],
    countries: ["Honduras"],
    description:
      "豪雨による洪水・土砂災害で被害が拡大し、緊急WASHと避難支援が必要。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "ST-2025-000097-GNB",
    title: "Guinea-Bissau: Severe Local Storm - Jun 2025",
    type: "Severe Local Storm",
    incidents: [
      "風による被害",
      "屋根の破壊",
      "停電",
      "給水・衛生ニーズ",
    ],
    countries: ["Guinea-Bissau"],
    description: "ガブ地域を強風と豪雨が直撃し家屋損壊と生活基盤に被害。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "EP-2025-000087-CIV",
    title: "Côte d'Ivoire: Cholera Outbreak - Jun 2025",
    type: "Epidemic",
    incidents: [
      "コレラおよび水系感染症",
      "保健サービスへの負荷",
      "リスクコミュニケーションニーズ",
      "給水・衛生対応",
    ],
    countries: ["Côte d'Ivoire"],
    description: "15年ぶりのコレラ流行が発生し、保健・WASH体制の強化が急務。",
    responders: ["UNICEF", "IFRC", "WHO", "OCHA"],
  },
  {
    id: "FL-2025-000151-YEM",
    title: "Yemen: Floods - Aug 2025",
    type: "Flood",
    incidents: [
      "洪水",
      "インフラの損傷",
      "疾病リスク",
      "シェルター・生活必需品ニーズ",
    ],
    countries: ["Yemen"],
    description: "南部で洪水が発生し数十万人規模で支援需要が増大。",
    responders: ["IRC", "OCHA"],
  },
  {
    id: "WF-2025-000163-BOL",
    title: "Bolivia: Wild Fires - Aug 2025",
    type: "Wild Fire",
    incidents: [
      "大規模山火事",
      "大気質の悪化",
      "生計の混乱",
      "保護リスク",
    ],
    countries: ["Bolivia (Plurinational State of)"],
    description: "東部中心に大規模山林火災が拡大し緊急支援が展開。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "EQ-2025-000153-AFG",
    title: "Afghanistan: Earthquakes - Aug 2025",
    type: "Earthquake",
    incidents: [
      "建物倒壊",
      "大規模避難",
      "外傷・負傷",
      "緊急シェルター",
    ],
    countries: ["Afghanistan"],
    description: "東部でM6.0地震が連続発生し死傷と家屋倒壊が広範に発生。",
    responders: ["IFRC", "OCHA", "IOM", "UNICEF", "WHO"],
  },
  {
    id: "FL-2025-000145-GNQ",
    title: "Equatorial Guinea: Floods - Aug 2025",
    type: "Flood",
    incidents: [
      "都市部洪水",
      "給水・衛生の混乱",
      "健康リスク",
      "シェルターの損傷",
    ],
    countries: ["Equatorial Guinea"],
    description: "マラボを中心に豪雨浸水が発生し都市部のWASH・保健対応が必要。",
    responders: ["IFRC", "OCHA"],
  },
  {
    id: "FL-2025-000126-LAO",
    title: "Lao PDR: Floods - Jul 2025",
    type: "Flood",
    incidents: ["洪水", "地滑り", "交通の混乱", "給水・衛生ニーズ"],
    countries: ["Lao People's Democratic Republic"],
    description: "熱帯低気圧・台風影響の豪雨で各県が冠水し交通と生活がまひ。",
    responders: ["IFRC", "OCHA"],
  },
];
