"use client";

import { InitializeTridentAgent } from "@/components/InitializeTridentAgent";
import { StaticRegionsMap } from "@/components/StaticRegionsMap";
import React, { Dispatch, useEffect, useState } from "react";

const MainContent: React.FC = () => {
  return (
    <>
      <title>
        2023年9月 モロッコ地震 レポート - TRIDENT Agent (Sep 18 version)
      </title>
      <article className="tridentAgentArticle">
        <section className="tridentAgentSection tridentAgentSectionFirst">
          <h2>2023年9月 モロッコ地震 レポート</h2>
          <h4>generated by: `TRIDENT Agent (Sep 18 version)`</h4>
          <p>Note: `TRIDENT Agent` may produce inaccurate information.</p>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <div className="tridentAgentSectionTitle">
            <h3>災害の概要</h3>
          </div>
          <div className="tridentAgentSectionMain">
            <ul>
              <li>
                2023年9月8日22時11分（UTC）、モロッコでマグニチュード6.8の強力な地震が発生しました
              </li>
              <li>
                9月8日の国家当局の情報によると、死者は２９４６人、負傷者は５６７４人に達したとのことです。
              </li>
              <li>
                モロッコ政府は緊急対応を実施しており、さらに国連は各国当局と緊密なコミュニケーションを続けています。
              </li>
            </ul>
          </div>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <div className="tridentAgentSectionTitle">
            <h3>モロッコの概要</h3>
          </div>
          <div className="tridentAgentSectionMain">
            <ul>
              <li>
                政治体制:
                モロッコは立憲君主制で、国王が元首であり、議会制民主主義国です。
              </li>
              <li>
                主要言語:
                アラビア語とベルベル語が公用語であり、フランス語も広く使用されています。
              </li>
              <li>人口: 約3,690万人（2021年推定）</li>
              <li>
                民族構成:
                アラブ・ベルベル系が主要で、他にもさまざまな民族が存在します。
              </li>
              <li>主要通貨: モロッコ・ディルハム（MAD）</li>
              <li>
                経済規模: 世界銀行によると、2020年のGDPは約1,240億米ドルです。
              </li>
              <li>
                主要産業:
                農業、観光業、製造業、鉱業が主要な産業セクターです。特に、リゾート地への観光が重要な経済活動の一部です。
              </li>
              <li>
                医療水準:
                モロッコは国内外の医療施設を提供し、一般的な医療サービスが利用可能ですが、質とアクセスには地域差があります。
              </li>
              <li>
                教育水準:
                教育制度が整備されており、基本的な教育が提供されていますが、地域差があります。フランス語が教育の一部として重要です。
              </li>
            </ul>
          </div>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <div className="tridentAgentSectionTitle">
            <h3>モロッコの位置</h3>
          </div>
          <div className="tridentAgentSectionMain">
            <StaticRegionsMap
              mapStyle="/map_styles/fiord-color-gl-style/style.json"
              regionNames={["Morocco"]}
              mapPadding={400}
            />
          </div>
          <div className="tridentAgentSectionDescription">
            <h4>
              モロッコは北アフリカに位置する国で、地中海に面し、アフリカ大陸の最北端に位置しています。
            </h4>
          </div>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <div className="tridentAgentSectionTitle">
            <h3>モロッコの地形</h3>
          </div>
          <div className="tridentAgentSectionMain">
            <StaticRegionsMap
              mapStyle="/map_styles/arcgis-world-imagery/style.json"
              regionNames={["Morocco"]}
            />
          </div>
          <div className="tridentAgentSectionDescription">
            <h4>
              モロッコは多様な地形を持ち、山岳地帯、砂漠、平原、海岸線があります。最も有名な地形はアトラス山脈です。
            </h4>
            <h4>
              モロッコの気候は多様で、地中海性気候、砂漠気候、山岳気候などがあります。
            </h4>
          </div>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <div className="tridentAgentSectionTitle">
            <h3>地震の主な被害地域</h3>
          </div>
          <div className="tridentAgentSectionMain">
            <StaticRegionsMap
              mapStyle="/map_styles/fiord-color-gl-style/style.json"
              regionNames={[
                "Morocco",
                "Al Haouz Province",
                "Taroudant Province",
              ]}
              mapPadding={-80}
            />
          </div>
          <div className="tridentAgentSectionDescription">
            <h4>被害の中心は、アル・ハウズ州とタルーダント州です。</h4>
          </div>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <div className="tridentAgentSectionTitle">
            <h3>地震による建物被害の詳細</h3>
          </div>
          <div className="tridentAgentSectionMain">
            <StaticRegionsMap
              mapStyle={{
                version: 8,
                sources: {
                  worldImagery: {
                    type: "raster",
                    tiles: [
                      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    ],
                    tileSize: 256,
                    attribution:
                      '<a href="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/" target="_blank">Source: Esri, Maxar, Earthstar Geographics</a>',
                  },
                  buildingDamageAssessment: {
                    type: "geojson",
                    data: "https://shi-works.github.io/Satellite-Image-Map-of-Morocco-Earthquake/EMSR695_AOI01-08_GRA_PRODUCT_builtUpP.geojson",
                    cluster: false,
                    attribution:
                      '<a href="https://rapidmapping.emergency.copernicus.eu/EMSR695/download">© Copernicus Emergency Management Service, Earthquake in Marrakesh-Safi Region, Morocco</a>',
                  },
                },
                layers: [
                  {
                    id: "worldImagery",
                    type: "raster",
                    source: "worldImagery",
                    minzoom: 0,
                    maxzoom: 22,
                  },
                  {
                    id: "building-damage-assessment",
                    type: "circle",
                    source: "buildingDamageAssessment",
                    minzoom: 0,
                    maxzoom: 22,
                    paint: {
                      "circle-color": [
                        "match",
                        ["get", "damage_gra"],
                        "Damaged",
                        "rgba(255, 255, 0, 1)",
                        "Destroyed",
                        "rgba(255, 0, 0, 1)",
                        "Possibly damaged",
                        "rgba(0, 255, 0, 1)",
                        "rgba(0, 0, 0, 1)",
                      ],
                      "circle-radius": 6,
                      "circle-stroke-width": 1,
                      "circle-stroke-color": "rgba(0, 0, 0, 1)",
                    },
                  },
                ],
              }}
              regionNames={["Al Haouz Province", "Taroudant Province"]}
              mapPadding={150}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: "8em",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                paddingBottom: "5px",
              }}
            >
              <h4>建物被害評価</h4>
              <div
                style={{
                  backgroundColor: "rgb(255, 0, 0)",
                  border: "1px solid black",
                  display: "inline-block",
                  marginLeft: "5px",
                }}
              >
                <span style={{ display: "inline-block", padding: "4px" }}>
                  倒壊
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "rgb(255, 255, 0)",
                  border: "1px solid black",
                  display: "inline-block",
                  marginLeft: "5px",
                }}
              >
                <span style={{ display: "inline-block", padding: "4px" }}>
                  損傷あり
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "rgb(0, 255, 0)",
                  border: "1px solid black",
                  display: "inline-block",
                  marginLeft: "5px",
                  marginRight: "5px",
                }}
              >
                <span style={{ display: "inline-block", padding: "4px" }}>
                  おそらく損傷あり
                </span>
              </div>
            </div>
            <div className="tridentAgentSectionDescription">
              <h4>地震被害の詳細は、今後更新される予定です。</h4>
            </div>
          </div>
          <span className="scrollDown scrollDownLeft"></span>
          <span className="scrollDown scrollDownRight"></span>
        </section>
        <section className="tridentAgentSection">
          <h4>レポートは以上です。</h4>
          <h4>
            <a
              href="https://wiki.openstreetmap.org/wiki/2023_Morocco_Earthquake"
              target="_blank"
            >
              OpenStreetMapを通じて災害対応を支援することができます
            </a>
          </h4>
          <h4>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "2023年9月 モロッコ地震 レポート - TRIDENT Agent (Sep 18 version)\n"
              )}&url=${encodeURIComponent(
                "https://trident.yuiseki.net/agent/eq-2023-000166-mar"
              )}`}
              target="_blank"
            >
              このレポートをXへ投稿する
            </a>
          </h4>
        </section>
      </article>
    </>
  );
};

export default function Page() {
  const [initialized, setInitialized] = useState(false);
  return (
    <>
      {initialized ? (
        <MainContent />
      ) : (
        <InitializeTridentAgent setInitialized={setInitialized} />
      )}
    </>
  );
}
