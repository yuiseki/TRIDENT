"use client";

import { AccountButton } from "@/components/AccountButton";
import { JGeoGLUEAnswer, JGeoGLUETask } from "@prisma/client";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type JGeoGLUEAnswerWithTask = JGeoGLUEAnswer & { task: JGeoGLUETask };

export default function Page() {
  const { data: session } = useSession();

  const { data: answers } = useSWR<JGeoGLUEAnswerWithTask[]>(
    "/api/tasks/answers",
    fetcher
  );

  console.log(answers);

  return (
    <>
      <title>TRIDENT Quiz (JGeoGLUE) | Answers</title>
      <div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgb(255, 255, 255)",
          }}
        >
          <h1>
            <a
              href="/q"
              style={{
                color: "rgb(0, 158, 219)",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              TRIDENT Quiz (JGeoGLUE)
            </a>
          </h1>
          <AccountButton />
        </div>
        {answers?.map((answer) => {
          return (
            <div
              key={answer.taskId}
              style={{
                backgroundColor: "white",
                width: "60vw",
                margin: "20px auto",
                padding: "20px",
              }}
            >
              <h2>{answer.task.question}</h2>
              <p>type: {answer.task.type}</p>
              <p>correct answer: {answer.task.correctAnswer}</p>
              <p>your answer: {answer.answer}</p>
              <p>is correct: {answer.isCorrect ? "✅" : "❌"}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
