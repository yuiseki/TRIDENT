/* eslint-disable @next/next/no-img-element */
import { nextPostJson } from "@/common/nextPostJson";
import Head from "next/head";
import { useCallback, useState } from "react";

type Doc = {
  pageContent: string;
  metadata: {
    source: string;
    title: string;
  };
};

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

const scrollToBottom = async () => {
  await sleep(100);
  window.scroll({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

export default function Home() {
  const [dialogueList, setDialogueList] = useState<
    {
      who: string;
      text: string;
      textEnd?: string;
      docs?: Doc[][];
    }[]
  >([
    {
      who: "assistant",
      text: "Hello! I'm Trident, an UN dedicated interactive document exploration and humanity assistance system. What kind of documentation are you looking for?",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const submit = useCallback(async () => {
    const newInputText = inputText;
    setInputText("");

    const newDialogueListWithUser = [
      ...dialogueList,
      { who: "user", text: inputText },
    ];
    setDialogueList(newDialogueListWithUser);

    let newDialogueListWithUserAndAssistantAndResponse = [
      ...newDialogueListWithUser,
      {
        who: "assistant",
        text: "Hmm, please wait...",
      },
    ];
    setDialogueList(newDialogueListWithUserAndAssistantAndResponse);
    await scrollToBottom();
    await sleep(200);

    const res = await nextPostJson("/api/search", { query: newInputText });
    const json: Doc[][] = await res.json();
    const docs = json.filter(
      (element: Doc[], index, self) =>
        self.findIndex(
          (e) => e[0].metadata.source === element[0].metadata.source
        ) === index
    );
    newDialogueListWithUserAndAssistantAndResponse = [
      ...newDialogueListWithUser,
      {
        who: "assistant",
        text: "Hmm, please wait...\n" + "I found the following documents:\n",
        docs: docs,
        textEnd: "\nWould these be helpful?",
      },
    ];
    setDialogueList(newDialogueListWithUserAndAssistantAndResponse);
    scrollToBottom();
  }, [dialogueList, inputText]);

  return (
    <>
      <Head>
        <title>
          TRIDENT - UN dedicated interactive document exploration and humanity
          assistance system
        </title>
        <meta
          name="description"
          content="TRIDENT - UN dedicated interactive document exploration and humanity assistance system"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      ></div>
      <main
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1000px",
          minHeight: "100vh",
          margin: "auto",
          zIndex: "1000",
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            margin: "3em auto 15em",
          }}
        >
          {dialogueList.map((dialogueElement, dialogueIndex) => {
            return (
              <div
                key={dialogueIndex}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                  padding: "14px",
                  marginTop: "20px",
                  marginBottom: "30px",
                  border: "2px solid rgba(219, 219, 219, 0.5)",
                  borderRadius: "2px",
                  boxShadow: " 0 2px 6px 0 rgba(219, 219, 219, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyItems: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      marginRight: "10px",
                      width: "44px",
                      height: "44px",
                      marginLeft: "8px",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      backdropFilter: "blur(4px)",
                      backgroundColor:
                        dialogueElement.who === "assistant"
                          ? "rgb(0, 158, 219)"
                          : "rgba(0, 0, 0, 0.5)",
                      border:
                        dialogueElement.who === "assistant"
                          ? "2px solid rgba(0, 158, 219, 0.6)"
                          : "2px solid rgba(0, 0, 0, 0.1)",
                      boxShadow:
                        dialogueElement.who === "assistant"
                          ? "0 2px 6px 0 rgba(0, 158, 219, 0.6)"
                          : "0 2px 6px 0 rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {dialogueElement.who === "assistant" ? (
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
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.4em",
                      marginLeft: "4px",
                    }}
                  >
                    {dialogueElement.who === "assistant" ? "TRIDENT" : "USER"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.2em",
                      paddingLeft: "70px",
                    }}
                  >
                    {dialogueElement.text?.split("\n").map((row, rowIdx) => {
                      return (
                        <div
                          key={`${dialogueIndex}-${rowIdx}`}
                          style={{
                            minHeight: "1em",
                            marginLeft: row.startsWith(" ") ? "1em" : "0px",
                          }}
                        >
                          {row}
                        </div>
                      );
                    })}
                    {dialogueElement.docs && (
                      <ul style={{ paddingLeft: "2em" }}>
                        {dialogueElement.docs?.map((doc, docIdx) => {
                          return (
                            <li
                              key={`${dialogueIndex}-${docIdx}`}
                              style={{
                                minHeight: "1em",
                              }}
                            >
                              <a href={doc[0].metadata.source} target="_blank">
                                {doc[0].metadata.title
                                  ? doc[0].metadata.title
                                  : doc[0].metadata.source}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {dialogueElement.textEnd?.split("\n").map((row, rowIdx) => {
                      return (
                        <div
                          key={`${dialogueIndex}-${rowIdx}-end`}
                          style={{
                            minHeight: "1em",
                            marginLeft: row.startsWith(" ") ? "1em" : "0px",
                          }}
                        >
                          {row}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "5em",
            width: "100vw",
            margin: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "1000px",
              margin: "auto",
            }}
          >
            <textarea
              value={inputText}
              placeholder="How to build vector tile map?"
              onChange={(e) => setInputText(e.currentTarget.value)}
              rows={4}
              style={{
                width: "100%",
                color: "rgba(0, 0, 0, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "2px",
                border: "2px solid rgba(0, 158, 219, 0.8)",
                boxShadow: "0 2px 6px 0 rgba(0, 158, 219, 0.3)",
                padding: "12px 8px",
                fontSize: "1.2em",
              }}
            />
            <input
              type="button"
              value="Submit"
              onClick={submit}
              style={{
                color: "rgb(253, 254, 255)",
                backgroundColor: "rgba(0, 158, 219, 1)",
                boxShadow: "0 2px 6px 0 rgba(0, 158, 219, 0.6)",
                border: "2px solid rgba(0, 158, 219, 0.6)",
                borderRadius: "2px",
                display: "block",
                textAlign: "right",
                padding: "8px",
                marginRight: 0,
                marginLeft: "auto",
                fontSize: "1.1em",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
