"use client";

import dynamic from "next/dynamic";

const MyComponent = dynamic(
  () =>
    import("./TridentFileSystem").then((module) => module.TridentFileSystem),
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <>
      <MyComponent />
    </>
  );
}
