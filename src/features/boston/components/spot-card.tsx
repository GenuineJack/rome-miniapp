"use client";

import { Spot, CATEGORY_ICONS, Category } from "@/features/boston/types";

type SpotCardProps = {
  spot: Spot;
  onClick?: (spot: Spot) => void;
  isNew?: boolean;
};

function handleDirections(spot: Spot, e: React.MouseEvent) {
  e.stopPropagation();
  const query = encodeURIComponent(spot.address ?? `${spot.name} Boston MA`);
  window.open(`https://maps.google.com/?q=${query}`, "_blank");
}

function handleShare(spot: Spot, e: React.MouseEvent) {
  e.stopPropagation();
  // Always use Warpcast compose URL — navigator.share is unreliable in mini-app webviews
  const text = `${spot.name} in ${spot.neighborhood} — check it out on /boston`;
  const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function SpotCard({ spot, onClick, isNew }: SpotCardProps) {
  const icon = CATEGORY_ICONS[spot.category as Category] ?? "📍";

  return (
    <div
      onClick={() => onClick?.(spot)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(spot); }}
      className="w-full text-left border-2 border-[#e0e0e0] rounded-sm p-3 bg-white transition-colors duration-150 hover:border-[#1871bd] focus:outline-none focus:border-[#1871bd] group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest t-sans-white bg-navy"
        >
          {icon} {spot.category}
        </span>
        {isNew && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest shrink-0 t-sans-white bg-boston-blue"
          >
            New
          </span>
        )}
        {spot.featured && !isNew && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest shrink-0 t-sans-navy"
            style={{ background: "#fcb61a" }}
          >
            ★ Pick
          </span>
        )}
      </div>

      <h3
        className="text-sm font-bold leading-tight mb-1 t-sans-navy"
      >
        {spot.name}
      </h3>

      <p
        className="text-xs italic leading-snug mb-2 line-clamp-2 t-serif-body"
      >
        &ldquo;{spot.description}&rdquo;
      </p>

      {/* Bottom row: meta + quick actions */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide min-w-0 t-sans-gray"
        >
          <span className="truncate">📍 {spot.neighborhood}</span>
          <span className="shrink-0">·</span>
          <span className="shrink-0">@{spot.submittedByUsername}</span>
        </div>

        {/* Quick action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {spot.link && (
            <a
              href={spot.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150 hover:bg-[#f0f0f0] text-boston-gray-400"
              title="Website"
              aria-label={`Website for ${spot.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
          )}
          <button
            onClick={(e) => handleDirections(spot, e)}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150 focus:outline-none hover:bg-[#f0f0f0] text-boston-gray-400"
            title="Get directions"
            aria-label={`Directions to ${spot.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </button>
          <button
            onClick={(e) => handleShare(spot, e)}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150 focus:outline-none hover:bg-[#f0f0f0] text-boston-gray-400"
            title="Share"
            aria-label={`Share ${spot.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
