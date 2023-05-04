/* eslint-disable @next/next/no-img-element */
import { nextPostJson } from "@/utils/nextPostJson";
import { DialogueElementItem } from "@/components/DialogueElementItem";
import { DialogueElement } from "@/types/DialogueElement";
import { Document } from "@/types/Document";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToBottom } from "@/utils/scrollToBottom";
import { sleep } from "@/utils/sleep";
import { placeholders } from "@/const/placeholders";

const timeoutExec = (func: () => void, msec: number) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(func());
    }, msec)
  );

const greetings =
  "Hello! I'm Trident, an UN dedicated interactive information retrieval and humanity assistance system. What kind of information are you looking for?";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      if (textareaRef.current !== null) {
        textareaRef.current.focus();
      }
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
    }, 10000);
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
            scrollToBottom();
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

  const submitQuestion = useCallback(async () => {
    const newInputText = inputText.trim();
    setInputText("");

    insertNewDialogue({ who: "user", text: newInputText });

    await sleep(200);
    scrollToBottom();
    setResponding(true);

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
        text: `${json.text.slice(1, json.text.length)}\n`,
        docs: docs,
      },
      true
    );

    setResponding(false);
  }, [inputText, insertNewDialogue]);

  return (
    <>
      <Head>
        <title>
          TRIDENT - UN dedicated interactive information retrieval and humanity
          assistance system
        </title>
        <meta
          name="description"
          content="TRIDENT - UN dedicated interactive information retrieval and humanity assistance system"
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
              <div key={dialogueIndex}>
                <DialogueElementItem
                  prevDialogueElement={
                    0 < dialogueIndex
                      ? dialogueList[dialogueIndex - 1]
                      : undefined
                  }
                  dialogueElement={dialogueElement}
                  dialogueIndex={dialogueIndex}
                  isResponding={
                    (responding || lazyInserting) &&
                    dialogueIndex === dialogueList.length - 1
                  }
                />
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "3em",
            width: "100vw",
            margin: "auto",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "1000px",
              margin: "auto",
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputText}
              placeholder={responding || lazyInserting ? "..." : placeholder}
              onChange={(e) => {
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = "0px";
                    textareaRef.current.style.height =
                      textareaRef.current.scrollHeight + "px";
                  }
                }, 100);
                setInputText(e.currentTarget.value);
              }}
              rows={inputText ? inputText.split("\n").length : 1}
              maxLength={400}
              style={{
                overflowY: "hidden",
                resize: "none",
                minHeight: "50px",
                maxHeight: "200px",
                whiteSpace: "pre-wrap",
                height: "auto",
                width: "100%",
                color: "rgba(0, 0, 0, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "2px",
                padding: "8px 46px 8px 12px",
                fontWeight: 400,
              }}
            />
            <button
              value=""
              disabled={
                responding ||
                lazyInserting ||
                !initialized ||
                inputText.length === 0
              }
              onClick={submitQuestion}
              style={{
                position: "absolute",
                bottom: 15,
                right: 15,
                color: "rgb(253, 254, 255)",
                backgroundColor: "rgba(0, 158, 219, 1)",
                boxShadow: "0 2px 6px 0 rgba(0, 158, 219, 0.6)",
                border: "2px solid rgba(0, 158, 219, 0.6)",
                borderRadius: "2px",
                display: "block",
                padding: "4px",
                height: "34px",
                width: "34px",
              }}
            >
              <img
                style={{ height: "24px", width: "24px" }}
                src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
                alt="Request information retrieval"
                title="Request information retrieval"
              />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
