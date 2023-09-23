/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { loadImageShape } from "tsparticles-shape-image";
import type { Container, Engine } from "tsparticles-engine";
const SEQUENCE_INDEX_LOGO_BEGIN = 10;
const SEQUENCE_INDEX_LOGO_ZOOM_BEGIN = 200;
const SEQUENCE_INDEX_LOGO_FINISH = 330;
const SEQUENCE_INDEX_PROGRESS_BEGIN = 280;
const SEQUENCE_INDEX_PROGRESS_FINISH = 550;
const SEQUENCE_INDEX_PROGRESS_FINISH_WAIT = 200;
const SEQUENCE_INDEX_TOTAL =
  SEQUENCE_INDEX_PROGRESS_FINISH + SEQUENCE_INDEX_PROGRESS_FINISH_WAIT;

const SEQUENCE_INDEX_SUBTITLE_1 = "自律型地理空間情報探索エージェント";
const SEQUENCE_INDEX_SUBTITLE_2 = "トライデント";
const SEQUENCE_INDEX_SUBTITLE_3 = "起動しました";

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
            ? 0.8
            : 0.8 + (initializeSequenceIndex / SEQUENCE_INDEX_TOTAL) * 0.25
        })`,
        transition: "all 1ms liner",
        padding: "1rem 2rem 2rem 2rem",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <h4
        style={{
          fontWeight: "normal",
          color: "rgba(255, 255, 255, 0.8)",
          textShadow: "1px 1px 2px rgba(255, 255, 255, 0.4)",
          letterSpacing: "0.1em",
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
              initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_FINISH
                ? ((initializeSequenceIndex - SEQUENCE_INDEX_PROGRESS_BEGIN) /
                    (SEQUENCE_INDEX_PROGRESS_FINISH -
                      SEQUENCE_INDEX_PROGRESS_BEGIN)) *
                  100
                : 100
            }%`,
            height: "15px",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
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
    await loadImageShape(engine);
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
            value: { min: 0.2, max: 0.6 },
          },
          shape: {
            type: "image",
            image: {
              src: "/favicon.ico",
            },
          },
          shadow: {
            blur: 4,
            color: { value: "#009edb" },
            enable: true,
            offset: { x: 4, y: 4 },
          },
          size: {
            value: { min: 4, max: 14 },
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
              area: 1500,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

const TridentSubTitleItem: React.FC<{ subTitle: string }> = ({ subTitle }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!visible) {
      setVisible(true);
    }
    return () => {
      setVisible(false);
    };
  }, []);
  return (
    <div
      style={{
        width: "fit-content",
        backgroundColor: "rgba(8, 8, 8, 0.75)",
        padding: "0.5rem 0.5rem",
        fontSize: "2.2em",
        color: "rgba(255, 255, 255, 1)",
        whiteSpace: "pre-wrap",
        transition: "all 0.4s linear",
        opacity: `${visible ? 1 : 0}`,
      }}
    >
      {subTitle}
    </div>
  );
};

const TridentSubTitle: React.FC<{ initializeSequenceIndex: number }> = ({
  initializeSequenceIndex,
}) => {
  return (
    <div
      style={{
        width: "fit-content",
        position: "absolute",
        bottom: "5vh",
        left: "5vw",
        textAlign: "left",
        marginRight: "5vw",
        zIndex: 2000,
      }}
    >
      {initializeSequenceIndex < SEQUENCE_INDEX_LOGO_FINISH && (
        <TridentSubTitleItem subTitle={SEQUENCE_INDEX_SUBTITLE_1} />
      )}
      {SEQUENCE_INDEX_LOGO_FINISH < initializeSequenceIndex &&
        initializeSequenceIndex < SEQUENCE_INDEX_PROGRESS_FINISH && (
          <TridentSubTitleItem subTitle={SEQUENCE_INDEX_SUBTITLE_2} />
        )}
      {SEQUENCE_INDEX_PROGRESS_FINISH < initializeSequenceIndex &&
        initializeSequenceIndex <
          SEQUENCE_INDEX_PROGRESS_FINISH +
            SEQUENCE_INDEX_PROGRESS_FINISH_WAIT &&
        [SEQUENCE_INDEX_SUBTITLE_2, SEQUENCE_INDEX_SUBTITLE_3].map(
          (subTitle, idx) => {
            return (
              <TridentSubTitleItem
                key={`trident-subtitle-item-${idx}`}
                subTitle={subTitle}
              />
            );
          }
        )}
    </div>
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
        initializeSequenceIndex <
          SEQUENCE_INDEX_PROGRESS_FINISH +
            SEQUENCE_INDEX_PROGRESS_FINISH_WAIT && (
          <TridentInitializingProgressCard
            initializeSequenceIndex={initializeSequenceIndex}
          />
        )}
      {SEQUENCE_INDEX_PROGRESS_FINISH + SEQUENCE_INDEX_PROGRESS_FINISH_WAIT <
        initializeSequenceIndex && (
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
      }, 1);
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
        <TridentSubTitle initializeSequenceIndex={initializeSequenceIndex} />
      </article>
    </>
  );
};
