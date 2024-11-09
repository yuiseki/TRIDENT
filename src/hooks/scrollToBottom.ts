"use client";

import { sleep } from "@/utils/sleep";
import { useCallback, RefObject } from "react";

export const useScrollToBottom = (
  dialogueEndRef: RefObject<HTMLDivElement>
) => {
  const scrollToBottom = useCallback(async () => {
    await sleep(50);
    if (dialogueEndRef.current) {
      dialogueEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [dialogueEndRef]);

  return scrollToBottom;
};
