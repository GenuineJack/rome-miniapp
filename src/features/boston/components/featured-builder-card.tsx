"use client";

import { Builder, BUILDER_CATEGORY_ICONS, BuilderCategory } from "@/features/boston/types";
import { BuilderAvatar } from "@/features/boston/components/builder-card";

type FeaturedBuilderCardProps = {
  builder: Builder & { spotCount?: number };
  onClick?: (builder: Builder) => void;
  onSpotFilterClick?: (fid: number, username: string) => void;
};

export function FeaturedBuilderCard({ builder, onClick, onSpotFilterClick }: FeaturedBuilderCardProps) {
  const categoryIcon = builder.category
    ? BUILDER_CATEGORY_ICONS[builder.category as BuilderCategory] ?? "✦"
    : null;

  const joinDate = new Date(builder.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

  const spotCount = builder.spotCount ?? 0;

  return (
    <div
      onClick={() => onClick?.(builder)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(builder); }}
      className="w-full text-left cursor-pointer focus:outline-none"
      style={{ background: "#091f2f", borderRadius: "3px", padding: "20px" }}
    >
      {/* Featured label */}
      <div
        className="text-[9px] font-bold uppercase tracking-widest mb-3"
        style={{ fontFamily: "var(--font-sans)", color: "#fcb61a" }}
      >
        ★ Featured Builder
      </div>

      {/* Top row: avatar + identity + category pill */}
      <div className="flex items-start gap-3 mb-3">
        <BuilderAvatar builder={builder} size={48} />

        <div className="flex-1 min-w-0">
          {/* Name + verified */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-sm font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {builder.displayName}
            </span>
            {builder.verified && (
              <span
                className="inline-flex items-center justify-center w-3 h-3 rounded-full text-white shrink-0"
                style={{ background: "#1871bd", fontSize: "7px", fontWeight: "900" }}
                aria-label="Verified"
              >
                ✓
              </span>
            )}
          </div>

          {/* Username */}
          <p
            className="text-[10px] leading-none mt-0.5"
            style={{ fontFamily: "var(--font-sans)", color: "#288be4" }}
          >
            @{builder.username}
          </p>

          {/* Neighborhood */}
          {builder.neighborhood && (
            <p
              className="text-[10px] mt-1"
              style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.5)" }}
            >
              📍 {builder.neighborhood}
            </p>
          )}
        </div>

        {/* Category pill */}
        {builder.category && categoryIcon && (
          <span
            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-sans)",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {categoryIcon} {builder.category}
          </span>
        )}
      </div>

      {/* Project line */}
      {builder.projectName && (
        <p
          className="text-xs mb-2 text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Building:{" "}
          {builder.projectUrl ? (
            <a
              href={builder.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold hover:underline"
              style={{ color: "#288be4" }}
            >
              {builder.projectName}
            </a>
          ) : (
            <span className="font-bold">{builder.projectName}</span>
          )}
        </p>
      )}

      {/* Bio — full text, no line clamp */}
      {builder.bio && (
        <p
          className="text-xs italic leading-snug mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "rgba(255,255,255,0.8)" }}
        >
          &ldquo;{builder.bio}&rdquo;
        </p>
      )}

      {/* Stats footer */}
      <div
        className="flex items-center gap-2 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (spotCount > 0) onSpotFilterClick?.(builder.fid, builder.username);
          }}
          className="text-[10px] font-medium leading-none focus:outline-none"
          style={{
            fontFamily: "var(--font-sans)",
            color: spotCount > 0 ? "#288be4" : "rgba(255,255,255,0.4)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: spotCount > 0 ? "pointer" : "default",
          }}
        >
          {spotCount > 0 ? `🗺 ${spotCount} spot${spotCount === 1 ? "" : "s"} in the guide` : "🗺 No spots yet"}
        </button>

        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>·</span>

        <span
          className="text-[10px] leading-none"
          style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.4)" }}
        >
          Joined {joinDate}
        </span>
      </div>
    </div>
  );
}
