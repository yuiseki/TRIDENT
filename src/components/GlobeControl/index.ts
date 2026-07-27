import * as React from "react";
import { useEffect, memo } from "react";
import { ControlPosition, useControl } from "react-map-gl/maplibre";

// Add applyReactStyle utility function
const unitlessNumber = /box|flex|grid|column|lineHeight|fontWeight|opacity|order|tabSize|zIndex/;

export function applyReactStyle(element?: HTMLElement, styles?: React.CSSProperties) {
  if (!element || !styles) {
    return;
  }
  const style = element.style;

  for (const key in styles) {
    const value = styles[key as keyof React.CSSProperties];
    if (Number.isFinite(value) && !unitlessNumber.test(key)) {
      (style as any)[key] = `${value}px`;
    } else {
      (style as any)[key] = value;
    }
  }
}

export type GlobeControlProps = {
  /** Placement of the control relative to the map. */
  position?: ControlPosition;
  /** CSS style override, applied to the control's container */
  style?: React.CSSProperties;
};

function _GlobeControl(props: GlobeControlProps) {
  const ctrl = useControl(({ mapLib }) => new mapLib.GlobeControl(props), {
    position: props.position,
  });

  useEffect(() => {
    applyReactStyle(ctrl._container, props.style);
  }, [props.style]);

  return null;
}

export const GlobeControl = memo(_GlobeControl);
