"use client";
import { useSession } from "next-auth/react";
import styles from "./styles.module.scss";

export const AccountButton: React.FC = () => {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div
        className={styles.accountButton}
        style={{
          opacity: 0.8,
        }}
      >
        <a href="/api/auth/signin" style={{
          fill: "white !important",
          background: "rgba(60, 60, 60, 0.4)",
        }}>
          <img
            width={35}
            height={35}
            src="menu-icon.svg"
            alt="Not signed in"
            title="Not signed in"
            style={{
              fill: "white !important",
            }}
          />
        </a>
      </div>
    );
  }
  if (!session.user.image) return null;
  if (!session.user.name) return null;

  return (
    <div className={styles.accountButton}>
      <a href="/api/auth/signout">
        <img
          width={40}
          height={40}
          src={session.user.image}
          alt="User Avatar"
          title={`Logged in as ${session.user.name}`}
        />
      </a>
    </div>
  );
};
