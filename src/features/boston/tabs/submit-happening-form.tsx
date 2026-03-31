"use client";

import { useState } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { NEIGHBORHOODS } from "@/features/boston/types";
import { submitHappening, logSubmissionError } from "@/db/actions/boston-actions";

const EMOJI_OPTIONS = ["📅", "🎨", "🎵", "🍕", "🏃", "🌿", "🎉", "🏀", "🎭", "🛠️", "🌊", "🍺"];

type SubmitState = "form" | "submitting" | "success" | "error";

type FormData = {
  title: string;
  description: string;
  neighborhood: string;
  dateLabel: string;
  startDate: string;
  endDate: string;
  emoji: string;
  url: string;
};

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  neighborhood: "",
  dateLabel: "",
  startDate: "",
  endDate: "",
  emoji: "📅",
  url: "",
};

function inputStyle(hasError?: boolean) {
  return {
    fontFamily: "var(--font-sans)",
    background: "#fff",
    color: "#091f2f",
    border: `2px solid ${hasError ? "#d22d23" : "#e0e0e0"}`,
    borderRadius: "3px",
    padding: "10px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
    minHeight: "44px",
  } as React.CSSProperties;
}

function labelStyle() {
  return {
    fontFamily: "var(--font-sans)",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: "#091f2f",
    marginBottom: "6px",
    display: "block",
  };
}

type Props = {
  onSuccess: () => void;
};

