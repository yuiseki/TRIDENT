/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-img-element */
import { initialize } from "next/dist/server/lib/render-server";
import React, { useEffect, useState } from "react";
const TOTAL_MILL_SECONDS = 500;

const TridentLogo: React.FC<{ initializeSequenceIndex: number }> = ({
  initializeSequenceIndex,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        opacity: `${1 - (initializeSequenceIndex / TOTAL_MILL_SECONDS) * 1.6}`,
        transform: `scale(${
          initializeSequenceIndex < 100
            ? 1
            : 1 + ((initializeSequenceIndex - 100) / TOTAL_MILL_SECONDS) * 150
        })`,
        transition: "all 1ms linear",
        zIndex: 2000,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        className="avatarIconAssistant"
        style={{
          width: 100,
          height: 100,
          boxShadow:
            "4px 4px 15px rgba(0, 158, 219, 0.6), -4px -4px 15px rgba(0, 158, 219, 0.6)",
        }}
      >
        <img
          width={100}
          height={100}
          src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
          alt="ai icon"
        />
      </div>
      <div>
        <h5
          style={{
            textAlign: "center",
            color: "rgba(0, 158, 219, 0.6)",
            textShadow:
              "4px 4px 15px rgba(0, 158, 219, 0.6), -4px -4px 15px rgba(0, 158, 219, 0.6)",
          }}
        >
          TRIDENT
          <br />
          Agent
        </h5>
      </div>
    </div>
  );
};

const TridentInitializeProgressCard: React.FC<{
  initializeSequenceIndex: number;
}> = ({ initializeSequenceIndex }) => {
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const newProgress = Math.floor(initializeSequenceIndex / 50) - 2;
    console.log(newProgress);
    if (newProgress > 0) {
      setProgress(newProgress);
    }
  }, [initializeSequenceIndex]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        zIndex: 2000,
        pointerEvents: "none",
        userSelect: "none",
        opacity: `${
          initializeSequenceIndex < 150
            ? 0
            : initializeSequenceIndex / TOTAL_MILL_SECONDS + 0.5
        }`,
        transform: `scale(${
          initializeSequenceIndex < 150
            ? 0.6
            : 0.6 + (initializeSequenceIndex / TOTAL_MILL_SECONDS) * 1.04
        })`,
        transition: "all 1ms ease-in",
      }}
    >
      <h3 style={{ fontWeight: "normal" }}>INITIALIZING</h3>
      <h4>{".".repeat(progress)}</h4>
    </div>
  );
};

const TridentAuthenticationMessageCard: React.FC<{
  initializeSequenceIndex: number;
}> = ({ initializeSequenceIndex }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "50%",
        left: "50%",
        opacity: 0,
      }}
    >
      {JSON.stringify(initializeSequenceIndex)}
    </div>
  );
};

const InitializeTridentSequences: React.FC<{
  initializeSequenceIndex: number;
}> = ({ initializeSequenceIndex }) => {
  return (
    <>
      {initializeSequenceIndex < 100 && (
        <TridentAuthenticationMessageCard
          initializeSequenceIndex={initializeSequenceIndex}
        />
      )}
      {100 < initializeSequenceIndex && initializeSequenceIndex < 250 && (
        <TridentLogo initializeSequenceIndex={initializeSequenceIndex} />
      )}
      {150 < initializeSequenceIndex && initializeSequenceIndex < 400 && (
        <TridentInitializeProgressCard
          initializeSequenceIndex={initializeSequenceIndex}
        />
      )}
      {400 < initializeSequenceIndex && (
        <TridentAuthenticationMessageCard
          initializeSequenceIndex={initializeSequenceIndex}
        />
      )}
    </>
  );
};

export const InitializeTridentAgent: React.FC<{
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setInitialized }) => {
  const [initializeSequenceIndex, setInitializeSequenceIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setInitializeSequenceIndex((index: number) => {
        if (index === TOTAL_MILL_SECONDS) return index;
        return index + 1;
      });
    }, 10);
    return () => clearInterval(interval);
  }, [initializeSequenceIndex, setInitializeSequenceIndex]);

  useEffect(() => {
    if (initializeSequenceIndex === TOTAL_MILL_SECONDS) {
      setTimeout(() => {
        setInitialized(true);
        //window.location.reload();
      }, 100);
    }
  }, [initializeSequenceIndex, setInitialized]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
        rel="stylesheet"
      ></link>
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;700&display=swap"
        rel="stylesheet"
      ></link>
      <link
        href="https://fonts.googleapis.com/css?family=M+PLUS+1p&subset=japanese&display=swap"
        rel="stylesheet"
      ></link>
      <article className="tridentAgentArticle tridentAgentArticleInitializing">
        <section
          className="tridentAgentSectionInitializingOverlay"
          style={{
            opacity: 1 - initializeSequenceIndex / 100,
            transition: "all 0.1s linear",
          }}
        />
        <section
          className="tridentAgentSectionInitializingBackground"
          style={{
            opacity: `${
              initializeSequenceIndex < 300
                ? 0
                : initializeSequenceIndex / TOTAL_MILL_SECONDS
            }`,
            backgroundImage: 'url("/Flag_of_the_United_Nations.svg")',
            transition: "all 1s linear",
          }}
        />
        <section className="tridentAgentSection">
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            {JSON.stringify(initializeSequenceIndex)}
          </div>
          <InitializeTridentSequences
            initializeSequenceIndex={initializeSequenceIndex}
          />
        </section>
      </article>
    </>
  );
};
