"use client";

import { useEffect } from "react";
import { Theme } from "@neynar/ui";

const STORAGE_KEY = "rome-theme";
const LEGACY_STORAGE_KEY = "boston-theme";

export function ThemeClient() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const theme = stored === "dark" || stored === "light" ? stored : "light";

      // Clear stale legacy key so old Boston sessions don't force dark mode.
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, theme);

      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  return <Theme />;
}
