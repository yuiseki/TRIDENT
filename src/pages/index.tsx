/* eslint-disable @next/next/no-img-element */
import { nextPostJson } from "@/common/nextPostJson";
import { DialogueElementItem } from "@/components/DialogueElementItem";
import { DialogueElement } from "@/types/DialogueElement";
import { Document } from "@/types/Document";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

const scrollToBottom = async () => {
  await sleep(100);
  window.scroll({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const greetings =
  "Hello! I'm Trident, an UN dedicated interactive document exploration and humanity assistance system. What kind of documentation are you looking for?";

export default function Home() {
  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([
    {
      who: "assistant",
      text: "",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState(greetings);
  const [responding, setResponding] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const initializer = useCallback(() => {
    if (initialized) {
      return;
    }
    setResponding(true);
    const outputtingTextLength =
      dialogueList[dialogueList.length - 1].text.length;
    if (outputtingTextLength < outputText.length) {
      const newDialogueList = [
        {
          who: "assistant",
          text: outputText.slice(0, outputtingTextLength + 1),
        },
      ];
      setDialogueList(newDialogueList);
    } else {
      setOutputText("");
      setResponding(false);
      setInitialized(true);
    }
  }, [dialogueList, initialized, outputText]);

  useEffect(() => {
    setTimeout(initializer, 25);
  }, [initializer]);

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
    const json: Document[][] = await res.json();
    const docs = json.filter(
      (element: Document[], index, self) =>
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
          position: "fixed",
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
          minWidth: "1000px",
          maxWidth: "1000px",
          minHeight: "100vh",
          margin: "auto",
          zIndex: "1000",
        }}
      >
        <div
          style={{
            width: "100%",
            margin: "3em auto 15em",
          }}
        >
          {dialogueList.map((dialogueElement, dialogueIndex) => {
            return (
              <DialogueElementItem
                key={dialogueIndex}
                dialogueElement={dialogueElement}
                dialogueIndex={dialogueIndex}
                isResponding={
                  responding && dialogueIndex === dialogueList.length - 1
                }
              />
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
