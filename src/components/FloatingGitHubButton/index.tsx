/* eslint-disable @next/next/no-img-element */
"use client";

import styles from "./styles.module.scss";

export const FloatingGitHubButton: React.FC = () => {
  return (
    <div className={styles.buttonOuterWrap}>
      <div className={styles.buttonInnerWrap}>
        <a
          href="https://github.com/yuiseki/TRIDENT"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
        >
          <img
            className={styles.buttonImage}
            src="https://i.gyazo.com/1fbf1eeb622038a1ea2e62036d33788a.png"
            alt="GitHub"
            title="GitHub"
          />
        </a>
      </div>
    </div>
  );
};
