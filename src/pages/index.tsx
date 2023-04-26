/* eslint-disable @next/next/no-img-element */
import { nextPostJson } from "@/common/nextPostJson";
import Head from "next/head";
import { useCallback, useState } from "react";

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
      details?: string;
    }[]
  >([
    {
      who: "assistant",
      text: "Hello! I'm Trident. What kind of documentation are you looking for?",
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
    const json = await res.json();
    const text = json
      .slice(0, 4)
      .map((item: any) => {
        return (
          "- " + item[0].metadata.title + "\n    - " + item[0].metadata.source
        );
      })
      .join("\n\n");

    newDialogueListWithUserAndAssistantAndResponse = [
      ...newDialogueListWithUser,
      {
        who: "assistant",
        text:
          "Hmm, please wait...\n" +
          "I found the following documents:\n\n" +
          text +
          "\n\nWould these be helpful?",
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
        }}
      >
        <div
          style={{
            width: "100%",
            marginTop: "3em",
            marginBottom: "15em",
          }}
        >
          {dialogueList.map((dialogueElement, dialogueIndex) => {
            return (
              <div
                key={dialogueIndex}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "1em",
                  border: "2px solid rgba(219, 219, 219, 0.5)",
                  boxShadow: " 0 2px 6px 0 rgba(219, 219, 219, 0.3)",
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
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
                  {" "}
                  <div
                    style={{
                      fontSize: "1.2em",
                      paddingLeft: "66px",
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
            width: "1000px",
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
              border: "2px solid rgba(219, 219, 219, 0.8)",
              boxShadow: "0 2px 6px 0 rgba(219, 219, 219, 0.3)",
              padding: "12px 8px",
              fontSize: "1.2em",
            }}
          />
          <input
            type="button"
            value="submit"
            onClick={submit}
            style={{
              color: "rgb(253, 254, 255)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "2px solid rgba(0, 0, 0, 0.8)",
              borderRadius: "2px",
              boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.8)",
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
      </main>
    </>
  );
}
