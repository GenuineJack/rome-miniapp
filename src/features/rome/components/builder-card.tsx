"use client";

import { Builder, BUILDER_CATEGORY_LUCIDE, BuilderCategory } from "@/features/rome/types";
import { ExternalLink } from "@/neynar-farcaster-sdk/mini";
import { Sparkles } from "lucide-react";

type BuilderCardProps = {
  builder: Builder & { spotCount?: number };
  onClick?: (builder: Builder) => void;
  onSpotFilterClick?: (fid: number, username: string) => void;
};

function BuilderAvatar({ builder, size = 48 }: { builder: Builder; size?: number }) {
  const sizePx = `${size}px`;
  const fontSize = size >= 56 ? "20px" : "16px";

  if (builder.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={builder.avatarUrl}
        alt={builder.displayName}
        loading="lazy"
        className="rounded-full object-cover shrink-0"
        style={{ width: sizePx, height: sizePx }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white shrink-0 bg-boston-blue"
      style={{ width: sizePx, height: sizePx, fontSize }}
    >
      {builder.displayName[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export { BuilderAvatar };

export function BuilderCard({ builder, onClick, onSpotFilterClick }: BuilderCardProps) {
  const allCategories = builder.categories?.length
    ? builder.categories
    : builder.category ? [builder.category] : [];

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
      className="w-full text-left rounded-sm bg-white cursor-pointer focus:outline-none group card-builder"
    >
      {/* Top row: avatar + identity + category pill */}
      <div className="flex items-start gap-3 mb-3">
        <BuilderAvatar builder={builder} size={48} />

        <div className="flex-1 min-w-0">
          {/* Name + verified badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-sm font-bold leading-tight t-sans-navy"
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
            className="text-xs leading-none mt-0.5 t-sans-blue"
          >
            @{builder.username}
          </p>

          {/* Neighborhood */}
          {builder.neighborhood && (
            <p
              className="text-xs mt-1 t-sans-gray"
            >
              📍 {builder.neighborhood}
            </p>
          )}
        </div>

        {/* Category pill(s) — top right */}
        {allCategories.length > 0 && (
          <div className="shrink-0 flex flex-col gap-1">
            {allCategories.map((cat) => {
              const Icon = BUILDER_CATEGORY_LUCIDE[cat as BuilderCategory] ?? Sparkles;
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest text-white t-sans bg-navy"
                >
                  <Icon size={12} aria-hidden="true" /> {cat}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Project line */}
      {builder.projectName && (
        <p
          className="text-xs mb-2 t-sans-navy"
        >
          Building:{" "}
          {(builder.projectLinks?.[0] ?? builder.projectUrl) ? (
            <ExternalLink
              href={builder.projectLinks?.[0] ?? builder.projectUrl!}
              onClick={(e) => e.stopPropagation()}
              className="font-bold hover:underline text-boston-blue"
            >
              {builder.projectName}
            </ExternalLink>
          ) : (
            <span className="font-bold">{builder.projectName}</span>
          )}
        </p>
      )}

      {/* Bio */}
      {builder.bio && (
        <p
          className="text-[13px] italic leading-snug mb-3 line-clamp-2 t-serif-body"
        >
          &ldquo;{builder.bio}&rdquo;
        </p>
      )}

      {/* Stats footer */}
      <div
        className="flex items-center gap-2 pt-3 stats-divider"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (spotCount > 0) onSpotFilterClick?.(builder.fid, builder.username);
          }}
          className={`text-xs font-medium leading-none focus:outline-none t-sans btn-link-base ${spotCount > 0 ? "text-boston-blue cursor-pointer" : "text-boston-gray-400 cursor-default"}`}
        >
          {spotCount > 0 ? `🗺 ${spotCount} spot${spotCount === 1 ? "" : "s"} in the guide` : "🗺 No spots yet"}
        </button>

        <span className="dot-sep">·</span>

        <span
          className="text-xs leading-none t-sans-gray"
        >
          Joined {joinDate}
        </span>
      </div>
    </div>
  );
}
