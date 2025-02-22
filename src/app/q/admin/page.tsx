"use client";

import { AccountButton } from "@/components/AccountButton";
import { AddTaskForm } from "@/components/AddTaskForm";
import { JGeoGLUETask } from "@prisma/client";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
  const { data: session } = useSession();

  const { data: tasks } = useSWR<JGeoGLUETask[]>("/api/q?admin=true", fetcher);

  if (session !== undefined && session === null) {
    window.location.href = "/";
  }

  if (session !== undefined && session?.user?.role !== "admin") {
    window.location.href = "/";
  }

  return (
    <div>
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <h1>TRIDENT Admin</h1>
        <AccountButton />
      </div>
      {tasks === undefined ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "white",
          }}
        >
          <div>
            <h2>Loading...</h2>
          </div>
        </div>
      ) : (
        <div>
          <AddTaskForm />
          {tasks?.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: "white",
                width: "60vw",
                margin: "20px auto",
                padding: "20px",
              }}
            >
              <h2>{task.question}</h2>
              <p>type: {task.type}</p>
              <p>answer: {task.correctAnswer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