export function SubmitHappeningForm({ onSuccess }: Props) {
  const { data: user } = useFarcasterUser();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [state, setState] = useState<SubmitState>("form");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submittedEmoji, setSubmittedEmoji] = useState<string>("📅");

  // Clear the server error banner the moment the user edits any field
  function handleFieldChange(update: Partial<FormData>) {
    if (state === "error") setState("form");
    setForm((prev) => ({ ...prev, ...update }));
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.description.trim()) errs.description = "Required";
    if (form.description.length > 200) errs.description = "200 characters max";
    if (!form.neighborhood) errs.neighborhood = "Required";
    if (!form.dateLabel.trim()) errs.dateLabel = "Required";
    if (form.url.trim() && !/^https?:\/\/.+/.test(form.url.trim())) {
      errs.url = "Must start with http:// or https://";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !user) return;
    setState("submitting");

    try {
      const result = await submitHappening({
        title: form.title.trim(),
        description: form.description.trim(),
        neighborhood: form.neighborhood,
        dateLabel: form.dateLabel.trim(),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        emoji: form.emoji,
        url: form.url.trim() || undefined,
        submittedByFid: user.fid,
        submittedByUsername: user.username ?? "",
        submittedByDisplayName: user.displayName ?? "",
        submittedByPfpUrl: user.pfpUrl,
      });

      if (result.success) {
        setSubmittedEmoji(form.emoji); // capture before form reset
        setState("success");
      } else {
        setState("error");
        logSubmissionError({
          type: "happening",
          payload: JSON.stringify(form),
          errorMessage: result.error ?? "Unknown error",
          userFid: user.fid,
        });
      }
    } catch (err) {
      setState("error");
      logSubmissionError({
        type: "happening",
        payload: JSON.stringify(form),
        errorMessage: err instanceof Error ? err.message : "Network error",
        userFid: user.fid,
      });
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}>
          Sign in with Farcaster to submit.
        </p>
        <p className="text-sm italic"
          style={{ fontFamily: "var(--font-serif)", color: "#828282" }}>
          Every event needs a person behind it.
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center p-8 gap-5 text-center">
        <div className="text-4xl">{submittedEmoji}</div>
        <h3 className="text-lg font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}>
          Event added.
        </h3>
        <p className="text-sm italic"
          style={{ fontFamily: "var(--font-serif)", color: "#828282" }}>
          It&apos;s live in the Today tab for the /boston community.
        </p>
        <button
          onClick={() => { setForm(EMPTY_FORM); setState("form"); onSuccess(); }}
          className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: "var(--font-sans)", background: "#091f2f", color: "#fff", minHeight: "44px" }}
        >
          Done
        </button>
        <button
          onClick={() => { setForm(EMPTY_FORM); setState("form"); }}
          className="w-full py-2 text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: "var(--font-sans)", color: "#1871bd", background: "none", border: "none", cursor: "pointer" }}
        >
          Add Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      {/* Submitting as */}
      <p className="text-xs italic opacity-60"
        style={{ fontFamily: "var(--font-serif)", color: "#091f2f" }}>
        Submitting as @{user.username}
      </p>

      {/* Emoji picker */}
      <div>
        <label style={labelStyle()}>Event emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => handleFieldChange({ emoji: e })}
              className="text-xl rounded-sm transition-all duration-100"
              style={{
                width: "40px",
                height: "40px",
                border: `2px solid ${form.emoji === e ? "#1871bd" : "#e0e0e0"}`,
                background: form.emoji === e ? "rgba(24,113,189,0.08)" : "#fff",
                cursor: "pointer",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={labelStyle()}>Event name *</label>
        <input
          type="text"
          placeholder="e.g. Dorchester Open Studios"
          value={form.title}
          onChange={(e) => handleFieldChange({ title: e.target.value })}
          style={inputStyle(!!errors.title)}
        />
        {errors.title && (
          <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
            {errors.title}
          </p>
        )}
      </div>

      {/* Neighborhood */}
      <div>
        <label style={labelStyle()}>Neighborhood *</label>
        <select
          value={form.neighborhood}
          onChange={(e) => handleFieldChange({ neighborhood: e.target.value })}
          style={inputStyle(!!errors.neighborhood)}
        >
          <option value="">Select a neighborhood</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n.id} value={n.name}>{n.name}</option>
          ))}
        </select>
        {errors.neighborhood && (
          <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
            {errors.neighborhood}
          </p>
        )}
      </div>

      {/* Date label */}
      <div>
        <label style={labelStyle()}>When is it? *</label>
        <input
          type="text"
          placeholder="e.g. This Saturday · Every Sunday in April · April 12"
          value={form.dateLabel}
          onChange={(e) => handleFieldChange({ dateLabel: e.target.value })}
          style={inputStyle(!!errors.dateLabel)}
        />
        <p className="text-[10px] mt-1" style={{ fontFamily: "var(--font-sans)", color: "#828282" }}>
          Write it how you&apos;d say it out loud.
        </p>
        {errors.dateLabel && (
          <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
            {errors.dateLabel}
          </p>
        )}
      </div>

      {/* Date range (optional) */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label style={labelStyle()}>Start date <span style={{ color: "#828282", fontWeight: 400 }}>(optional)</span></label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => handleFieldChange({ startDate: e.target.value })}
            style={inputStyle()}
          />
        </div>
        <div className="flex-1">
          <label style={labelStyle()}>End date <span style={{ color: "#828282", fontWeight: 400 }}>(optional)</span></label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => handleFieldChange({ endDate: e.target.value })}
            style={inputStyle()}
          />
          <p className="text-[10px] mt-1" style={{ fontFamily: "var(--font-sans)", color: "#828282" }}>
            Event hides after this date.
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle()}>What is it? *</label>
        <textarea
          placeholder="One or two sentences. What's the vibe, why should someone go."
          value={form.description}
          onChange={(e) => handleFieldChange({ description: e.target.value })}
          rows={3}
          style={{ ...inputStyle(!!errors.description), resize: "none", minHeight: "80px" }}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-[10px] font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
              {errors.description}
            </p>
          ) : <span />}
          <span className="text-[10px] font-medium" style={{
            fontFamily: "var(--font-sans)",
            color: form.description.length > 180 ? "#d22d23" : "#828282",
          }}>
            {form.description.length}/200
          </span>
        </div>
      </div>

      {/* URL (optional) */}
      <div>
        <label style={labelStyle()}>
          Website / Tickets <span style={{ color: "#828282", fontWeight: "400" }}>(optional)</span>
        </label>
        <input
          type="url"
          placeholder="e.g. https://sowaartsdistrict.com"
          value={form.url}
          onChange={(e) => handleFieldChange({ url: e.target.value })}
          style={inputStyle(!!errors.url)}
        />
        {errors.url && (
          <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
            {errors.url}
          </p>
        )}
      </div>

      {state === "error" && (
        <div className="p-3 rounded-sm text-xs font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-sans)", background: "#d22d23", color: "#fff" }}>
          Submission failed. Try again.
        </div>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150 disabled:opacity-50"
        style={{ fontFamily: "var(--font-sans)", background: "#091f2f", color: "#fff", minHeight: "48px" }}
      >
        {state === "submitting" ? "Adding..." : "Add to Today"}
      </button>
    </form>
  );
}
