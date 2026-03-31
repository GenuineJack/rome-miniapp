"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Spot, CATEGORY_ICONS, Category } from "@/features/boston/types";

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

  const icon = spot ? CATEGORY_ICONS[spot.category as Category] ?? "📍" : "📍";

  function handleOpenMaps() {
    if (spot?.address) {
      const query = encodeURIComponent(spot.address);
      window.open(`https://maps.google.com/?q=${query}`, "_blank");
    } else if (spot?.name) {
      const query = encodeURIComponent(`${spot.name} Boston MA`);
      window.open(`https://maps.google.com/?q=${query}`, "_blank");
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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg overflow-hidden"
        style={{
          background: "#fff",
          maxHeight: "70vh",
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
          className="px-4 pb-6 overflow-y-auto"
          style={{ maxHeight: "calc(70vh - 40px)" }}
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-sans)", background: "#091f2f", color: "#fff" }}
            >
              {icon} {spot.category}
            </span>
            {spot.featured && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-sans)", background: "#fcb61a", color: "#091f2f" }}
              >
                ★ Staff Pick
              </span>
            )}
          </div>

          {/* Name */}
          <h2
            className="text-xl font-bold leading-tight mb-2"
            style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
          >
            {spot.name}
          </h2>

          {/* Description */}
          <p
            className="text-sm italic leading-relaxed mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "#58585b" }}
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
            role={onViewBuilder ? "button" : undefined}
            tabIndex={onViewBuilder ? 0 : undefined}
            onKeyDown={onViewBuilder ? (e) => { if (e.key === "Enter" || e.key === " ") onViewBuilder(spot.submittedByFid); } : undefined}
          >
            {spot.submittedByPfpUrl ? (
              <img
                src={spot.submittedByPfpUrl}
                alt={spot.submittedByDisplayName}
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "#1871bd" }}
              >
                {spot.submittedByDisplayName[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="min-w-0">
              <p
                className="text-xs font-bold truncate"
                style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
              >
                {spot.submittedByDisplayName}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ fontFamily: "var(--font-sans)", color: "#1871bd" }}
              >
                @{spot.submittedByUsername}
              </p>
            </div>
            <div className="ml-auto text-right shrink-0 flex items-center gap-2">
              <p
                className="text-[10px] font-medium uppercase tracking-wide"
                style={{ fontFamily: "var(--font-sans)", color: "#828282" }}
              >
                📍 {spot.neighborhood}
              </p>
              {onViewBuilder && (
                <span style={{ color: "#c0c0c0", fontSize: "12px" }}>›</span>
              )}
            </div>
          </div>

          {/* Address */}
          {spot.address && (
            <p
              className="text-xs mb-4"
              style={{ fontFamily: "var(--font-sans)", color: "#828282" }}
            >
              {spot.address}
            </p>
          )}

          {/* Link */}
          {spot.link && (
            <a
              href={spot.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold mb-4 underline underline-offset-2 truncate"
              style={{ fontFamily: "var(--font-sans)", color: "#1871bd" }}
            >
              🔗 {(() => { try { return new URL(spot.link).hostname.replace(/^www\./, ""); } catch { return spot.link; } })()}
            </a>
          )}

          {/* Actions — primary row */}
          <div className="flex gap-3 mb-2">
            <button
              onClick={handleOpenMaps}
              className="flex-1 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors duration-150"
              style={{
                fontFamily: "var(--font-sans)",
                background: "#1871bd",
                color: "#fff",
                minHeight: "44px",
              }}
            >
              Open in Maps
            </button>
            {spot.link && (
              <a
                href={spot.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center py-3 rounded-sm text-sm font-bold uppercase tracking-widest border-2 border-[#1871bd] transition-colors duration-150"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "#1871bd",
                  minHeight: "44px",
                  textDecoration: "none",
                }}
              >
                Website
              </a>
            )}
          </div>
          {/* Secondary close action — less visual weight */}
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest border border-[#e0e0e0] transition-colors duration-150 hover:border-[#091f2f]"
            style={{
              fontFamily: "var(--font-sans)",
              color: "#828282",
              background: "transparent",
              minHeight: "40px",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
