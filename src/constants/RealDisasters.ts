export const realDisasters: {
  id: string;
  updatedAt: Date;
  title: string;
  description: string;
  type: string;
  countries: string[];
  organizations: string[];
  activitiesCount: number;
  adminUnitsCount: number;
  priorityNeeds: string[];
  sources: { url: string; title: string }[];
}[] = [
  {
    id: "AC-2025-000098-PAN",
    updatedAt: new Date("2025-09-18"),
    title: "Panama: River Pollution - Jun 2025",
    description:
      "ラ・ビジャ川流域の水質汚染で飲料水供給が停止し、広域で給水支援が必要。",
    type: "Technological Disaster",
    countries: ["Panama"],
    organizations: ["IFRC", "Red Cross Society of Panama"],
    activitiesCount: 0,
    adminUnitsCount: 2, // Herrera, Los Santos
    priorityNeeds: [
      "安全な飲料水の確保（給水・浄水）",
      "家庭用貯水・容器配布（タンク/ジェリカン）",
      "水の安全と衛生に関するリスクコミュニケーション",
    ],
    sources: [
      {
        url: "https://reliefweb.int/disaster/ac-2025-000098-pan",
        title: "ReliefWeb: Panama: River Pollution - Jun 2025",
      },
      {
        url: "https://www.ifrc.org/appeals",
        title: "IFRC Appeals: Panama - Biological River Pollution (MDRPA021)",
      },
    ],
  },
  {
    id: "WF-2025-000109-SYR",
    updatedAt: new Date("2025-07-07"),
    title: "Syria: Wild Fires - Jul 2025",
    description: "ラタキア周辺で大規模森林火災が発生し避難と消火支援が継続。",
    type: "Wild Fire",
    countries: ["Syria"],
    organizations: ["Syrian Arab Red Crescent (SARC)", "IFRC", "OCHA", "UNHCR"],
    activitiesCount: 0,
    adminUnitsCount: 5, // Lattakia, Tartous, Homs, Hama, Idleb
    priorityNeeds: [
      "消火・給水支援（水輸送/タンク）",
      "緊急シェルターとNFI",
      "煙害への保健対応（呼吸器系・応急手当）",
    ],
    sources: [
      {
        url: "https://www.unocha.org/publications/report/syrian-arab-republic/syrian-arab-republic-flash-update-wildfires-lattakia-no1-7-july-2025",
        title: "OCHA Flash Update: Wildfires in Lattakia (No.1)",
      },
      {
        url: "https://prddsgofilestorage.blob.core.windows.net/api/sitreps/7554/5fcd513d411a4eefaac15cd04d07fc22/SARC_Situation_Report__Wildfires_Emergency_ITfslpj.pdf",
        title:
          "SARC Situation Report: Wildfires Emergency Response (1–7 Jul 2025)",
      },
    ],
  },
  {
    id: "FL-2025-000112-HND",
    updatedAt: new Date("2025-07-11"),
    title: "Honduras: Floods - Jun 2025",
    description:
      "豪雨による洪水・土砂災害で被害が拡大し、緊急WASHと避難支援が必要。",
    type: "Flood",
    countries: ["Honduras"],
    organizations: ["IFRC", "Honduran Red Cross"],
    activitiesCount: 0,
    adminUnitsCount: 1, // Ocotepeque（開始地点）
    priorityNeeds: [
      "WASH（安全な飲料水）",
      "緊急シェルター/NFI",
      "被災地域の迅速な評価と救援",
    ],
    sources: [
      {
        url: "https://reliefweb.int/disaster/fl-2025-000112-hnd",
        title: "ReliefWeb: Honduras: Floods - Jun 2025",
      },
      {
        url: "https://reliefweb.int/report/honduras/honduras-floods-dref-operation-mdrhn026",
        title: "IFRC DREF: Honduras Floods (MDRHN026)",
      },
    ],
  },
  {
    id: "ST-2025-000097-GNB",
    updatedAt: new Date("2025-06-23"),
    title: "Guinea-Bissau: Severe Local Storm - Jun 2025",
    description: "ガブ地域を強風と豪雨が直撃し家屋損壊と生活基盤に被害。",
    type: "Severe Local Storm",
    countries: ["Guinea-Bissau"],
    organizations: ["IFRC", "Red Cross of Guinea-Bissau"],
    activitiesCount: 0,
    adminUnitsCount: 1, // Gabu region
    priorityNeeds: ["屋根・家屋修繕（シェルター）", "NFI配布", "WASH支援"],
    sources: [
      {
        url: "https://reliefweb.int/disaster/st-2025-000097-gnb",
        title: "ReliefWeb: Guinea-Bissau: Severe Local Storm - Jun 2025",
      },
      {
        url: "https://reliefweb.int/report/guinea-bissau/guinea-bissau-windstorm-dref-operation-mdrgw006",
        title: "IFRC DREF: Guinea-Bissau Windstorm (MDRGW006)",
      },
    ],
  },
  {
    id: "EP-2025-000087-CIV",
    updatedAt: new Date("2025-08-11"),
    title: "Côte d'Ivoire: Cholera Outbreak - Jun 2025",
    description: "15年ぶりのコレラ流行が発生し、保健・WASH体制の強化が急務。",
    type: "Epidemic",
    countries: ["Côte d'Ivoire"],
    organizations: ["IFRC", "Red Cross of Côte d'Ivoire", "UNICEF", "WHO"],
    activitiesCount: 0,
    adminUnitsCount: 1, // Abidjan Autonomous District
    priorityNeeds: [
      "コレラ症例管理（保健）",
      "WASH（塩素処理・安全な水）",
      "RCCE（リスクコミュニケーション/コミュニティ啓発）",
    ],
    sources: [
      {
        url: "https://go-api.ifrc.org/api/downloadfile/91392/MDRCI018do",
        title: "IFRC DREF: Côte d’Ivoire Cholera Outbreak (MDRCI018)",
      },
      {
        url: "https://reliefweb.int/updates?advanced-search=%28D52388%29&list=C%C3%B4te+d%26%23039%3BIvoire%3A+Cholera+Outbreak+-+Jun+2025+Updates",
        title: "ReliefWeb Updates: Côte d’Ivoire Cholera Outbreak - Jun 2025",
      },
    ],
  },
  {
    id: "FL-2025-000151-YEM",
    updatedAt: new Date("2025-09-15"),
    title: "Yemen: Floods - Aug 2025",
    description: "南部で洪水が発生し数十万人規模で支援需要が増大。",
    type: "Flood",
    countries: ["Yemen"],
    organizations: [
      "Shelter Cluster Yemen",
      "CCCM Cluster Yemen",
      "AFD",
      "DRC",
      "IOM",
      "IRC",
      "KSRELIEF",
      "NRC",
      "UNHCR",
      "YRCS",
    ],
    activitiesCount: 0, // 3W活動件数は未公開（Partners Responding=20）
    adminUnitsCount: 70, // Districts affected
    priorityNeeds: [
      "NFIキット",
      "緊急シェルターキット",
      "シェルター修繕キット",
    ],
    sources: [
      {
        url: "https://s3.eu-north-1.amazonaws.com/cdn.sheltercluster.org/public/docs/Shelter%20and%20CCCM%20Clusters%20Flood%20Update%20Dashboard%2014092025_0.pdf",
        title:
          "Shelter & CCCM Clusters: Flood Update Dashboard (As of 15 Sep 2025)",
      },
      {
        url: "https://reliefweb.int/report/yemen/yemen-flooding-situation-update-no-01-3-september-2025",
        title: "OCHA: Yemen Flooding — Situation Update No.01",
      },
    ],
  },
  {
    id: "WF-2025-000163-BOL",
    updatedAt: new Date("2025-08-05"),
    title: "Bolivia: Wild Fires - Aug 2025",
    description: "東部中心に大規模山林火災が拡大し緊急支援が展開。",
    type: "Wild Fire",
    countries: ["Bolivia (Plurinational State of)"],
    organizations: ["IFRC", "Bolivian Red Cross"],
    activitiesCount: 0,
    adminUnitsCount: 0, // 未確定
    priorityNeeds: [
      "避難・緊急シェルター/NFI",
      "煙害・呼吸器系への保健対応",
      "生計・農業被害への初期回復支援",
    ],
    sources: [
      {
        url: "https://reliefweb.int/report/bolivia-plurinational-state/bolivia-wildfires-ifrc-noaa-cpc-echo-daily-flash-16-august-2025",
        title: "ECHO Daily Flash: Bolivia — Wildfires (Aug 2025)",
      },
    ],
  },
  {
    id: "EQ-2025-000153-AFG",
    updatedAt: new Date("2025-09-18"),
    title: "Afghanistan: Earthquakes - Aug 2025",
    description: "東部でM6.0地震が連続発生し死傷と家屋倒壊が広範に発生。",
    type: "Earthquake",
    countries: ["Afghanistan"],
    organizations: ["IOM", "IFRC", "WHO", "OCHA"],
    activitiesCount: 0,
    adminUnitsCount: 5, // Kunar, Nangarhar, Laghman, Nuristan, Panjshir
    priorityNeeds: [
      "緊急シェルター",
      "外傷・救命医療",
      "WASH（安全な水・衛生）",
    ],
    sources: [
      {
        url: "https://reliefweb.int/report/afghanistan/flash-update-earthquake-nangarhar-afghanistan-august-31-2-september-2025",
        title: "OCHA Flash Update: Earthquake — Nangarhar, Afghanistan",
      },
      {
        url: "https://reliefweb.int/report/afghanistan/iom-flash-appeal-afghanistan-earthquake-response-31-august-2025-31-august-2026",
        title: "IOM Flash Appeal: Afghanistan Earthquake Response",
      },
      {
        url: "https://reliefweb.int/report/afghanistan/afghanistan-earthquake-who-situation-report-no-11-18-september-2025",
        title: "WHO Situation Report No.11 (18 Sep 2025)",
      },
    ],
  },
  {
    id: "FL-2025-000145-GNQ",
    updatedAt: new Date("2025-08-25"),
    title: "Equatorial Guinea: Floods - Aug 2025",
    description: "マラボを中心に豪雨浸水が発生し都市部のWASH・保健対応が必要。",
    type: "Flood",
    countries: ["Equatorial Guinea"],
    organizations: ["IFRC", "Equatorial Guinea Red Cross"],
    activitiesCount: 0,
    adminUnitsCount: 0, // 未確定（首都マラボの複数地区）
    priorityNeeds: [
      "WASH（浄水・衛生）",
      "緊急シェルター/NFI",
      "保健サービスの補強",
    ],
    sources: [
      {
        url: "https://reliefweb.int/disaster/fl-2025-000145-gnq",
        title: "ReliefWeb: Equatorial Guinea: Floods - Aug 2025",
      },
      {
        url: "https://reliefweb.int/report/equatorial-guinea/equatorial-guinea-i-flood-2025-i-dref-operation-no-mdrgq006",
        title: "IFRC DREF: Equatorial Guinea Flood 2025 (MDRGQ006)",
      },
    ],
  },
  {
    id: "FL-2025-000126-LAO",
    updatedAt: new Date("2025-08-29"),
    title: "Lao PDR: Floods - Jul 2025",
    description: "熱帯低気圧の豪雨で各県が冠水し交通と生活がまひ。",
    type: "Flood",
    countries: ["Lao People's Democratic Republic"],
    organizations: ["IFRC", "Lao Red Cross"],
    activitiesCount: 0,
    adminUnitsCount: 4, // Xiengkhouang, Bolikhamxai, Louangphabang, Vientiane (Prov/Capital)
    priorityNeeds: [
      "WASH（安全な飲料水）",
      "緊急シェルター/NFI",
      "アクセス確保（道路・物流）",
    ],
    sources: [
      {
        url: "https://reliefweb.int/report/lao-peoples-democratic-republic/lao-peoples-democratic-republic-flood-2025-dref-operation-mdrla011",
        title: "IFRC DREF: Lao PDR Flood 2025 (MDRLA011)",
      },
      {
        url: "https://reliefweb.int/map/lao-peoples-democratic-republic/preliminary-satellite-derived-flood-impact-assessment-kham-district-xiengkhouang-province-lao-pdr-04-aug-2025",
        title:
          "UNOSAT: Satellite-Derived Flood Impact (Xiengkhouang, 4 Aug 2025)",
      },
      {
        url: "https://reliefweb.int/map/lao-peoples-democratic-republic/preliminary-satellite-derived-flood-impact-assessment-lak-sao-town-khamkeuth-district-bolikhamxai-province-lao-pdr-28-august-2025",
        title:
          "UNOSAT: Satellite-Derived Flood Impact (Bolikhamxai, 28 Aug 2025)",
      },
      {
        url: "https://reliefweb.int/map/lao-peoples-democratic-republic/satellite-detected-water-extents-thoulakhom-district-vientiane-province-and-xaythany-district-vientiane-capital-lao-pdr-23-july-2025-imagery-analysis-23072025-published-23072025-v1",
        title:
          "UNOSAT: Water Extents (Vientiane Province/Capital, 23 Jul 2025)",
      },
    ],
  },
];
