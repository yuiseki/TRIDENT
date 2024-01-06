"use client";

import { useState } from "react";
import styles from "./styles.module.scss";

export const FloatingChatButton: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [showing, setShowing] = useState(false);
  return (
    <>
      {!showing && (
        <div className={styles.buttonOuterWrap}>
          <div className={styles.buttonInnerWrap}>
            <button
              className={styles.button}
              onClick={() => {
                setShowing(true);
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
          <button
            className={styles.closeButton}
            onClick={() => {
              setShowing(false);
            }}
          >
            ✖
          </button>
        </div>
      )}
    </>
  );
};
