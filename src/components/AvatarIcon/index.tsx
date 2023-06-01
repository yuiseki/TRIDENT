/* eslint-disable @next/next/no-img-element */
import styles from "./styles.module.css";

export const AvatarIcon: React.FC<{ who: string }> = ({ who }) => {
  return (
    <div
      className={`${styles.avatarIcon} ${
        who === "assistant"
          ? styles.avatarIconAssistant
          : styles.avatarIconHuman
      }`}
    >
      {who === "assistant" ? (
        <img
          width={30}
          height={30}
          src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
          alt="ai icon"
        />
      ) : (
        <img
          width={30}
          height={30}
          src="https://i.gyazo.com/8960181a3459473ada71a8718df8785b.png"
          alt="user icon"
        />
      )}
    </div>
  );
};
