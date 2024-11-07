import { RefObject, useEffect } from "react";
import { useLatest } from "./latest";

type KeyBindProps = {
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: KeyboardEvent["key"];
  onKeyDown?: (event: KeyboardEvent) => void;
  targetRef?: RefObject<HTMLElement>;
};

export const useKeyBind = ({
  altKey,
  ctrlKey,
  metaKey,
  shiftKey,
  key,
  onKeyDown,
  targetRef,
}: KeyBindProps) => {
  const onKeyDownLatest = useLatest(onKeyDown);

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) => {
      if (altKey && !event.altKey) return;
      if (ctrlKey && !event.ctrlKey) return;
      if (metaKey && !event.metaKey) return;
      if (shiftKey && !event.shiftKey) return;
      if (event.key !== key) return;

      event.preventDefault();
      onKeyDownLatest.current?.(event);
    };

    if (targetRef?.current) {
      const target = targetRef.current;

      target.addEventListener("keydown", eventListener);
      return () => target.removeEventListener("keydown", eventListener);
    } else {
      window.addEventListener("keydown", eventListener);
      return () => window.removeEventListener("keydown", eventListener);
    }
  }, [altKey, ctrlKey, key, metaKey, onKeyDownLatest, shiftKey, targetRef]);
};
