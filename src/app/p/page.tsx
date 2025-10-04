"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.location.href = "/planetiler";
  }, []);

  return <div>Redirecting to /planetiler...</div>;
}
