/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import styles from "./styles.module.scss";

export const FloatingChatButton: React.FC<{
  children: React.ReactNode;
  onChange?: (showing: boolean) => void;
}> = ({ children, onChange }) => {
  const [showing, setShowing] = useState(true);
  return (
    <>
      {!showing && (
        <div className={styles.buttonOuterWrap}>
          <div className={styles.buttonInnerWrap}>
            <button
              className={styles.button}
              onClick={() => {
                setShowing(true);
                if (onChange) {
                  onChange(true);
                }
              }}
            >
              <img
                className={styles.buttonImage}
                src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
                alt="button"
                title="button"
              />
            </button>
          </div>
        </div>
      )}
      {showing && (
        <div className={styles.childrenWrap}>
          <div>{children}</div>
          <div className={styles.closeButtonWrap}>
            <button
              className={styles.closeButton}
              onClick={() => {
                setShowing(false);
                if (onChange) {
                  onChange(false);
                }
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
