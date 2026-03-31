"use client";

import { useState } from "react";
import {
  BUILDER_CATEGORIES,
  BUILDER_CATEGORY_ICONS,
  BuilderCategory,
  NEIGHBORHOODS,
  REGION_IDS,
  Builder,
} from "@/features/boston/types";
import { joinBuilderDirectory, updateBuilder } from "@/db/actions/boston-actions";
import { useFarcasterUser, useShare } from "@/neynar-farcaster-sdk/mini";

const CITY_NEIGHBORHOODS = NEIGHBORHOODS.filter((n) => !REGION_IDS.has(n.id));
const FORM_REGIONS = NEIGHBORHOODS.filter((n) => REGION_IDS.has(n.id));

const MAX_LINKS = 3;
const MAX_CATEGORIES = 3;

type JoinFormProps = {
  onSuccess: () => void;
  onClose: () => void;
  existingBuilder?: Builder | null;
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

function ensureHttps(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function BuilderJoinForm({ onSuccess, onClose, existingBuilder }: JoinFormProps) {
  const { data: user } = useFarcasterUser();
  const { share } = useShare();

  const isEditing = !!existingBuilder;

  const [formState, setFormState] = useState<FormState>("form");
  const [projectName, setProjectName] = useState(existingBuilder?.projectName ?? "");
  const [projectLinks, setProjectLinks] = useState<string[]>(
    existingBuilder?.projectLinks?.length ? existingBuilder.projectLinks : [""]
  );
  const [neighborhood, setNeighborhood] = useState(existingBuilder?.neighborhood ?? "");
  const [selectedCategories, setSelectedCategories] = useState<BuilderCategory[]>(
    (existingBuilder?.categories?.length
      ? existingBuilder.categories
      : existingBuilder?.category
        ? [existingBuilder.category]
        : []) as BuilderCategory[]
  );
  const [bio, setBio] = useState(existingBuilder?.bio ?? "");
  const [talkAbout, setTalkAbout] = useState(existingBuilder?.talkAbout ?? "");
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

  function handleLinkChange(index: number, value: string) {
    setProjectLinks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleLinkBlur(index: number) {
    setProjectLinks((prev) => {
      const next = [...prev];
      next[index] = ensureHttps(next[index]);
      return next;
    });
  }

  function addLink() {
    if (projectLinks.length < MAX_LINKS) {
      setProjectLinks((prev) => [...prev, ""]);
    }
  }

  function removeLink(index: number) {
    setProjectLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleCategory(cat: BuilderCategory) {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, cat];
    });
  }

  async function handleSubmit() {
    if (!user) return;

    if (!neighborhood || selectedCategories.length === 0) {
      setError("Neighborhood and at least one builder type are required.");
      return;
    }

    const cleanLinks = projectLinks.map((l) => ensureHttps(l)).filter((l) => l.length > 0);
    for (const link of cleanLinks) {
      if (!/^https?:\/\//i.test(link)) {
        setError("All project links must start with http:// or https://");
        return;
      }
    }

    setError(null);
    setFormState("submitting");

    const payload = {
      fid: user.fid,
      displayName: user.displayName ?? user.username ?? "Anonymous",
      username: user.username ?? "",
      avatarUrl: user.pfpUrl ?? undefined,
      bio: bio.trim() || undefined,
      projectName: projectName.trim() || undefined,
      projectLinks: cleanLinks,
      categories: selectedCategories,
      talkAbout: talkAbout.trim() || undefined,
      neighborhood,
      category: selectedCategories[0],
    };

    const result = isEditing
      ? await updateBuilder(user.fid, payload)
      : await joinBuilderDirectory(payload);

    if (result.success) {
      setFormState("success");
    } else {
      setError(result.error ?? "Something went wrong. Try again.");
      setFormState("form");
    }
  }

  async function handleShareToFarcaster() {
    await share({
      text: "Just joined the /boston builder directory. If you\u2019re building in Boston, claim your spot \u2192",
      channelKey: "boston",
    });
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

        {/* Project links — up to 3 */}
        <div>
          <label style={labelStyle}>Project links</label>
          {projectLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleLinkChange(i, e.target.value)}
                onBlur={() => handleLinkBlur(i)}
                placeholder="https://"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => { e.target.style.boxShadow = "0 0 0 3px rgba(24,113,189,0.25)"; e.target.style.borderColor = "#1871bd"; }}
              />
              {projectLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#828282", fontSize: "16px", padding: "4px" }}
                  aria-label="Remove link"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {projectLinks.length < MAX_LINKS && (
            <button
              type="button"
              onClick={addLink}
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-sans)", color: "#1871bd", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              + Add another link
            </button>
          )}
        </div>

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
            <optgroup label="Boston Neighborhoods">
              {CITY_NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </optgroup>
            <optgroup label="Greater Region">
              {FORM_REGIONS.map((n) => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Builder category — multi-select chips (up to 3) */}
        <div>
          <label style={labelStyle}>
            What kind of builder? <span style={{ color: "#1871bd" }}>*</span>
            <span style={{ fontWeight: "400", color: "#828282", marginLeft: 4 }}>(up to {MAX_CATEGORIES})</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BUILDER_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const isDisabled = !isSelected && selectedCategories.length >= MAX_CATEGORIES;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  disabled={isDisabled}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none"
                  style={{
                    fontFamily: "var(--font-sans)",
                    background: isSelected ? "#091f2f" : "transparent",
                    color: isSelected ? "#fff" : isDisabled ? "#c0c0c0" : "#091f2f",
                    border: `1px solid ${isSelected ? "#091f2f" : "#c0c0c0"}`,
                    minHeight: "34px",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  {BUILDER_CATEGORY_ICONS[cat]} {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio — expanded to 300 chars */}
        <div>
          <label style={labelStyle}>One-liner about you</label>
          <div style={{ position: "relative" }}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="What are you working on? Be specific. 300 chars max."
              maxLength={300}
              rows={3}
              style={{ ...inputStyle, paddingRight: "40px", resize: "none", minHeight: "80px" }}
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
                color: bio.length >= 280 ? "#1871bd" : "#c0c0c0",
              }}
            >
              {bio.length}/300
            </span>
          </div>
        </div>

        {/* Talk about */}
        <div>
          <label style={labelStyle}>Talk to me about</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={talkAbout}
              onChange={(e) => setTalkAbout(e.target.value.slice(0, 120))}
              placeholder="e.g. Solidity, community events, design..."
              maxLength={120}
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
                color: talkAbout.length >= 110 ? "#1871bd" : "#c0c0c0",
              }}
            >
              {talkAbout.length}/120
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
          {formState === "submitting" ? (isEditing ? "Saving..." : "Joining...") : isEditing ? "Save Changes" : "Join the Directory"}
        </button>
      </div>
    </div>
  );
}
