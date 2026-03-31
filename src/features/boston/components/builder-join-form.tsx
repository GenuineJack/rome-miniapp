"use client";

import { useState } from "react";
import {
  BUILDER_CATEGORIES,
  BUILDER_CATEGORY_ICONS,
  BuilderCategory,
  NEIGHBORHOODS,
} from "@/features/boston/types";
import { joinBuilderDirectory } from "@/db/actions/boston-actions";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";

type JoinFormProps = {
  onSuccess: () => void;
  onClose: () => void;
};

type FormState = "form" | "submitting" | "success";

// Shared input style helper
const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "13px",
  color: "#091f2f",
  background: "#fff",
  border: "2px solid #e0e0e0",
  borderRadius: "3px",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "10px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "#091f2f",
  display: "block",
  marginBottom: "6px",
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={inputStyle}
        onFocus={(e) => { e.target.style.boxShadow = "0 0 0 3px rgba(24,113,189,0.25)"; e.target.style.borderColor = "#1871bd"; }}
        onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "#e0e0e0"; }}
      />
      {hint && (
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "#828282", marginTop: "4px", fontStyle: "italic" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function BuilderJoinForm({ onSuccess, onClose }: JoinFormProps) {
  const { data: user } = useFarcasterUser();

  const [formState, setFormState] = useState<FormState>("form");
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [category, setCategory] = useState<BuilderCategory | "">("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "14px", fontStyle: "italic", color: "#58585b" }}>
          Sign in with Farcaster to join the directory.
        </p>
      </div>
    );
  }

  async function handleSubmit() {
    if (!user) return;

    if (!neighborhood || !category) {
      setError("Neighborhood and builder type are required.");
      return;
    }

    if (projectUrl && projectUrl.trim() !== "" && !projectUrl.startsWith("http")) {
      setError("Project link must start with http:// or https://");
      return;
    }

    setError(null);
    setFormState("submitting");

    const result = await joinBuilderDirectory({
      fid: user.fid,
      displayName: user.displayName ?? user.username ?? "Anonymous",
      username: user.username ?? "",
      avatarUrl: user.pfpUrl ?? undefined,
      bio: bio.trim() || undefined,
      projectName: projectName.trim() || undefined,
      projectUrl: projectUrl.trim() || undefined,
      neighborhood,
      category,
    });

    if (result.success) {
      setFormState("success");
    } else {
      setError(result.error ?? "Something went wrong. Try again.");
      setFormState("form");
    }
  }

  function handleShareToFarcaster() {
    const text = encodeURIComponent(
      "Just joined the /boston builder directory. If you\u2019re building in Boston, claim your spot \u2192"
    );
    const url = `https://farcaster.xyz/~/compose?text=${text}`;
    window.open(url, "_blank");
  }

  if (formState === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center gap-6">
        {/* Avatar */}
        {user.pfpUrl ? (
          <img
            src={user.pfpUrl}
            alt={user.displayName ?? user.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white"
            style={{ background: "#1871bd" }}
          >
            {(user.displayName ?? user.username ?? "?")[0]?.toUpperCase()}
          </div>
        )}

        <div>
          <p
            className="font-bold text-base"
            style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
          >
            {user.displayName ?? user.username}
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-sans)", color: "#1871bd" }}
          >
            @{user.username}
          </p>
        </div>

        <p
          className="text-sm italic leading-relaxed"
          style={{ fontFamily: "var(--font-serif)", color: "#58585b", maxWidth: "260px" }}
        >
          You&apos;re in the /boston builder directory.
        </p>

        <div className="flex flex-col gap-3 w-full" style={{ maxWidth: "300px" }}>
          <button
            onClick={handleShareToFarcaster}
            className="w-full py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90 focus:outline-none"
            style={{
              fontFamily: "var(--font-sans)",
              background: "#1871bd",
              color: "#fff",
              border: "none",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            Share to /boston
          </button>
          <button
            onClick={() => {
              // onSuccess triggers parent reload; onClose unmounts this overlay.
              // Both are safe to call synchronously — React batches the state updates.
              onSuccess();
              onClose();
            }}
            className="w-full py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none"
            style={{
              fontFamily: "var(--font-sans)",
              color: "#091f2f",
              background: "transparent",
              border: "2px solid #091f2f",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            View Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col gap-5 p-5">
        {/* Identity card — non-editable */}
        <div
          className="flex items-center gap-3 p-3 rounded-sm"
          style={{ background: "#f3f3f3", border: "1px solid #e0e0e0" }}
        >
          {user.pfpUrl ? (
            <img
              src={user.pfpUrl}
              alt={user.displayName ?? user.username}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
              style={{ background: "#1871bd" }}
            >
              {(user.displayName ?? user.username ?? "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
            >
              {user.displayName ?? user.username}
            </p>
            <p
              className="text-[10px] truncate"
              style={{ fontFamily: "var(--font-sans)", color: "#1871bd" }}
            >
              @{user.username}
            </p>
          </div>
          <span
            className="ml-auto text-[9px] font-bold uppercase tracking-widest shrink-0"
            style={{ fontFamily: "var(--font-sans)", color: "#828282" }}
          >
            Joining as
          </span>
        </div>

        {/* What are you building */}
        <InputField
          label="What are you building?"
          value={projectName}
          onChange={setProjectName}
          placeholder="e.g. Higher Book Club"
          maxLength={60}
        />

        {/* Project link */}
        <InputField
          label="Project link"
          value={projectUrl}
          onChange={setProjectUrl}
          placeholder="https://"
          type="url"
        />

        {/* Neighborhood */}
        <div>
          <label style={labelStyle}>
            Your neighborhood <span style={{ color: "#1871bd" }}>*</span>
          </label>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            style={{
              ...inputStyle,
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23828282' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "32px",
            }}
            onFocus={(e) => { e.target.style.boxShadow = "0 0 0 3px rgba(24,113,189,0.25)"; e.target.style.borderColor = "#1871bd"; }}
            onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "#e0e0e0"; }}
          >
            <option value="">Select a neighborhood</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n.id} value={n.name}>{n.name}</option>
            ))}
          </select>
        </div>

        {/* Builder category — pill select */}
        <div>
          <label style={labelStyle}>
            What kind of builder? <span style={{ color: "#1871bd" }}>*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BUILDER_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none"
                  style={{
                    fontFamily: "var(--font-sans)",
                    background: isSelected ? "#091f2f" : "transparent",
                    color: isSelected ? "#fff" : "#091f2f",
                    border: `1px solid ${isSelected ? "#091f2f" : "#c0c0c0"}`,
                    minHeight: "34px",
                    cursor: "pointer",
                  }}
                >
                  {BUILDER_CATEGORY_ICONS[cat]} {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label style={labelStyle}>One-liner about you</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              placeholder="100 chars. Be specific."
              maxLength={100}
              style={{ ...inputStyle, paddingRight: "40px" }}
              onFocus={(e) => { e.target.style.boxShadow = "0 0 0 3px rgba(24,113,189,0.25)"; e.target.style.borderColor = "#1871bd"; }}
              onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = "#e0e0e0"; }}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                bottom: "10px",
                fontFamily: "var(--font-sans)",
                fontSize: "9px",
                color: bio.length >= 90 ? "#1871bd" : "#c0c0c0",
              }}
            >
              {bio.length}/100
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-xs px-3 py-2 rounded-sm"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "#c0392b",
              background: "rgba(192,57,43,0.08)",
              border: "1px solid rgba(192,57,43,0.2)",
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={formState === "submitting"}
          className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-opacity duration-150 focus:outline-none"
          style={{
            fontFamily: "var(--font-sans)",
            background: "#091f2f",
            color: "#fff",
            border: "none",
            minHeight: "48px",
            cursor: formState === "submitting" ? "not-allowed" : "pointer",
            opacity: formState === "submitting" ? 0.6 : 1,
          }}
        >
          {formState === "submitting" ? "Joining..." : "Join the Directory"}
        </button>
      </div>
    </div>
  );
}
