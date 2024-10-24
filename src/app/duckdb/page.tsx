"use client";

import dynamic from "next/dynamic";

const MyDuckDBComponent = dynamic(
  () =>
    import("./MyDuckDBComponent").then((module) => module.MyDuckDBComponent),
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <>
      <MyDuckDBComponent />
    </>
  );
}
