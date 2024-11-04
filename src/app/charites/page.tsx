"use client";

import dynamic from "next/dynamic";

const MyCharitesComponent = dynamic(
  () =>
    import("./MyCharitesComponent").then(
      (module) => module.MyCharitesComponent
    ),
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <>
      <MyCharitesComponent />
    </>
  );
}
