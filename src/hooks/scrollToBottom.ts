"use client";

import { sleep } from "@/lib/sleep";
import { useCallback, RefObject } from "react";

export const useScrollToBottom = (
  targetEndRef: RefObject<HTMLDivElement | null>
) => {
  const scrollToBottom = useCallback(async () => {
    await sleep(50);
    if (targetEndRef.current) {
      targetEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [targetEndRef]);

  return scrollToBottom;
};
