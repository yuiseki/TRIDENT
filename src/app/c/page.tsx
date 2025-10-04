"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.location.href = "/charites";
  }, []);

  return <div>Redirecting to /charites...</div>;
}
