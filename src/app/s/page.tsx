"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.location.href = "/split";
  }, []);

  return <div>Redirecting to /split...</div>;
}
