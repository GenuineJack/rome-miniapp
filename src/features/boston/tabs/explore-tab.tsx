"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Spot, CategoryFilter, NEIGHBORHOODS } from "@/features/boston/types";
import { SpotCard } from "@/features/boston/components/spot-card";
import { CategoryFilterBar } from "@/features/boston/components/category-filter";
import { MapView } from "@/features/boston/components/map-view";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type ExploreTabProps = {
  spots: Spot[];
  loading: boolean;
  error?: boolean;
  activeCategory: CategoryFilter;
  onCategoryChange: (cat: CategoryFilter) => void;
  neighborhoodFilter: string | null;
  onClearNeighborhoodFilter: () => void;
  submitterFilter?: { fid: number; username: string } | null;
  onClearSubmitterFilter?: () => void;
  onSelectSpot: (spot: Spot) => void;
  onSpotDetailBuilderClick?: (fid: number) => void;
};

export function ExploreTab({
  spots,
  loading,
  error,
  activeCategory,
  onCategoryChange,
  neighborhoodFilter,
  onClearNeighborhoodFilter,
  submitterFilter,
  onClearSubmitterFilter,
  onSelectSpot,
}: ExploreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const spotListRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = spotListRef.current;
    if (!el) return;
    if (el.scrollTop > 80 && !mapCollapsed) setMapCollapsed(true);
    if (el.scrollTop < 20 && mapCollapsed) setMapCollapsed(false);
  }, [mapCollapsed]);

  useEffect(() => {
    const el = spotListRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Derive filtered list from props + search query
  const filtered = spots.filter((s) => {
    const catOk = activeCategory === "All" || s.category === activeCategory;
    const nbrOk = !neighborhoodFilter || (() => {
      const neighborhood = NEIGHBORHOODS.find((n) => n.id === neighborhoodFilter);
      return neighborhood ? s.neighborhood === neighborhood.name : true;
    })();
    const submitterOk = !submitterFilter || s.submittedByFid === submitterFilter.fid;
    const searchOk = !searchQuery.trim() || (() => {
      const q = searchQuery.trim().toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.category ? s.category.toLowerCase().includes(q) : false)
      );
    })();
    return catOk && nbrOk && submitterOk && searchOk;
  });

  function isNew(spot: Spot) {
    return Date.now() - new Date(spot.createdAt).getTime() < ONE_WEEK_MS;
  }

  const activeNeighborhood = neighborhoodFilter
    ? NEIGHBORHOODS.find((n) => n.id === neighborhoodFilter)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Map — collapsible */}
      <div
        style={{
          height: mapCollapsed ? "0px" : "clamp(180px, 30vh, 240px)",
          overflow: "hidden",
          transition: "height 0.3s ease",
        }}
      >
        <MapView spots={filtered} onSpotClick={onSelectSpot} />
      </div>

      {/* Show map bar when collapsed */}
      {mapCollapsed && (
        <button
          onClick={() => setMapCollapsed(false)}
          className="w-full flex items-center justify-center py-1.5 shrink-0"
          style={{
            background: "#091f2f",
            fontFamily: "var(--font-sans)",
            fontSize: "9px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          ▲ Show Map
        </button>
      )}

      {/* Neighborhood filter banner */}
      {activeNeighborhood && (
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: "#1871bd" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {activeNeighborhood.name}
          </span>
          <button
            onClick={onClearNeighborhoodFilter}
            className="text-white text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 focus:outline-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            × Clear
          </button>
        </div>
      )}

      {/* Submitter filter banner */}
      {submitterFilter && (
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: "#1871bd" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Spots by @{submitterFilter.username}
          </span>
          <button
            onClick={onClearSubmitterFilter}
            className="text-white text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 focus:outline-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            × Clear
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="py-2" style={{ background: "#f3f3f3", borderBottom: "1px solid #e0e0e0" }}>
        <CategoryFilterBar active={activeCategory} onChange={onCategoryChange} />
      </div>

      {/* Search bar */}
      <div className="px-4 pt-2 pb-1.5" style={{ background: "#f3f3f3" }}>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: "#828282" }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search spots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              color: "#091f2f",
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "3px",
              height: "36px",
              paddingLeft: "36px",
              paddingRight: searchQuery ? "32px" : "12px",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-none"
              style={{
                color: "#828282",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                fontSize: "13px",
                lineHeight: 1,
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Spot list */}
      <div ref={spotListRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse" style={{ height: "96px" }} />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
            >
              Couldn&apos;t load spots.
            </p>
            <p
              className="text-sm italic"
              style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
            >
              Check your connection and try refreshing.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
            >
              {searchQuery.trim() ? "No results." : "Nothing here yet."}
            </p>
            <p
              className="text-sm italic"
              style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
            >
              {searchQuery.trim()
                ? `No spots matching "${searchQuery.trim()}". Try a different search.`
                : submitterFilter
                ? `@${submitterFilter.username} hasn't added any spots in this category yet.`
                : activeNeighborhood
                ? `Be the first to add a spot in ${activeNeighborhood.name}.`
                : "Be the first to add a spot in this category."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {filtered.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onClick={onSelectSpot}
                isNew={isNew(spot)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
