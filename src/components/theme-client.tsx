"use client";

import { useEffect } from "react";
import { Theme } from "@neynar/ui";

export function ThemeClient() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("boston-theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  return <Theme />;
}
