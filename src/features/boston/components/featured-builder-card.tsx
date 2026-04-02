"use client";

import { Builder, BUILDER_CATEGORY_ICONS, BuilderCategory } from "@/features/boston/types";
import { BuilderAvatar } from "@/features/boston/components/builder-card";
import { ExternalLink } from "@/neynar-farcaster-sdk/mini";

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
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(builder); }}
      className="w-full text-left cursor-pointer focus:outline-none bg-navy card-featured-builder"
    >
      {/* Featured label */}
      <div
        className="text-[11px] font-bold uppercase tracking-widest mb-3 t-sans text-boston-yellow"
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
              className="text-sm font-bold leading-tight text-white t-sans"
            >
              {builder.displayName}
            </span>
            {builder.verified && (
              <span
                className="inline-flex items-center justify-center w-3 h-3 rounded-full text-white shrink-0 bg-boston-blue badge-verified"
                aria-label="Verified"
              >
                ✓
              </span>
            )}
          </div>

          {/* Username */}
          <p
            className="text-xs leading-none mt-0.5 t-sans text-boston-blue-light"
          >
            @{builder.username}
          </p>

          {/* Neighborhood */}
          {builder.neighborhood && (
            <p
              className="text-xs mt-1 t-sans text-white/50"
            >
              📍 {builder.neighborhood}
            </p>
          )}
        </div>

        {/* Category pill */}
        {builder.category && categoryIcon && (
          <span
            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest t-sans bg-white/10 text-white/85"
          >
            {categoryIcon} {builder.category}
          </span>
        )}
      </div>

      {/* Project line */}
      {builder.projectName && (
        <p
          className="text-xs mb-2 text-white t-sans"
        >
          Building:{" "}
          {builder.projectUrl ? (
            <ExternalLink
              href={builder.projectUrl}
              onClick={(e) => e.stopPropagation()}
              className="font-bold hover:underline text-boston-blue-light"
            >
              {builder.projectName}
            </ExternalLink>
          ) : (
            <span className="font-bold">{builder.projectName}</span>
          )}
        </p>
      )}

      {/* Bio — full text, no line clamp */}
      {builder.bio && (
        <p
          className="text-[13px] italic leading-snug mb-3 t-serif text-white/80"
        >
          &ldquo;{builder.bio}&rdquo;
        </p>
      )}

      {/* Stats footer */}
      <div
        className="flex items-center gap-2 pt-3 stats-divider-dark"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (spotCount > 0) onSpotFilterClick?.(builder.fid, builder.username);
          }}
          className={`text-xs font-medium leading-none focus:outline-none t-sans btn-link-base ${spotCount > 0 ? "text-boston-blue-light cursor-pointer" : "text-white/40 cursor-default"}`}
        >
          {spotCount > 0 ? `🗺 ${spotCount} spot${spotCount === 1 ? "" : "s"} in the guide` : "🗺 No spots yet"}
        </button>

        <span className="dot-sep-dark">·</span>

        <span
          className="text-xs leading-none t-sans text-white/40"
        >
          Joined {joinDate}
        </span>
      </div>
    </div>
  );
}
