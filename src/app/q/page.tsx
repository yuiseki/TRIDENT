"use client";

import { AccountButton } from "@/components/AccountButton";
import { GeoEAGTaskComponent } from "@/components/GeoEAGTaskComponent";
import { GeoETATaskComponent } from "@/components/GeoETATaskComponent";
import { GeoGLUETaskCard } from "@/components/GeoGLUETaskCard";
import { RequireLoginCard } from "@/components/RequireLoginCard";
import { GeoGLUETasks } from "@/constants/GeoGLUETasks";
import { useSession } from "next-auth/react";

import { useState } from "react";

export default function Page() {
  const { data: session } = useSession();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask = GeoGLUETasks[currentTaskIndex];

  const handleNext = () => {
    setCurrentTaskIndex((prev) => prev + 1);
  };

  console.log("session:", session);

  return (
    <div className="tridentWrap">
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <h1>TRIDENT JGeoGLUE</h1>
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
      {session?.user && (
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
