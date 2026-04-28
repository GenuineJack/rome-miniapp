"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Spot, CATEGORY_LUCIDE, Category } from "@/features/boston/types";
import { useShare, ExternalLink, openExternalUrl } from "@/neynar-farcaster-sdk/mini";
import { Sparkles } from "lucide-react";

type SpotDetailSheetProps = {
  spot: Spot | null;
  onClose: () => void;
  onViewBuilder?: (fid: number) => void;
};

export function SpotDetailSheet({ spot, onClose, onViewBuilder }: SpotDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { share } = useShare();

  // Reset animation state when spot changes
  useEffect(() => {
    if (spot) {
      setTranslateY(0);
      setIsAnimatingOut(false);
    }
  }, [spot]);

  // Cleanup timer on unmount to prevent setState-after-unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsAnimatingOut(false);
      setTranslateY(0);
      onClose();
    }, 200);
  }, [onClose]);

  // Escape key to dismiss
  useEffect(() => {
    if (!spot) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [spot, handleClose]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setTranslateY(delta);
    }
  }

  function handleTouchEnd() {
    if (translateY > 100) {
      handleClose();
    } else {
      setTranslateY(0);
    }
    touchStartY.current = null;
  }

  const Icon = spot ? CATEGORY_LUCIDE[spot.category as Category] ?? Sparkles : Sparkles;

  function handleOpenMaps() {
    if (spot?.address) {
      const query = encodeURIComponent(spot.address);
      openExternalUrl(`https://maps.google.com/?q=${query}`);
    } else if (spot?.name) {
      const query = encodeURIComponent(`${spot.name} Boston MA`);
      openExternalUrl(`https://maps.google.com/?q=${query}`);
    }
  }

  const [shareToast, setShareToast] = useState<string | null>(null);

  async function handleShare() {
    if (!spot) return;
    const shareText = `${spot.name} — ${spot.description}\n\nAdded to /boston by @${spot.submittedByUsername}`;
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/?spotId=${spot.id}`
        : `/?spotId=${spot.id}`;

    // Try Farcaster compose first (no-op outside Farcaster).
    const result = await share({
      text: shareText,
      path: `/?spotId=${spot.id}`,
      channelKey: "boston",
    });

    // If Farcaster compose didn't happen (web context), fall back.
    if (!result || !("castHash" in result) || !result.castHash) {
      // Native Web Share API on supported devices.
      const nav = typeof navigator !== "undefined" ? navigator : null;
      if (nav && typeof nav.share === "function") {
        try {
          await nav.share({ title: spot.name, text: shareText, url: shareUrl });
          return;
        } catch {
          // user cancelled or share failed — fall through to clipboard
        }
      }
      // Clipboard fallback.
      try {
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(shareUrl);
          setShareToast("Link copied to clipboard");
          setTimeout(() => setShareToast(null), 2500);
        }
      } catch {
        setShareToast("Couldn't copy — long-press the URL to share");
        setTimeout(() => setShareToast(null), 2500);
      }
    }
  }

  if (!spot) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg overflow-hidden bg-white max-h-[70vh]"
        style={{
          transform: `translateY(${isAnimatingOut ? "100%" : `${translateY}px`})`,
          transition: isAnimatingOut
            ? "transform 0.2s ease-in"
            : translateY === 0
            ? "transform 0.2s ease-out"
            : "none",
        }}
      >
        {/* Drag handle — also touch target for swipe */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
        </div>

        <div
          className="px-4 pb-6 overflow-y-auto max-h-[calc(70vh-40px)]"
          onTouchStart={(e) => {
            // Only start a drag-to-dismiss if content is scrolled to top
            const el = e.currentTarget;
            if (el.scrollTop === 0) handleTouchStart(e);
          }}
          onTouchMove={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop === 0) handleTouchMove(e);
          }}
          onTouchEnd={handleTouchEnd}
        >
          {/* Category tag */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-white bg-navy"
            >
              <Icon size={14} aria-hidden="true" /> {spot.category}
            </span>
            {spot.featured && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest t-sans-navy bg-boston-yellow"
              >
                ★ Staff Pick
              </span>
            )}
          </div>

          {/* Name */}
          <h2
            className="text-xl font-bold leading-tight mb-2 t-sans-navy"
          >
            {spot.name}
          </h2>

          {/* Description */}
          <p
            className="text-sm italic leading-relaxed mb-4 t-serif-body"
          >
            &ldquo;{spot.description}&rdquo;
          </p>

          {/* Meta row — tappable if onViewBuilder provided */}
          <div
            className={`flex items-center gap-3 mb-4 pb-4 border-b border-[#e0e0e0] rounded-sm transition-colors duration-150 ${onViewBuilder ? "cursor-pointer hover:bg-[#f8f8f8] -mx-1 px-1" : ""}`}
            onClick={() => {
              if (onViewBuilder) {
                onViewBuilder(spot.submittedByFid);
              }
            }}
            {...(onViewBuilder ? { role: "button" as const, tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onViewBuilder(spot.submittedByFid); } } : {})}
          >
            {spot.submittedByPfpUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spot.submittedByPfpUrl}
                alt={spot.submittedByDisplayName}
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-boston-blue"
              >
                {spot.submittedByDisplayName[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="min-w-0">
              <p
                className="text-xs font-bold truncate t-sans-navy"
              >
                {spot.submittedByDisplayName}
              </p>
              <p
                className="text-xs truncate t-sans-blue"
              >
                @{spot.submittedByUsername}
              </p>
            </div>
            <div className="ml-auto text-right shrink-0 flex items-center gap-2">
              <p
                className="text-xs font-medium uppercase tracking-wide t-sans-gray"
              >
                📍 {spot.neighborhood}
              </p>
              {onViewBuilder && (
                <span className="chevron-sep">›</span>
              )}
            </div>
          </div>

          {/* Address */}
          {spot.address && (
            <p
              className="text-xs mb-4 t-sans-gray"
            >
              {spot.address}
            </p>
          )}

          {/* Link */}
          {spot.link && (
            <ExternalLink
              href={spot.link}
              className="flex items-center gap-1.5 text-xs font-bold mb-4 underline underline-offset-2 truncate t-sans-blue"
            >
              🔗 {(() => { try { return new URL(spot.link).hostname.replace(/^www\./, ""); } catch { return spot.link; } })()}
            </ExternalLink>
          )}

          {/* Actions — primary row */}
          <div className="flex gap-3 mb-2">
            <button
              onClick={handleOpenMaps}
              className="flex-1 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150 t-sans-white bg-boston-blue min-h-11"
            >
              Open in Maps
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150 t-sans-white bg-navy border-none cursor-pointer min-h-11"
            >
              Share
            </button>
          </div>
          {spot.link && (
            <ExternalLink
              href={spot.link}
              className="flex items-center justify-center py-3 rounded-sm text-sm font-bold uppercase tracking-widest border-2 border-[#1871bd] transition-colors duration-150 mb-2 t-sans-blue min-h-11 no-underline w-full"
            >
              Website
            </ExternalLink>
          )}
          {/* Secondary close action — less visual weight */}
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest border border-[#e0e0e0] transition-colors duration-150 hover:border-[#091f2f] t-sans-gray bg-transparent min-h-10"
          >
            Close
          </button>
        </div>
      </div>
      {shareToast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest shadow-lg"
        >
          {shareToast}
        </div>
      )}
    </>
  );
}
