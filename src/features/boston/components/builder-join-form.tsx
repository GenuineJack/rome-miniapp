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
      <label className="t-sans-navy form-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="t-serif form-input"
      />
      {hint && (
        <p className="t-serif-gray form-hint">
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
        <p className="t-serif-body text-sm italic">
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.pfpUrl}
            alt={user.displayName ?? user.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white bg-boston-blue"
          >
            {(user.displayName ?? user.username ?? "?")[0]?.toUpperCase()}
          </div>
        )}

        <div>
          <p
            className="font-bold text-base t-sans-navy"
          >
            {user.displayName ?? user.username}
          </p>
          <p
            className="text-xs t-sans-blue"
          >
            @{user.username}
          </p>
        </div>

        <p
          className="text-sm italic leading-relaxed t-serif-body max-w-[260px]"
        >
          You&apos;re in the /boston builder directory.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          <button
            onClick={handleShareToFarcaster}
            className="w-full py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90 focus:outline-none t-sans-white bg-boston-blue btn-form-primary"
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
            className="w-full py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none t-sans-navy btn-form-outline"
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
          className="flex items-center gap-3 p-3 rounded-sm bg-boston-gray-50 identity-card"
        >
          {user.pfpUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.pfpUrl}
              alt={user.displayName ?? user.username}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 bg-boston-blue"
            >
              {(user.displayName ?? user.username ?? "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p
              className="text-sm font-bold truncate t-sans-navy"
            >
              {user.displayName ?? user.username}
            </p>
            <p
              className="text-xs truncate t-sans-blue"
            >
              @{user.username}
            </p>
          </div>
          <span
            className="ml-auto text-[11px] font-bold uppercase tracking-widest shrink-0 t-sans-gray"
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
          <label className="t-sans-navy form-label">Project links</label>
          {projectLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleLinkChange(i, e.target.value)}
                onBlur={() => { handleLinkBlur(i); }}
                placeholder="https://"
                className="t-serif form-input flex-1"
              />
              {projectLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="text-boston-gray-400 btn-remove"
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
              className="text-xs font-bold uppercase tracking-widest t-sans-blue btn-unstyled"
            >
              + Add another link
            </button>
          )}
        </div>

        {/* Neighborhood */}
        <div>
          <label className="t-sans-navy form-label">
            Your neighborhood <span className="text-boston-blue">*</span>
          </label>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            aria-label="Your neighborhood"
            className="t-sans form-select"
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
          <label className="t-sans-navy form-label">
            What kind of builder? <span className="text-boston-blue">*</span>
            <span className="text-boston-gray-400 font-normal ml-1">(up to {MAX_CATEGORIES})</span>
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
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none t-sans min-h-[34px] ${
                    isSelected
                      ? "bg-navy text-white border border-navy"
                      : isDisabled
                        ? "bg-transparent text-[#c0c0c0] border border-[#c0c0c0] cursor-not-allowed opacity-50"
                        : "bg-transparent text-navy border border-[#c0c0c0] cursor-pointer"
                  }`}
                >
                  {BUILDER_CATEGORY_ICONS[cat]} {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio — expanded to 300 chars */}
        <div>
          <label className="t-sans-navy form-label">One-liner about you</label>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="What are you working on? Be specific. 300 chars max."
              maxLength={300}
              rows={3}
              className="t-serif form-input form-input-with-counter resize-none min-h-20"
            />
            <span
              className={`t-sans form-char-counter ${bio.length >= 280 ? "text-boston-blue" : "text-[#c0c0c0]"}`}
            >
              {bio.length}/300
            </span>
          </div>
        </div>

        {/* Talk about */}
        <div>
          <label className="t-sans-navy form-label">Talk to me about</label>
          <div className="relative">
            <input
              type="text"
              value={talkAbout}
              onChange={(e) => setTalkAbout(e.target.value.slice(0, 120))}
              placeholder="e.g. Solidity, community events, design..."
              maxLength={120}
              className="t-serif form-input form-input-with-counter"
            />
            <span
              className={`t-sans form-char-counter ${talkAbout.length >= 110 ? "text-boston-blue" : "text-[#c0c0c0]"}`}
            >
              {talkAbout.length}/120
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-xs px-3 py-2 rounded-sm t-serif form-error"
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={formState === "submitting"}
          className="w-full py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-opacity duration-150 focus:outline-none t-sans-white bg-navy btn-form-submit"
        >
          {formState === "submitting" ? (isEditing ? "Saving..." : "Joining...") : isEditing ? "Save Changes" : "Join the Directory"}
        </button>
      </div>
    </div>
  );
}
