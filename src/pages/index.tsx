/* eslint-disable @next/next/no-img-element */
import { nextPostJson } from "@/common/nextPostJson";
import { DialogueElementItem } from "@/components/DialogueElementItem";
import { DialogueElement } from "@/types/DialogueElement";
import { Document } from "@/types/Document";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

const timeoutExec = (func: () => void, msec: number) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(func());
    }, msec)
  );

const scrollToBottom = async () => {
  await sleep(100);
  window.scroll({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const greetings =
  "Hello! I'm Trident, an UN dedicated interactive document exploration and humanity assistance system. What kind of documentation are you looking for?";

const placeholders = [
  "What is the name of the UN mission in South Sudan?",
  "When did the UN start mission in South Sudan?",
  "Who is the latest head of South Sudan at the UN mission?",
  "Where is the headquarters of the UN mission in South Sudan?",
];

export default function Home() {
  const [dialogueList, setDialogueList] = useState<DialogueElement[]>([
    {
      who: "assistant",
      text: "",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState(greetings);
  const [lazyInserting, setLazyInserting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [placeholderInitialized, setPlaceholderInitialized] = useState(false);

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

  useEffect(() => {
    if (placeholderInitialized) {
      return;
    }
    setInterval(() => {
      setPlaceholder((prev) => {
        const idx = placeholders.indexOf(prev);
        if (idx === placeholders.length - 1) {
          return placeholders[0];
        } else {
          return placeholders[idx + 1];
        }
      });
    }, 5000);
    setPlaceholderInitialized(true);
  }, []);

  const [lazyInsertingInitialized, setLazyInsertingInitialized] =
    useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();
  useEffect(() => {
    if (lazyInserting) {
      if (!lazyInsertingInitialized) {
        const newIntervalId = setInterval(() => {
          setDialogueList((prev) => {
            const last = prev[prev.length - 1];
            last.text = outputText.slice(0, last.text.length + 1);
            if (outputText.length === last.text.length) {
              setLazyInserting(false);
              setLazyInsertingInitialized(false);
              setOutputText("");
            }
            return [...prev.slice(0, prev.length - 1), last];
          });
        }, 50);
        setIntervalId(newIntervalId);
        setLazyInsertingInitialized(true);
      }
    } else {
      clearInterval(intervalId);
      setIntervalId(undefined);
    }
    return () => {
      if (!lazyInserting) {
        clearInterval(intervalId);
        setIntervalId(undefined);
      }
    };
  }, [intervalId, lazyInserting, lazyInsertingInitialized, outputText]);

  const insertNewDialogue = useCallback(
    (newDialogueElement: DialogueElement, lazy?: boolean) => {
      if (!lazy) {
        setDialogueList((prev) => {
          return [...prev, newDialogueElement];
        });
      } else {
        const lazyNewDialogueElement = {
          ...newDialogueElement,
          text: "",
        };
        setDialogueList((prev) => {
          return [...prev, lazyNewDialogueElement];
        });
        setOutputText(newDialogueElement.text);
        setLazyInserting(true);
      }
    },
    []
  );

  const submit = useCallback(async () => {
    const newInputText = inputText;
    setInputText("");

    insertNewDialogue({ who: "user", text: inputText });

    await scrollToBottom();
    await sleep(200);

    const res = await nextPostJson("/api/qa", { query: newInputText });
    const json: { text: string; sourceDocuments: Document[] } =
      await res.json();
    const docs = json.sourceDocuments.filter(
      (element: Document, index, self) =>
        self.findIndex((e) => e.metadata.source === element.metadata.source) ===
        index
    );
    insertNewDialogue(
      {
        who: "assistant",
        text: `${json.text.slice(1, json.text.length)}\n\n`,
        docs: docs,
      },
      true
    );

    scrollToBottom();
  }, [inputText, insertNewDialogue]);

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
        <link
          rel="icon"
          href="https://i.gyazo.com/36f5e676caec5f5e746a95054a46504f.png"
        />
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
          width: "1000px",
          maxWidth: "100vw",
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
                  (responding || lazyInserting) &&
                  dialogueIndex === dialogueList.length - 1
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
              placeholder={placeholder}
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
