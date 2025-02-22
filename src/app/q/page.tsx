"use client";

import { AccountButton } from "@/components/AccountButton";
import { GeoGLUETaskCard } from "@/components/GeoGLUETaskCard";
import { RequireLoginCard } from "@/components/RequireLoginCard";
import { JGeoGLUETask } from "@prisma/client";
import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Page() {
  const { data: session } = useSession();
  const { data: allTasks } = useSWR<JGeoGLUETask[]>("/api/q", (url: string) =>
    fetch(url).then((res) => res.json())
  );
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentTask, setCurrentTask] = useState<JGeoGLUETask | null>(null);

  useEffect(() => {
    if (allTasks) {
      setCurrentTask(allTasks[currentTaskIndex]);
    }
  }, [allTasks, currentTaskIndex]);

  const handleNext = () => {
    setCurrentTaskIndex((prev) => prev + 1);
  };

  return (
    <div className="tridentWrap">
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgb(255, 255, 255)",
        }}
      >
        <h1
          style={{
            color: "rgb(0, 158, 219)",
            fontWeight: "bold",
          }}
        >
          TRIDENT Quiz (JGeoGLUE)
        </h1>
        <AccountButton />
      </div>
      {session === undefined && (
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
      )}
      {session === null && <RequireLoginCard />}
      {session?.user && allTasks?.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div
            style={{
              width: "80%",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              padding: "20px",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "rgb(0, 158, 219)",
              }}
            >
              全問正解！
            </h2>
          </div>
        </div>
      )}
      {session?.user && currentTask && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                borderRadius: "5px",
                margin: "20px",
                width: "100vw",
              }}
            >
              <div
                style={{
                  width: "80%",
                  border: "1px solid #ccc",
                  backgroundColor: "#f9f9f9",
                  padding: "20px",
                }}
              >
                <GeoGLUETaskCard task={currentTask} onNext={handleNext} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
