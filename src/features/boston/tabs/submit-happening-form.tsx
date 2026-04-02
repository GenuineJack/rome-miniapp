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
        <p className="text-sm font-bold uppercase tracking-widest mb-2 t-sans-navy">
          Sign in with Farcaster to submit.
        </p>
        <p className="text-sm italic t-serif-gray">
          Every event needs a person behind it.
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center p-8 gap-5 text-center">
        <div className="text-4xl">{submittedEmoji}</div>
        <h3 className="text-lg font-black uppercase tracking-tight t-sans-navy">
          Event added.
        </h3>
        <p className="text-sm italic t-serif-gray">
          It&apos;s live in the Today tab for the /boston community.
        </p>
        <button
          onClick={() => { setForm(EMPTY_FORM); setState("form"); onSuccess(); }}
          className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest t-sans-white bg-navy min-h-11"
        >
          Done
        </button>
        <button
          onClick={() => { setForm(EMPTY_FORM); setState("form"); }}
          className="w-full py-2 text-sm font-bold uppercase tracking-widest t-sans-blue bg-transparent border-0 cursor-pointer"
        >
          Add Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      {/* Submitting as */}
      <p className="text-xs italic opacity-60 t-serif text-navy">
        Submitting as @{user.username}
      </p>

      {/* Emoji picker */}
      <div>
        <label className="label-boston">Event emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => handleFieldChange({ emoji: e })}
              className={`text-xl rounded-sm transition-all duration-100 emoji-btn ${
                form.emoji === e ? "emoji-btn-active" : "emoji-btn-inactive"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="label-boston">Event name *</label>
        <input
          type="text"
          placeholder="e.g. Dorchester Open Studios"
          value={form.title}
          onChange={(e) => handleFieldChange({ title: e.target.value })}
          className={`submit-input ${errors.title ? "submit-input-error" : ""}`}
        />
        {errors.title && (
          <p className="text-xs mt-1 font-bold t-sans-red">
            {errors.title}
          </p>
        )}
      </div>

      {/* Neighborhood */}
      <div>
        <label className="label-boston">Neighborhood *</label>
        <select
          value={form.neighborhood}
          onChange={(e) => handleFieldChange({ neighborhood: e.target.value })}
          aria-label="Neighborhood"
          className={`submit-input ${errors.neighborhood ? "submit-input-error" : ""}`}
        >
          <option value="">Select a neighborhood</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n.id} value={n.name}>{n.name}</option>
          ))}
        </select>
        {errors.neighborhood && (
          <p className="text-xs mt-1 font-bold t-sans-red">
            {errors.neighborhood}
          </p>
        )}
      </div>

      {/* Date label */}
      <div>
        <label className="label-boston">When is it? *</label>
        <input
          type="text"
          placeholder="e.g. This Saturday · Every Sunday in April · April 12"
          value={form.dateLabel}
          onChange={(e) => handleFieldChange({ dateLabel: e.target.value })}
          className={`submit-input ${errors.dateLabel ? "submit-input-error" : ""}`}
        />
        <p className="text-xs mt-1 t-sans-gray">
          Write it how you&apos;d say it out loud.
        </p>
        {errors.dateLabel && (
          <p className="text-xs mt-1 font-bold t-sans-red">
            {errors.dateLabel}
          </p>
        )}
      </div>

      {/* Date range (optional) */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="label-boston">Start date <span className="text-boston-gray-400 font-normal">(optional)</span></label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => handleFieldChange({ startDate: e.target.value })}
            className="submit-input"
            aria-label="Start date"
          />
        </div>
        <div className="flex-1">
          <label className="label-boston">End date <span className="text-boston-gray-400 font-normal">(optional)</span></label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => handleFieldChange({ endDate: e.target.value })}
            className="submit-input"
            aria-label="End date"
          />
          <p className="text-xs mt-1 t-sans-gray">
            Event hides after this date.
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label-boston">What is it? *</label>
        <textarea
          placeholder="One or two sentences. What's the vibe, why should someone go."
          value={form.description}
          onChange={(e) => handleFieldChange({ description: e.target.value })}
          rows={3}
          className={`submit-input submit-textarea ${errors.description ? "submit-input-error" : ""}`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-xs font-bold t-sans-red">
              {errors.description}
            </p>
          ) : <span />}
          <span className={`text-xs font-medium t-sans ${form.description.length > 180 ? "text-boston-red" : "text-boston-gray-400"}`}>
            {form.description.length}/200
          </span>
        </div>
      </div>

      {/* URL (optional) */}
      <div>
        <label className="label-boston">
          Website / Tickets <span className="text-boston-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="e.g. https://sowaartsdistrict.com"
          value={form.url}
          onChange={(e) => handleFieldChange({ url: e.target.value })}
          className={`submit-input ${errors.url ? "submit-input-error" : ""}`}
        />
        {errors.url && (
          <p className="text-xs mt-1 font-bold t-sans-red">
            {errors.url}
          </p>
        )}
      </div>

      {state === "error" && (
        <div className="p-3 rounded-sm text-xs font-bold uppercase tracking-wide t-sans-white bg-boston-red">
          Submission failed. Try again.
        </div>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150 disabled:opacity-50 t-sans-white bg-navy min-h-12"
      >
        {state === "submitting" ? "Adding..." : "Add to Today"}
      </button>
    </form>
  );
}
