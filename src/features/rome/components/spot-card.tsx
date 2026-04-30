"use client";

import { Spot, CATEGORY_LUCIDE, Category } from "@/features/rome/types";
import { ExternalLink, openExternalUrl } from "@/neynar-farcaster-sdk/mini";
import { buildComposeUrl } from "@/lib/farcaster-urls";
import { Globe, MapPin, Share2, Sparkles } from "lucide-react";

type SpotCardProps = {
  spot: Spot;
  onClick?: (spot: Spot) => void;
  isNew?: boolean;
};

function handleDirections(spot: Spot, e: React.MouseEvent) {
  e.stopPropagation();
  const query = encodeURIComponent(spot.address ?? `${spot.name} Rome Italy`);
  openExternalUrl(`https://maps.google.com/?q=${query}`);
}

function handleShare(spot: Spot, e: React.MouseEvent) {
  e.stopPropagation();
  // navigator.share is unreliable in mini-app webviews, so always go through compose.
  const text = `${spot.name} in ${spot.neighborhood} — check it out on /rome`;
  openExternalUrl(buildComposeUrl(text));
}

export function SpotCard({ spot, onClick, isNew }: SpotCardProps) {
  const Icon = CATEGORY_LUCIDE[spot.category as Category] ?? Sparkles;

  return (
    <div
      onClick={() => onClick?.(spot)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(spot); }}
      className="w-full text-left border-2 border-boston-gray-100 rounded-sm p-3 bg-white transition-colors duration-150 hover:border-boston-blue focus:outline-none focus:border-boston-blue group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-navy"
        >
          <Icon size={14} aria-hidden="true" /> {spot.category}
        </span>
        {isNew && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest shrink-0 t-sans-white bg-boston-blue"
          >
            New
          </span>
        )}
        {spot.featured && !isNew && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest shrink-0 t-sans-navy bg-boston-yellow"
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
        className="text-[13px] italic leading-snug mb-2 line-clamp-2 t-serif-body"
      >
        &ldquo;{spot.description}&rdquo;
      </p>

      {/* Bottom row: meta + quick actions */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide min-w-0 t-sans-gray"
        >
          <span className="truncate">📍 {spot.neighborhood}</span>
          <span className="shrink-0">·</span>
          <span className="shrink-0">@{spot.submittedByUsername}</span>
        </div>

        {/* Quick action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {spot.link && (
            <ExternalLink
              href={spot.link}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150 hover:bg-boston-gray-50 text-boston-gray-400"
              title="Website"
              aria-label={`Website for ${spot.name}`}
            >
              <Globe size={14} strokeWidth={2.5} aria-hidden="true" />
            </ExternalLink>
          )}
          <button
            onClick={(e) => handleDirections(spot, e)}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150 focus:outline-none hover:bg-boston-gray-50 text-boston-gray-400"
            title="Get directions"
            aria-label={`Directions to ${spot.name}`}
          >
            <MapPin size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button
            onClick={(e) => handleShare(spot, e)}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-colors duration-150 focus:outline-none hover:bg-boston-gray-50 text-boston-gray-400"
            title="Share"
            aria-label={`Share ${spot.name}`}
          >
            <Share2 size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
