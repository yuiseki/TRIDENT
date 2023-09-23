/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";
const SEQUENCE_INDEX_TOTAL = 250;
const SEQUENCE_INDEX_LOGO_BEGIN = 5;
const SEQUENCE_INDEX_LOGO_ZOOM_BEGIN = 50;
const SEQUENCE_INDEX_LOGO_FINISH = 100;
const SEQUENCE_INDEX_PROGRESS_BEGIN = 80;
const SEQUENCE_INDEX_PROGRESS_FINISH = 240;

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
        opacity: `${
          1 - (initializeSequenceIndex / SEQUENCE_INDEX_TOTAL) * 1.2
        }`,
        transform: `scale(${
          initializeSequenceIndex < SEQUENCE_INDEX_LOGO_ZOOM_BEGIN
            ? 1
            : 1 +
              ((initializeSequenceIndex - SEQUENCE_INDEX_LOGO_ZOOM_BEGIN) /
                SEQUENCE_INDEX_TOTAL) *
                150
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
          opacity: 1,
          boxShadow:
            "8px 8px 30px rgba(0, 158, 219, 0.6), -8px -8px 30px rgba(0, 158, 219, 0.6)",
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
            color: "rgba(0, 158, 219, 0.8)",
            textShadow:
              "8px 8px 30px rgba(0, 158, 219, 0.6), -8px -8px 30px rgba(0, 158, 219, 0.6)",
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

const TridentInitializingProgressCard: React.FC<{
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
        opacity: `${
          initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_BEGIN
            ? 0
            : initializeSequenceIndex / SEQUENCE_INDEX_TOTAL + 0.5
        }`,
        transform: `scale(${
          initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_BEGIN
            ? 0.6
            : 0.6 + (initializeSequenceIndex / SEQUENCE_INDEX_TOTAL) * 0.25
        })`,
        transition: "all 1ms liner",
        padding: "1rem 2rem 2rem 2rem",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      <h4
        style={{
          fontWeight: "normal",
          color: "rgba(255, 255, 255, 0.8)",
          textShadow: "1px 1px 2px rgba(255, 255, 255, 0.4)",
          letterSpacing: "0.05em",
        }}
      >
        INITIALIZING
      </h4>
      <div
        style={{
          width: "100%",
          marginTop: "10px",
        }}
      >
        <div
          style={{
            width: `${
              ((initializeSequenceIndex - SEQUENCE_INDEX_PROGRESS_BEGIN) /
                (SEQUENCE_INDEX_PROGRESS_FINISH -
                  SEQUENCE_INDEX_PROGRESS_BEGIN)) *
              100
            }%`,
            height: "15px",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            boxShadow: "2px 0px 2px rgba(255, 255, 255, 0.6)",
          }}
        />
      </div>
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

const TridentParticles: React.FC<{ initializeSequenceIndex: number }> = ({
  initializeSequenceIndex,
}) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      await console.log(container);
    },
    []
  );

  return (
    <Particles
      id="tsparticles"
      className="tridentParticlesWrapper"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fpsLimit: 30,
        fullScreen: {
          enable: false,
        },
        particles: {
          color: {
            value: "#009edb",
          },
          opacity: {
            value: 0.5,
            random: true,
          },
          shape: {
            type: "edge",
          },
          polygon: {
            nb_sides: 4,
          },
          size: {
            value: { min: 3, max: 10 },
          },
          move: {
            enable: true,
            direction: "inside",
            outModes: {
              default: "out",
            },
            random: true,
            speed: 20,
            straight: false,
          },
          number: {
            value: 200,
            density: {
              enable: true,
              area: 1000,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

const InitializeTridentSequences: React.FC<{
  initializeSequenceIndex: number;
}> = ({ initializeSequenceIndex }) => {
  return (
    <>
      {initializeSequenceIndex < SEQUENCE_INDEX_LOGO_BEGIN && (
        <TridentAuthenticationMessageCard
          initializeSequenceIndex={initializeSequenceIndex}
        />
      )}
      {initializeSequenceIndex < SEQUENCE_INDEX_LOGO_ZOOM_BEGIN && (
        <>
          <div className="tridentAgentSectionInitializingBackgroundEffectCircle1" />
          <div className="tridentAgentSectionInitializingBackgroundEffectCircle2" />
        </>
      )}
      {SEQUENCE_INDEX_PROGRESS_BEGIN < initializeSequenceIndex &&
        initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_FINISH && (
          <TridentParticles initializeSequenceIndex={initializeSequenceIndex} />
        )}
      {SEQUENCE_INDEX_LOGO_BEGIN < initializeSequenceIndex &&
        initializeSequenceIndex < SEQUENCE_INDEX_LOGO_FINISH && (
          <TridentLogo initializeSequenceIndex={initializeSequenceIndex} />
        )}
      {SEQUENCE_INDEX_PROGRESS_BEGIN < initializeSequenceIndex &&
        initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_FINISH && (
          <TridentInitializingProgressCard
            initializeSequenceIndex={initializeSequenceIndex}
          />
        )}
      {SEQUENCE_INDEX_PROGRESS_FINISH < initializeSequenceIndex && (
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
        if (index === SEQUENCE_INDEX_TOTAL) return index;
        return index + 1;
      });
    }, 10);
    return () => clearInterval(interval);
  }, [initializeSequenceIndex, setInitializeSequenceIndex]);

  useEffect(() => {
    if (initializeSequenceIndex === SEQUENCE_INDEX_TOTAL) {
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
        <section className="tridentAgentSectionBackground" />
        <section
          className="tridentAgentSectionInitializingOverlay"
          style={{
            opacity: 1 - initializeSequenceIndex / SEQUENCE_INDEX_TOTAL,
            transition: "all 0.1s linear",
          }}
        />
        <section
          className="tridentAgentSectionInitializingBackground"
          style={{
            opacity: `${
              initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_BEGIN
                ? 0
                : initializeSequenceIndex / SEQUENCE_INDEX_TOTAL
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
