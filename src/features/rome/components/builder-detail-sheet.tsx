"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Builder, Spot, BUILDER_CATEGORY_LUCIDE, BuilderCategory } from "@/features/rome/types";
import { Sparkles } from "lucide-react";
import { getSpotsByBuilder } from "@/db/actions/rome-actions";
import { SpotCard } from "@/features/rome/components/spot-card";
import { BuilderAvatar } from "@/features/rome/components/builder-card";
import { useShare, ExternalLink } from "@/neynar-farcaster-sdk/mini";

type BuilderDetailSheetProps = {
  builder: Builder | null;
  onClose: () => void;
  onSpotClick?: (spot: Spot) => void;
  onViewBuilderSpots?: (fid: number, username: string) => void;
};

export function BuilderDetailSheet({
  builder,
  onClose,
  onSpotClick,
  onViewBuilderSpots,
}: BuilderDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [builderSpots, setBuilderSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const { share } = useShare();

  useEffect(() => {
    if (builder) {
      setTranslateY(0);
      setIsAnimatingOut(false);
      setSpotsLoading(true);
      getSpotsByBuilder(builder.fid, 5).then((data) => {
        setBuilderSpots(data);
        setSpotsLoading(false);
      });
    }
  }, [builder]);

  // Cleanup timer on unmount
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
    if (!builder) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [builder, handleClose]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setTranslateY(delta);
  }

  function handleTouchEnd() {
    if (translateY > 100) {
      handleClose();
    } else {
      setTranslateY(0);
    }
    touchStartY.current = null;
  }

  if (!builder) return null;

  const _CategoryIcon = builder.category
    ? BUILDER_CATEGORY_LUCIDE[builder.category as BuilderCategory] ?? Sparkles
    : null;

  const allCategories = builder.categories?.length
    ? builder.categories
    : builder.category ? [builder.category] : [];

  const allLinks = builder.projectLinks?.length
    ? builder.projectLinks
    : builder.projectUrl ? [builder.projectUrl] : [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={handleClose} />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg overflow-hidden bg-white max-h-[82vh]"
        style={{
          transform: `translateY(${isAnimatingOut ? "100%" : `${translateY}px`})`,
          transition: isAnimatingOut
            ? "transform 0.2s ease-in"
            : translateY === 0
            ? "transform 0.2s ease-out"
            : "none",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
        </div>

        <div
          className="px-4 pb-6 overflow-y-auto max-h-[calc(82vh-40px)]"
          onTouchStart={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop === 0) handleTouchStart(e);
          }}
          onTouchMove={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop === 0) handleTouchMove(e);
          }}
          onTouchEnd={handleTouchEnd}
        >
          {/* Identity block */}
          <div className="flex items-start gap-4 mb-4">
            <BuilderAvatar builder={builder} size={64} />

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h2
                  className="text-lg font-bold leading-tight t-sans-navy"
                >
                  {builder.displayName}
                </h2>
                {builder.verified && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0 bg-boston-blue text-[11px] font-black"
                    aria-label="Verified"
                  >
                    ✓
                  </span>
                )}
              </div>

              <p
                className="text-xs leading-none mb-2 t-sans-blue"
              >
                @{builder.username}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {allCategories.map((cat) => {
                  const Icon = BUILDER_CATEGORY_LUCIDE[cat as BuilderCategory] ?? Sparkles;
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-widest t-sans-white bg-navy"
                    >
                      <Icon size={12} aria-hidden="true" /> {cat}
                    </span>
                  );
                })}
                {builder.neighborhood && (
                  <span
                    className="text-xs t-sans-gray"
                  >
                    📍 {builder.neighborhood}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 stats-divider" />

          {/* Bio */}
          {builder.bio && (
            <p
              className="text-sm italic leading-relaxed mb-4 t-serif-body"
            >
              &ldquo;{builder.bio}&rdquo;
            </p>
          )}

          {/* Project block */}
          {(builder.projectName || allLinks.length > 0) && (
            <div className="mb-4">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-1 t-sans-gray"
              >
                Building
              </p>
              {builder.projectName && (
                <p
                  className="text-sm font-bold mb-1 t-sans-navy"
                >
                  {builder.projectName}
                </p>
              )}
              {allLinks.map((link, i) => (
                <ExternalLink
                  key={i}
                  href={link}
                  className="block text-xs font-bold uppercase tracking-widest hover:underline truncate mb-0.5 t-sans-blue"
                >
                  ↗ {(() => { try { return new URL(link).hostname.replace(/^www\./, ""); } catch { return link; } })()}
                </ExternalLink>
              ))}
            </div>
          )}

          {/* Talk about */}
          {builder.talkAbout && (
            <div className="mb-4">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-1 t-sans-gray"
              >
                Talk to me about
              </p>
              <p
                className="text-[13px] italic leading-relaxed t-serif-body"
              >
                {builder.talkAbout}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="mb-4 stats-divider" />

          {/* Spots section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[11px] font-bold uppercase tracking-widest t-sans-gray"
              >
                Spots in the guide
              </p>
              {/* Show "See all" when we've hit the fetch limit — there may be more */}
              {builderSpots.length >= 5 && (
                <button
                  onClick={() => {
                    onViewBuilderSpots?.(builder.fid, builder.username);
                    handleClose();
                  }}
                  className="text-xs font-bold uppercase tracking-widest hover:underline focus:outline-none t-sans-blue btn-link-base"
                >
                  See all →
                </button>
              )}
            </div>

            {spotsLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse skeleton-h-80" />
                ))}
              </div>
            ) : builderSpots.length === 0 ? (
              <p
                className="text-xs italic t-serif-gray"
              >
                No spots yet. They&apos;re busy building.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {builderSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onClick={(s) => {
                      handleClose();
                      onSpotClick?.(s);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <ExternalLink
              href={`https://farcaster.xyz/${builder.username}`}
              className="flex-1 py-3 rounded-sm text-xs font-bold uppercase tracking-widest text-center transition-colors duration-150 hover:opacity-90 t-sans-white bg-boston-blue min-h-11 flex items-center justify-center no-underline"
            >
              View on Farcaster
            </ExternalLink>
            <button
              onClick={async () => {
                await share({
                  text: `🏗 Check out @${builder.username} in the /boston builder directory`,
                  path: `/?builderId=${builder.fid}`,
                  channelKey: "boston",
                });
              }}
              className="px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none t-sans-white bg-navy min-h-11 border-none cursor-pointer"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
