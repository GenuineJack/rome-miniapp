"use client";

import { useState, useEffect, useCallback } from "react";
import { Builder } from "@/features/boston/types";
import { getBuildersWithSpotCounts, isBuilderInDirectory, getBuilderByFid } from "@/db/actions/boston-actions";
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
  const [userBuilder, setUserBuilder] = useState<Builder | null>(null);

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
        if (inDir) {
          getBuilderByFid(userFid).then((b) => setUserBuilder(b));
        }
      });
    }
  }, [userFid, directoryCheckDone]);

  // Filter builders
  const filtered = allBuilders.filter((b) => {
    const catOk = activeCategory === "All" || b.category === activeCategory || b.categories?.includes(activeCategory);
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

  const showEditBanner =
    userFid !== undefined &&
    user !== null &&
    directoryCheckDone &&
    userIsInDirectory &&
    !showJoinOverlay;

  function handleJoinSuccess() {
    setUserIsInDirectory(true);
    setDirectoryCheckDone(false); // re-fetch builder record
    loadBuilders();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0 flex items-end justify-between bg-navy-bar"
      >
        <div>
          <h2
            className="text-lg font-black uppercase tracking-tight t-sans-white"
            style={{ letterSpacing: "0.05em" }}
          >
            Builders
          </h2>
          <p
            className="text-xs italic mt-0.5 t-serif"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            The people making things in Boston
          </p>
        </div>
        {!loading && allBuilders.length > 0 && (
          <span
            className="text-[9px] font-bold uppercase tracking-widest shrink-0 mb-0.5 t-sans"
            style={{ color: "rgba(255,255,255,0.5)" }}
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
            className="flex items-center justify-between gap-3 px-4 py-3 bg-navy"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="min-w-0">
              <p
                className="text-sm italic leading-none t-serif text-white"
              >
                You build in Boston?
              </p>
              <p
                className="text-xs italic mt-1 leading-tight t-serif"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Claim your spot in the directory.
              </p>
            </div>
            <button
              onClick={() => setShowJoinOverlay(true)}
              className="shrink-0 transition-colors duration-150 focus:outline-none t-sans"
              style={{
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

        {/* Edit profile banner */}
        {showEditBanner && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-2 bg-boston-gray-50 border-b border-boston-gray-100"
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest t-sans-gray"
            >
              Your profile
            </p>
            <button
              onClick={() => setShowJoinOverlay(true)}
              className="text-[10px] font-bold uppercase tracking-widest focus:outline-none t-sans-blue"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Edit →
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
              className="text-sm font-bold uppercase tracking-widest mb-4 t-sans-navy"
            >
              Directory launching soon
            </p>
            <p
              className="text-sm italic leading-relaxed mb-6 t-serif-body"
              style={{ lineHeight: "1.7", maxWidth: "280px" }}
            >
              If you&apos;re building something in Boston, you belong here. The /boston builder
              directory is for anyone making things in the city — code, community, content,
              companies. No gatekeeping.
            </p>
            {userFid !== undefined && !userIsInDirectory && (
              <button
                onClick={() => setShowJoinOverlay(true)}
                className="px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90 focus:outline-none t-sans-white bg-boston-blue"
                style={{
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
                  className="text-xs font-bold uppercase tracking-widest t-sans-navy"
                >
                  No builders matching that filter yet.
                </p>
                <p
                  className="text-xs italic mt-1 t-serif-gray"
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
                className="text-xs italic text-center px-4 py-4 t-serif-gray"
                style={{ lineHeight: "1.6" }}
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
        <div className="absolute inset-0 flex flex-col bg-boston-gray-50 z-50">
          {/* Overlay header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0 bg-navy-bar"
          >
            <button
              onClick={() => setShowJoinOverlay(false)}
              className="t-sans-white"
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ← Back
            </button>
            <span
              className="t-sans"
              style={{
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
              existingBuilder={userIsInDirectory ? userBuilder : null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
