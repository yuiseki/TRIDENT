"use client";

import useSWR from "swr";
import { jsonFetcher } from "@/utils/jsonFetcher";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import Link from "next/link";

const formatDate = (date: Date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

type ConcernEvent = {
  url: string;
  description: string;
  title: string;
  pubDate: string;
  currentDate: string;
  whatHappenings: string[];
  displayMaps: string[];
};

export default function Page() {
  const [sortedConcerns, setSortedConcerns] = useState<
    Array<ConcernEvent> | undefined
  >(undefined);

  const { data: disasterData, error: disasterDataError } = useSWR<
    Array<ConcernEvent>
  >("/data/api.reliefweb.int/concerns/latest_concerns.json", jsonFetcher);

  useEffect(() => {
    if (!disasterData) {
      return;
    }

    const data = [...disasterData];

    const newSortedConcerns = data
      .filter((v) => v)
      .filter((concern) => {
        if (
          concern.currentDate === null ||
          concern.currentDate === "Unknown" ||
          concern.currentDate === "unknown" ||
          concern.displayMaps.length === 0
        ) {
          return false;
        }
        return true;
      })
      .filter((concern) => {
        if (
          concern.whatHappenings
            .map(
              (happenings) =>
                happenings.includes("目指す") || happenings.includes("関係各国")
            )
            .includes(true) ||
          concern.displayMaps
            .map((ma) => ma.includes("近海") || ma.includes("Unknown"))
            .includes(true)
        ) {
          return false;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        return (
          new Date(b.currentDate).getTime() - new Date(a.currentDate).getTime()
        );
      });
    setSortedConcerns(newSortedConcerns);
  }, [disasterData, newsData]);

  const getConcerns = useCallback(
    (start: Date, end: Date) => {
      if (!sortedConcerns) {
        return;
      }
      const filteredConcerns = sortedConcerns.filter((event) => {
        return (
          start.getTime() <= new Date(event.currentDate).getTime() &&
          new Date(event.currentDate).getTime() <= end.getTime()
        );
      });
      return filteredConcerns;
    },
    [sortedConcerns]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        padding: "1.5rem",
      }}
    >
      <ul>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((weekIndex) => {
          const now = new Date();
          // 今日が何曜日かを取得する
          const dayOfWeek = now.getDay();
          // 日曜日を基準として、startDateとendDateは、1週間ごとに設定する
          // ただし、今日が日曜日の場合は、startDateとendDateは、今日から1週間前とする
          const startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7 * (weekIndex - 1) - dayOfWeek
          );

          const endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7 * (weekIndex - 1) - dayOfWeek + 6
          );

          const weeklyConcerns = getConcerns(startDate, endDate);
          if (!weeklyConcerns) return null;
          if (weeklyConcerns.length === 0) return null;
          return (
            <>
              {weeklyConcerns &&
                weeklyConcerns.map((concern) => {
                  const concernUrlArray = concern.url.split("/");
                  return (
                    <li key={concern.url} style={{ padding: "0.5rem 0" }}>
                      <Link
                        href={`/agent/${concernUrlArray[
                          concernUrlArray.length - 1
                        ].replaceAll(".html", "")}`}
                      >
                        {concern.title}
                      </Link>
                      <br />
                      {concern.displayMaps
                        .join(", ")
                        .replaceAll("AreaWithConcern:", "")
                        .replaceAll("Area:", "")}
                    </li>
                  );
                })}
            </>
          );
        })}
      </ul>
    </div>
  );
}
