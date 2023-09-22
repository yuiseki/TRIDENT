/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-img-element */
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
        opacity: `${1 - (initializeSequenceIndex / 1000) * 1.6}`,
        transform: `scale(${
          initializeSequenceIndex < 200
            ? 1
            : 1 + ((initializeSequenceIndex - 200) / 1000) * 100
        })`,
        transition: "all 0.001s linear",
        zIndex: 2000,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        className="avatarIconAssistant"
        style={{
          width: 200,
          height: 200,
          boxShadow: "2px 0 10px rgba(0, 158, 219, 1)",
        }}
      >
        <img
          width={200}
          height={200}
          src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
          alt="ai icon"
        />
      </div>
      <div>
        <h5
          style={{
            textAlign: "center",
            color: "rgba(0, 158, 219, 1)",
            textShadow: "2px 0 10px rgba(0, 158, 219, 1)",
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

const TridentInitializeMessageCard: React.FC<{
  initializeSequenceIndex: number;
}> = ({ initializeSequenceIndex }) => {
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
        opacity: `${initializeSequenceIndex / 1000 + 0.4}`,
        transform: `scale(${
          initializeSequenceIndex < 300
            ? 1
            : 1 + ((initializeSequenceIndex - 300) / 1000) * 1.8
        })`,
        transition: "all 0.001s linear",
      }}
    >
      <h3>Initializing</h3>
      <h4>{".".repeat(Math.floor(initializeSequenceIndex / 100) - 2)}</h4>
    </div>
  );
};

const InitializeTridentSequences: React.FC<{
  initializeSequenceIndex: number;
}> = ({ initializeSequenceIndex }) => {
  if (initializeSequenceIndex < 150) {
    return "";
  }
  if (150 <= initializeSequenceIndex && initializeSequenceIndex < 300) {
    return <TridentLogo initializeSequenceIndex={initializeSequenceIndex} />;
  }
  if (300 <= initializeSequenceIndex && initializeSequenceIndex < 700) {
    return (
      <TridentInitializeMessageCard
        initializeSequenceIndex={initializeSequenceIndex}
      />
    );
  }
  if (500 <= initializeSequenceIndex && initializeSequenceIndex < 700) {
    return "";
  }
  if (700 <= initializeSequenceIndex && initializeSequenceIndex < 1000) {
    return "";
  }
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
        //setInitializeSequenceIndex(0);
        //window.location.reload();
      }, 500);
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
