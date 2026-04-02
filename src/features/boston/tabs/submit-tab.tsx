"use client";

import { useState } from "react";
import { useFarcasterUser, useShare } from "@/neynar-farcaster-sdk/mini";
import { CATEGORIES, NEIGHBORHOODS, CATEGORY_ICONS, Category } from "@/features/boston/types";
import { submitSpot, logSubmissionError } from "@/db/actions/boston-actions";

type SubmitState = "form" | "submitting" | "success" | "error";

type FormData = {
  name: string;
  category: string;
  neighborhood: string;
  description: string;
  address: string;
  link: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  category: "",
  neighborhood: "",
  description: "",
  address: "",
  link: "",
};

type SuccessData = {
  name: string;
  category: string;
  neighborhood: string;
};

function SuccessSpotPreview({
  data,
  username,
  displayName,
  pfpUrl,
}: {
  data: SuccessData;
  username: string;
  displayName: string;
  pfpUrl?: string | null;
}) {
  const icon = CATEGORY_ICONS[data.category as Category] ?? "📍";

  return (
    <div
      className="w-full border-2 border-[#e0e0e0] rounded-sm p-3 text-left bg-white"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-navy"
        >
          {icon} {data.category}
        </span>
      </div>
      <h3
        className="text-sm font-bold leading-tight mb-2 t-sans-navy"
      >
        {data.name}
      </h3>
      <div
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide t-sans-gray"
      >
        {pfpUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pfpUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-boston-blue"
          >
            {displayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span>📍 {data.neighborhood}</span>
        <span>·</span>
        <span className="text-boston-blue">@{username}</span>
      </div>
    </div>
  );
}

export function SubmitTab() {
  const { data: user } = useFarcasterUser();
  const { share } = useShare();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [state, setState] = useState<SubmitState>("form");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Clear the server error banner as soon as the user edits any field
  function handleFieldChange(update: Partial<FormData>) {
    if (state === "error") setState("form");
    if (serverError) setServerError(null);
    setForm((prev) => ({ ...prev, ...update }));
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.category) errs.category = "Required";
    if (!form.neighborhood) errs.neighborhood = "Required";
    if (!form.description.trim()) errs.description = "Required";
    if (form.description.length > 140) errs.description = "140 characters max";
    if (form.link.trim() && !/^https?:\/\/.+/.test(form.link.trim())) {
      errs.link = "Must start with http:// or https://";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setState("submitting");

    try {
      const result = await submitSpot({
        name: form.name.trim(),
        category: form.category,
        neighborhood: form.neighborhood,
        description: form.description.trim(),
        address: form.address.trim() || undefined,
        link: form.link.trim() || undefined,
        submittedByFid: user.fid,
        submittedByUsername: user.username ?? "",
        submittedByDisplayName: user.displayName ?? "",
        submittedByPfpUrl: user.pfpUrl,
      });

      if (result.success) {
        setSuccessData({
          name: form.name.trim(),
          category: form.category,
          neighborhood: form.neighborhood,
        });
        setForm(EMPTY_FORM);
        setErrors({});
        setServerError(null);
        setState("success");
      } else {
        setServerError(result.error ?? "Submission failed. Please try again.");
        setState("error");
        // Log to DB
        logSubmissionError({
          type: "spot",
          payload: JSON.stringify(form),
          errorMessage: result.error ?? "Unknown server error",
          userFid: user.fid,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setServerError(message);
      setState("error");
      logSubmissionError({
        type: "spot",
        payload: JSON.stringify(form),
        errorMessage: message,
        userFid: user.fid,
      });
    }
  }

  async function handleShare() {
    if (!successData) return;
    await share({
      text: `${successData.name} just got added to /boston by @${user?.username}. Check it out →`,
    });
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <p
          className="text-sm font-bold uppercase tracking-widest mb-2 t-sans-navy"
        >
          Sign in with Farcaster to submit.
        </p>
        <p
          className="text-sm italic t-serif-gray"
        >
          Every spot needs a person behind it. That&apos;s the whole point.
        </p>
      </div>
    );
  }

  if (state === "success" && successData) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-4 py-4 border-b border-[#e0e0e0] bg-navy">
          <h2
            className="text-lg font-black uppercase tracking-tight text-white t-sans"
          >
            Added.
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center p-6 gap-5">
          {/* Preview card */}
          <SuccessSpotPreview
            data={successData}
            username={user.username ?? ""}
            displayName={user.displayName ?? ""}
            pfpUrl={user.pfpUrl}
          />

          {/* Confirmation copy */}
          <p
            className="text-sm italic text-center t-serif-gray"
          >
            Live. The /boston community can see it now.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest t-sans-white bg-boston-blue min-h-11"
            >
              Share to /boston
            </button>
            <button
              onClick={() => setState("form")}
              className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest border-2 t-sans-navy bg-transparent border-navy min-h-11"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#e0e0e0] bg-navy">
        <h2
          className="text-lg font-black uppercase tracking-tight text-white t-sans"
        >
          Submit a Spot
        </h2>
        <p
          className="text-xs italic text-white opacity-60 mt-0.5 t-serif"
        >
          Submitting as @{user.username}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
        {/* Spot name */}
        <div>
          <label className="label-boston">Spot name *</label>
          <input
            type="text"
            placeholder="e.g. Tatte Bakery"
            value={form.name}
            onChange={(e) => handleFieldChange({ name: e.target.value })}
            className={`submit-input ${errors.name ? "submit-input-error" : ""}`}
          />
          {errors.name && (
            <p className="text-xs mt-1 font-bold t-sans-red">
              {errors.name}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="label-boston">Category *</label>
          <select
            value={form.category}
            onChange={(e) => handleFieldChange({ category: e.target.value })}
            aria-label="Category"
            className={`submit-input ${errors.category ? "submit-input-error" : ""}`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs mt-1 font-bold t-sans-red">
              {errors.category}
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

        {/* Description */}
        <div>
          <label className="label-boston">Why this spot? *</label>
          <textarea
            placeholder="One sentence. Be specific. 140 chars max."
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
            <span
              className={`text-xs font-medium t-sans ${form.description.length > 130 ? "text-boston-red" : "text-boston-gray-400"}`}
            >
              {form.description.length}/140
            </span>
          </div>
        </div>

        {/* Address (optional) */}
        <div>
          <label className="label-boston">
            Address <span className="text-boston-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 70 Farnsworth St, Boston"
            value={form.address}
            onChange={(e) => handleFieldChange({ address: e.target.value })}
            className="submit-input"
          />
        </div>

        {/* Link (optional) */}
        <div>
          <label className="label-boston">
            Website / Link <span className="text-boston-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            placeholder="e.g. https://tattebakery.com"
            value={form.link}
            onChange={(e) => handleFieldChange({ link: e.target.value })}
            className={`submit-input ${errors.link ? "submit-input-error" : ""}`}
          />
          {errors.link && (
            <p className="text-xs mt-1 font-bold t-sans-red">
              {errors.link}
            </p>
          )}
        </div>

        {/* Error state */}
        {state === "error" && (
          <div
            className="p-3 rounded-sm text-xs font-bold t-sans-red submit-error-box"
          >
            <p className="uppercase tracking-wide mb-1">Submission failed</p>
            {serverError && (
              <p className="font-normal text-xs italic t-serif">
                {serverError}
              </p>
            )}
            <button
              type="button"
              onClick={() => { setState("form"); setServerError(null); }}
              className="mt-2 text-xs font-bold uppercase tracking-widest underline bg-transparent border-0 cursor-pointer text-boston-red p-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150 disabled:opacity-50 t-sans-white bg-navy min-h-12"
        >
          {state === "submitting" ? "Adding..." : "Add to /boston"}
        </button>
      </form>
    </div>
  );
}
