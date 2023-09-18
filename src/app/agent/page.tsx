"use client";

import { BaseMap } from "@/components/BaseMap";
import { useRef } from "react";
import { MapProvider, MapRef } from "react-map-gl";

export default function Page() {
  return (
    <div className="tridentAgentReportListWrap">
      <div className="tridentAgentReportList">
        <h3>TRIDENT Agent</h3>
        <ul>
          <li>
            <a href="/agent/eq-2023-000166-mar">
              2023年9月 モロッコ地震 レポート
            </a>
          </li>
          <li>
            <a href="/agent/fl-2023-000168-lby">
              2023年9月 熱帯性暴風雨ダニエル レポート
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
