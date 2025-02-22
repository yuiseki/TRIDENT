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
          opacity: 0.5,
        }}
      >
        <a href="/api/auth/signin">
          <img
            width={40}
            height={40}
            src="icons/icon-48x48.png"
            alt="Not signed in"
            title="Not signed in"
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
