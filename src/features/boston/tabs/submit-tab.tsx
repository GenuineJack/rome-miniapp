"use client";

import { useState } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { useShare } from "@/neynar-farcaster-sdk/mini";
import { CATEGORIES, NEIGHBORHOODS, CATEGORY_ICONS, Category } from "@/features/boston/types";
import { submitSpot } from "@/db/actions/boston-actions";

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
      className="w-full border-2 border-[#e0e0e0] rounded-sm p-3 text-left"
      style={{ background: "#fff" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest"
          style={{ background: "#091f2f", color: "#fff", fontFamily: "var(--font-sans)" }}
        >
          {icon} {data.category}
        </span>
      </div>
      <h3
        className="text-sm font-bold leading-tight mb-2"
        style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
      >
        {data.name}
      </h3>
      <div
        className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide"
        style={{ fontFamily: "var(--font-sans)", color: "#828282" }}
      >
        {pfpUrl ? (
          <img src={pfpUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ background: "#1871bd" }}
          >
            {displayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span>📍 {data.neighborhood}</span>
        <span>·</span>
        <span style={{ color: "#1871bd" }}>@{username}</span>
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

  // Clear the server error banner as soon as the user edits any field
  function handleFieldChange(update: Partial<FormData>) {
    if (state === "error") setState("form");
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
      setState("success");
    } else {
      setState("error");
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
          className="text-sm font-bold uppercase tracking-widest mb-2"
          style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
        >
          Sign in with Farcaster to submit.
        </p>
        <p
          className="text-sm italic"
          style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
        >
          Every spot needs a person behind it. That&apos;s the whole point.
        </p>
      </div>
    );
  }

  if (state === "success" && successData) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-4 py-4 border-b border-[#e0e0e0]" style={{ background: "#091f2f" }}>
          <h2
            className="text-lg font-black uppercase tracking-tight text-white"
            style={{ fontFamily: "var(--font-sans)" }}
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
            className="text-sm italic text-center"
            style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
          >
            Live. The /boston community can see it now.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-sans)",
                background: "#1871bd",
                color: "#fff",
                minHeight: "44px",
              }}
            >
              Share to /boston
            </button>
            <button
              onClick={() => setState("form")}
              className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest border-2"
              style={{
                fontFamily: "var(--font-sans)",
                background: "transparent",
                color: "#091f2f",
                borderColor: "#091f2f",
                minHeight: "44px",
              }}
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
      <div className="px-4 py-4 border-b border-[#e0e0e0]" style={{ background: "#091f2f" }}>
        <h2
          className="text-lg font-black uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Submit a Spot
        </h2>
        <p
          className="text-xs italic text-white opacity-60 mt-0.5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Submitting as @{user.username}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
        {/* Spot name */}
        <div>
          <label style={labelStyle()}>Spot name *</label>
          <input
            type="text"
            placeholder="e.g. Tatte Bakery"
            value={form.name}
            onChange={(e) => handleFieldChange({ name: e.target.value })}
            style={inputStyle(!!errors.name)}
          />
          {errors.name && (
            <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle()}>Category *</label>
          <select
            value={form.category}
            onChange={(e) => handleFieldChange({ category: e.target.value })}
            style={inputStyle(!!errors.category)}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
              {errors.category}
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

        {/* Description */}
        <div>
          <label style={labelStyle()}>Why this spot? *</label>
          <textarea
            placeholder="One sentence. Be specific. 140 chars max."
            value={form.description}
            onChange={(e) => handleFieldChange({ description: e.target.value })}
            rows={3}
            style={{
              ...inputStyle(!!errors.description),
              resize: "none",
              minHeight: "80px",
            }}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-[10px] font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
                {errors.description}
              </p>
            ) : <span />}
            <span
              className="text-[10px] font-medium"
              style={{
                fontFamily: "var(--font-sans)",
                color: form.description.length > 130 ? "#d22d23" : "#828282",
              }}
            >
              {form.description.length}/140
            </span>
          </div>
        </div>

        {/* Address (optional) */}
        <div>
          <label style={labelStyle()}>
            Address <span style={{ color: "#828282", fontWeight: "400" }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 70 Farnsworth St, Boston"
            value={form.address}
            onChange={(e) => handleFieldChange({ address: e.target.value })}
            style={inputStyle()}
          />
        </div>

        {/* Link (optional) */}
        <div>
          <label style={labelStyle()}>
            Website / Link <span style={{ color: "#828282", fontWeight: "400" }}>(optional)</span>
          </label>
          <input
            type="url"
            placeholder="e.g. https://tattebakery.com"
            value={form.link}
            onChange={(e) => handleFieldChange({ link: e.target.value })}
            style={inputStyle(!!errors.link)}
          />
          {errors.link && (
            <p className="text-[10px] mt-1 font-bold" style={{ color: "#d22d23", fontFamily: "var(--font-sans)" }}>
              {errors.link}
            </p>
          )}
        </div>

        {/* Error state */}
        {state === "error" && (
          <div
            className="p-3 rounded-sm text-xs font-bold uppercase tracking-wide"
            style={{ fontFamily: "var(--font-sans)", background: "#d22d23", color: "#fff" }}
          >
            Submission failed. Try again.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150 disabled:opacity-50"
          style={{
            fontFamily: "var(--font-sans)",
            background: "#091f2f",
            color: "#fff",
            minHeight: "48px",
          }}
        >
          {state === "submitting" ? "Adding..." : "Add to /boston"}
        </button>
      </form>
    </div>
  );
}
