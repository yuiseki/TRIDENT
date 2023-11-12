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
  where: string;
  whatHappenings: string[];
  requestToDisplayMaps: string[];
};

export default function Page() {
  const [sortedConcerns, setSortedConcerns] = useState<
    Array<ConcernEvent> | undefined
  >(undefined);

  const { data, error } = useSWR<Array<ConcernEvent>>(
    "/data/www3.nhk.or.jp/concerns/latest_concerns.json",
    jsonFetcher
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const newSortedConcerns = data
      .filter((v) => v)
      .filter((concern) => {
        if (
          concern.currentDate === null ||
          concern.currentDate === "Unknown" ||
          concern.currentDate === "unknown" ||
          concern.where === "Unknown" ||
          concern.where === "unknown" ||
          concern.requestToDisplayMaps.length === 0
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
          concern.requestToDisplayMaps
            .map((req) => req.includes("近海"))
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
  }, [data]);

  const getConcerns = useCallback(
    (start: Date, end: Date) => {
      if (!sortedConcerns) {
        return;
      }
      console.log("sortedConcerns", sortedConcerns.length);
      const filteredConcerns = sortedConcerns.filter((event) => {
        return (
          start.getTime() <= new Date(event.currentDate).getTime() &&
          new Date(event.currentDate).getTime() <= end.getTime()
        );
      });
      console.log("filteredConcerns", filteredConcerns.length);
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
                  console.log(
                    "permalink",
                    concernUrlArray[concernUrlArray.length - 1]
                  );
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
                      {concern.requestToDisplayMaps}
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
