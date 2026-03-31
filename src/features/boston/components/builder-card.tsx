"use client";

import { Builder, BUILDER_CATEGORY_ICONS, BuilderCategory } from "@/features/boston/types";

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
      className="rounded-full flex items-center justify-center font-black text-white shrink-0"
      style={{ width: sizePx, height: sizePx, background: "#1871bd", fontSize }}
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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(builder); }}
      className="w-full text-left rounded-sm bg-white cursor-pointer focus:outline-none group"
      style={{ border: "2px solid #e0e0e0", borderRadius: "3px", padding: "16px", transition: "border-color 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1871bd"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
    >
      {/* Top row: avatar + identity + category pill */}
      <div className="flex items-start gap-3 mb-3">
        <BuilderAvatar builder={builder} size={48} />

        <div className="flex-1 min-w-0">
          {/* Name + verified badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-sm font-bold leading-tight"
              style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
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
            style={{ fontFamily: "var(--font-sans)", color: "#1871bd" }}
          >
            @{builder.username}
          </p>

          {/* Neighborhood */}
          {builder.neighborhood && (
            <p
              className="text-[10px] mt-1"
              style={{ fontFamily: "var(--font-sans)", color: "#828282" }}
            >
              📍 {builder.neighborhood}
            </p>
          )}
        </div>

        {/* Category pill(s) — top right */}
        {allCategories.length > 0 && (
          <div className="shrink-0 flex flex-col gap-1">
            {allCategories.map((cat) => {
              const icon = BUILDER_CATEGORY_ICONS[cat as BuilderCategory] ?? "✦";
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{ fontFamily: "var(--font-sans)", background: "#091f2f" }}
                >
                  {icon} {cat}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Project line */}
      {builder.projectName && (
        <p
          className="text-xs mb-2"
          style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
        >
          Building:{" "}
          {(builder.projectLinks?.[0] ?? builder.projectUrl) ? (
            <a
              href={builder.projectLinks?.[0] ?? builder.projectUrl!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold hover:underline"
              style={{ color: "#1871bd" }}
            >
              {builder.projectName}
            </a>
          ) : (
            <span className="font-bold">{builder.projectName}</span>
          )}
        </p>
      )}

      {/* Bio */}
      {builder.bio && (
        <p
          className="text-xs italic leading-snug mb-3 line-clamp-2"
          style={{ fontFamily: "var(--font-serif)", color: "#58585b" }}
        >
          &ldquo;{builder.bio}&rdquo;
        </p>
      )}

      {/* Stats footer */}
      <div
        className="flex items-center gap-2 pt-3"
        style={{ borderTop: "1px solid #e0e0e0" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (spotCount > 0) onSpotFilterClick?.(builder.fid, builder.username);
          }}
          className="text-[10px] font-medium leading-none focus:outline-none"
          style={{
            fontFamily: "var(--font-sans)",
            color: spotCount > 0 ? "#1871bd" : "#828282",
            background: "none",
            border: "none",
            padding: 0,
            cursor: spotCount > 0 ? "pointer" : "default",
          }}
        >
          {spotCount > 0 ? `🗺 ${spotCount} spot${spotCount === 1 ? "" : "s"} in the guide` : "🗺 No spots yet"}
        </button>

        <span style={{ color: "#c0c0c0", fontSize: "10px" }}>·</span>

        <span
          className="text-[10px] leading-none"
          style={{ fontFamily: "var(--font-sans)", color: "#828282" }}
        >
          Joined {joinDate}
        </span>
      </div>
    </div>
  );
}
