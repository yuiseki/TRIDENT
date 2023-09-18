"use client";

import { BaseMap } from "@/components/BaseMap";
import { StaticRegionsMap } from "@/components/StaticRegionsMap";
import { useRef } from "react";
import { MapProvider, MapRef } from "react-map-gl";

export default function Page() {
  const mapRef = useRef<MapRef | null>(null);
  return (
    <article className="tridentAgentArticle">
      <section className="tridentAgentSection">
        <h2>2023年9月 モロッコ地震 レポート</h2>
        <h3>by TRIDENT Agent</h3>
      </section>
      <section className="tridentAgentSection">
        <div className="tridentAgentSectionTitle">
          <h3>モロッコでマグニチュード6.8の強力な地震が発生。</h3>
        </div>
        <div className="tridentAgentSectionDescription">
          <h4>
            9月8日の国家当局によると、死者は２９４６人、負傷者は５６７４人に達した。
            モロッコ政府は緊急対応を実施しており、さらに国連は各国当局と緊密なコミュニケーションを続けている。
          </h4>
        </div>
      </section>
      <section className="tridentAgentSection">
        <div className="tridentAgentSectionTitle">
          <h3>モロッコの位置</h3>
        </div>
        <div className="tridentAgentSectionMain">
          <StaticRegionsMap
            mapStyle="/map_styles/fiord-color-gl-style/style.json"
            regionNames={["Morocco"]}
          />
        </div>
        <div className="tridentAgentSectionDescription">
          <h4>
            モロッコは北アフリカに位置する国で、地中海に面し、アフリカ大陸の最北端に位置しています。
          </h4>
        </div>
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
        </div>
      </section>
    </article>
  );
}
