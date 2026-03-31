"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "boston-onboarding-seen";

const STEPS = [
  {
    emoji: "🗺",
    title: "Explore Boston",
    desc: "Restaurants, bars, parks, shops—all curated by the people who live here.",
  },
  {
    emoji: "📍",
    title: "Add Your Spots",
    desc: "Know a hidden gem? Submit it to the guide. Every spot needs a person behind it.",
  },
  {
    emoji: "👥",
    title: "Join the Builders",
    desc: "Building something in Boston? Add yourself to the directory and connect with the community.",
  },
];

export function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        onDismiss();
        return;
      }
    } catch {
      // localStorage unavailable — show overlay
    }
    setVisible(true);
  }, [onDismiss]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  }

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
    onDismiss();
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(9,31,47,0.92)" }}
    >
      <div
        className="flex flex-col items-center text-center px-8 py-10 mx-6 rounded-sm"
        style={{ background: "#fff", maxWidth: "340px", width: "100%" }}
      >
        <span className="text-4xl mb-4">{current.emoji}</span>
        <h2
          className="text-lg font-black uppercase tracking-tight mb-2"
          style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
        >
          {current.title}
        </h2>
        <p
          className="text-sm italic leading-relaxed mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#58585b", maxWidth: "260px" }}
        >
          {current.desc}
        </p>

        {/* Dots */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: "8px",
                height: "8px",
                background: i === step ? "#1871bd" : "#e0e0e0",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 rounded-sm text-xs font-bold uppercase tracking-widest mb-2"
          style={{
            fontFamily: "var(--font-sans)",
            background: "#091f2f",
            color: "#fff",
            border: "none",
            minHeight: "44px",
            cursor: "pointer",
          }}
        >
          {step < STEPS.length - 1 ? "Next" : "Get Started"}
        </button>

        {step < STEPS.length - 1 && (
          <button
            onClick={handleDismiss}
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ fontFamily: "var(--font-sans)", color: "#828282", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
