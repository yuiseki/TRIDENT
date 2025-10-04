"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.location.href = "/duckdb";
  }, []);

  return <div>Redirecting to /duckdb...</div>;
}
