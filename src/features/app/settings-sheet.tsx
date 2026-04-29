"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "boston-theme";

function getStoredTheme(): "light" | "dark" {
  try {
    return (localStorage.getItem(STORAGE_KEY) as "light" | "dark") ?? "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: "light" | "dark") {
  try {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

type Props = {
  onClose: () => void;
};

export function SettingsSheet({ onClose }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-lg shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
        </div>

        <div className="px-5 pb-2 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-4">
            Settings
          </h2>

          {/* Dark mode row */}
          <div className="flex items-center justify-between py-3 border-t border-[#e0e0e0]">
            <div>
              <p className="text-sm font-bold t-sans-navy">Dark Mode</p>
              <p className="text-xs italic t-serif-gray mt-0.5">
                Switch between light and dark theme
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              role="switch"
              aria-checked={theme === "dark"}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                theme === "dark" ? "bg-boston-blue" : "bg-[#e0e0e0]"
              }`}
            >
              <span
                className={`inline-block w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 mb-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-navy bg-boston-gray-50 hover:bg-[#e0e0e0] transition-colors duration-150 focus:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
