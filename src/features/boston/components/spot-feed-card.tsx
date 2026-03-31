"use client";

import { Spot, CATEGORY_ICONS, Category } from "@/features/boston/types";

export function timeAgo(date: Date): string {
  const ms = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "just now";
  if (minutes < 60) return minutes === 1 ? "1m ago" : `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function SpotFeedCard({ spot, onClick }: { spot: Spot; onClick?: (spot: Spot) => void }) {
  const icon = CATEGORY_ICONS[spot.category as Category] ?? "📍";

  return (
    <div
      className={`bg-white p-4 border-2 border-[#e0e0e0] rounded-sm transition-colors duration-150 ${onClick ? "cursor-pointer hover:border-[#1871bd]" : ""}`}
      onClick={() => onClick?.(spot)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(spot); } : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="t-sans-white bg-navy inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest"
        >
          {icon} {spot.category}
        </span>
        <span
          className="t-sans-gray text-[10px] font-medium uppercase tracking-wide shrink-0"
        >
          {timeAgo(spot.createdAt)}
        </span>
      </div>

      <h3
        className="t-sans-navy text-sm font-bold mb-1 leading-tight"
      >
        {spot.name}
      </h3>

      <p
        className="t-serif-body text-xs italic leading-snug mb-3"
      >
        &ldquo;{spot.description}&rdquo;
      </p>

      <div className="flex items-center gap-2">
        {spot.submittedByPfpUrl ? (
          <img
            src={spot.submittedByPfpUrl}
            alt={spot.submittedByDisplayName}
            loading="lazy"
            className="w-6 h-6 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="bg-boston-blue w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          >
            {spot.submittedByDisplayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span
          className="t-sans-gray text-[10px] font-medium min-w-0"
        >
          Added by{" "}
          <span className="text-boston-blue">@{spot.submittedByUsername}</span>{" "}
          &middot; {spot.neighborhood}
        </span>
      </div>
    </div>
  );
}
