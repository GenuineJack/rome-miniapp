"use client";

import { useState, useEffect, useCallback } from "react";
import { Builder } from "@/features/boston/types";
import { getBuildersWithSpotCounts, isBuilderInDirectory } from "@/db/actions/boston-actions";
import { BuilderCard } from "@/features/boston/components/builder-card";
import { FeaturedBuilderCard } from "@/features/boston/components/featured-builder-card";
import { BuilderFilterBar } from "@/features/boston/components/builder-filter-bar";
import { BuilderDetailSheet } from "@/features/boston/components/builder-detail-sheet";
import { BuilderJoinForm } from "@/features/boston/components/builder-join-form";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";

type BuildersTabProps = {
  onViewBuilderSpots?: (fid: number, username: string) => void;
  onSpotClick?: (spot: import("@/features/boston/types").Spot) => void;
  pendingBuilderView?: Builder | null;
  onPendingBuilderViewConsumed?: () => void;
};

export function BuildersTab({ onViewBuilderSpots, onSpotClick, pendingBuilderView, onPendingBuilderViewConsumed }: BuildersTabProps) {
  const { data: user } = useFarcasterUser();
  const userFid = user?.fid;

  const [allBuilders, setAllBuilders] = useState<(Builder & { spotCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeNeighborhood, setActiveNeighborhood] = useState("All");
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [showJoinOverlay, setShowJoinOverlay] = useState(false);
  const [userIsInDirectory, setUserIsInDirectory] = useState(false);
  const [directoryCheckDone, setDirectoryCheckDone] = useState(false);

  const loadBuilders = useCallback(async () => {
    setLoading(true);
    const data = await getBuildersWithSpotCounts();
    setAllBuilders(data as (Builder & { spotCount: number })[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBuilders();
  }, [loadBuilders]);

  // Consume pending builder view (triggered from spot-detail → builder navigation)
  useEffect(() => {
    if (pendingBuilderView) {
      setSelectedBuilder(pendingBuilderView);
      onPendingBuilderViewConsumed?.();
    }
  }, [pendingBuilderView, onPendingBuilderViewConsumed]);

  useEffect(() => {
    if (userFid !== undefined && !directoryCheckDone) {
      isBuilderInDirectory(userFid).then((inDir) => {
        setUserIsInDirectory(inDir);
        setDirectoryCheckDone(true);
      });
    }
  }, [userFid, directoryCheckDone]);

  // Filter builders
  const filtered = allBuilders.filter((b) => {
    const catOk = activeCategory === "All" || b.category === activeCategory;
    const nbrOk = activeNeighborhood === "All" || b.neighborhood === activeNeighborhood;
    return catOk && nbrOk;
  });

  const featured = filtered.find((b) => b.featured) ?? allBuilders.find((b) => b.featured) ?? null;
  const rest = filtered.filter((b) => !b.featured);

  const showJoinBanner =
    userFid !== undefined &&
    user !== null &&
    directoryCheckDone &&
    !userIsInDirectory &&
    !showJoinOverlay;

  function handleJoinSuccess() {
    setUserIsInDirectory(true);
    loadBuilders();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0 flex items-end justify-between"
        style={{ background: "#091f2f", borderBottom: "3px solid #1871bd" }}
      >
        <div>
          <h2
            className="text-lg font-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-sans)", color: "#fff", letterSpacing: "0.05em" }}
          >
            Builders
          </h2>
          <p
            className="text-xs italic mt-0.5"
            style={{ fontFamily: "var(--font-serif)", color: "rgba(255,255,255,0.6)" }}
          >
            The people making things in Boston
          </p>
        </div>
        {!loading && allBuilders.length > 0 && (
          <span
            className="text-[9px] font-bold uppercase tracking-widest shrink-0 mb-0.5"
            style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.5)" }}
          >
            {allBuilders.length} builder{allBuilders.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <BuilderFilterBar
        activeCategory={activeCategory}
        activeNeighborhood={activeNeighborhood}
        onCategoryChange={setActiveCategory}
        onNeighborhoodChange={setActiveNeighborhood}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Join banner — sticky at top of scroll content */}
        {showJoinBanner && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3"
            style={{ background: "#091f2f", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="min-w-0">
              <p
                className="text-sm italic leading-none"
                style={{ fontFamily: "var(--font-serif)", color: "#fff" }}
              >
                You build in Boston?
              </p>
              <p
                className="text-xs italic mt-1 leading-tight"
                style={{ fontFamily: "var(--font-serif)", color: "rgba(255,255,255,0.7)" }}
              >
                Claim your spot in the directory.
              </p>
            </div>
            <button
              onClick={() => setShowJoinOverlay(true)}
              className="shrink-0 transition-colors duration-150 focus:outline-none"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "9px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#1871bd",
                background: "transparent",
                border: "1px solid #1871bd",
                borderRadius: "2px",
                padding: "4px 12px",
                height: "28px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1871bd"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1871bd"; }}
            >
              Join →
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="rounded-sm bg-[#091f2f] animate-pulse opacity-30" style={{ height: "140px" }} />
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse" style={{ height: "130px" }} />
            ))}
          </div>
        ) : allBuilders.length === 0 ? (
          // Zero builders state
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
            >
              Directory launching soon
            </p>
            <p
              className="text-sm italic leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-serif)", color: "#58585b", lineHeight: "1.7", maxWidth: "280px" }}
            >
              If you&apos;re building something in Boston, you belong here. The /boston builder
              directory is for anyone making things in the city — code, community, content,
              companies. No gatekeeping.
            </p>
            {userFid !== undefined && !userIsInDirectory && (
              <button
                onClick={() => setShowJoinOverlay(true)}
                className="px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90 focus:outline-none"
                style={{
                  fontFamily: "var(--font-sans)",
                  background: "#1871bd",
                  color: "#fff",
                  border: "none",
                  minHeight: "44px",
                  cursor: "pointer",
                }}
              >
                Join First →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {/* Featured builder — always shown if exists, regardless of active filters */}
            {featured && (
              <FeaturedBuilderCard
                builder={featured}
                onClick={setSelectedBuilder}
                onSpotFilterClick={onViewBuilderSpots}
              />
            )}

            {/* Regular builder cards — or empty-filter message */}
            {filtered.length === 0 && (activeCategory !== "All" || activeNeighborhood !== "All") ? (
              <div className="py-8 text-center px-4">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
                >
                  No builders matching that filter yet.
                </p>
                <p
                  className="text-xs italic mt-1"
                  style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
                >
                  They&apos;re out there building — check back.
                </p>
              </div>
            ) : (
              rest.map((b) => (
                <BuilderCard
                  key={b.id}
                  builder={b}
                  onClick={setSelectedBuilder}
                  onSpotFilterClick={onViewBuilderSpots}
                />
              ))
            )}

            {/* Few builders growth nudge (1–5 builders total) */}
            {allBuilders.length > 0 && allBuilders.length <= 5 && (
              <p
                className="text-xs italic text-center px-4 py-4"
                style={{ fontFamily: "var(--font-serif)", color: "#828282", lineHeight: "1.6" }}
              >
                The directory grows with the community. Know a Boston builder? Send them here.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Builder detail sheet */}
      <BuilderDetailSheet
        builder={selectedBuilder}
        onClose={() => setSelectedBuilder(null)}
        onSpotClick={onSpotClick}
        onViewBuilderSpots={onViewBuilderSpots}
      />

      {/* Join overlay */}
      {showJoinOverlay && (
        <div className="absolute inset-0 flex flex-col" style={{ background: "#f3f3f3", zIndex: 50 }}>
          {/* Overlay header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "#091f2f", borderBottom: "3px solid #1871bd" }}
          >
            <button
              onClick={() => setShowJoinOverlay(false)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ← Back
            </button>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Join the Directory
            </span>
            <div style={{ width: "40px" }} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <BuilderJoinForm
              onSuccess={handleJoinSuccess}
              onClose={() => setShowJoinOverlay(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
