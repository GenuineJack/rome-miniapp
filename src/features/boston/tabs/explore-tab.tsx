"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Spot, CategoryFilter, NEIGHBORHOODS } from "@/features/boston/types";
import { SpotCard } from "@/features/boston/components/spot-card";
import { CategoryFilterBar } from "@/features/boston/components/category-filter";
import { MapView } from "@/features/boston/components/map-view";
import { getTimeContext, TIME_CONTEXT_CATEGORY_WEIGHT } from "@/features/boston/utils/time-context";

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
    const catOk = activeCategory === "All" || activeCategory === "Tourist Picks" ? (activeCategory === "All" || s.touristPick) : s.category === activeCategory;
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

  // Soft time-of-day category weighting — nudges relevant categories to the top
  const timeCtx = getTimeContext();
  const weightedCategories = TIME_CONTEXT_CATEGORY_WEIGHT[timeCtx];
  const sortedFiltered = weightedCategories.length > 0
    ? [...filtered].sort((a, b) => {
        const aIdx = weightedCategories.indexOf(a.category);
        const bIdx = weightedCategories.indexOf(b.category);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      })
    : filtered;

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
        className={mapCollapsed ? "map-container-collapsed" : "map-container"}
      >
        <MapView spots={sortedFiltered} onSpotClick={onSelectSpot} />
      </div>

      {/* Show map bar when collapsed */}
      {mapCollapsed && (
        <button
          onClick={() => setMapCollapsed(false)}
          className="w-full flex items-center justify-center py-1.5 shrink-0 bg-navy t-sans-white btn-show-map"
        >
          ▲ Show Map
        </button>
      )}

      {/* Neighborhood filter banner */}
      {activeNeighborhood && (
        <div
          className="flex items-center justify-between px-4 py-2 bg-boston-blue"
        >
          <span
            className="text-xs font-bold uppercase tracking-widest text-white t-sans"
          >
            {activeNeighborhood.name}
          </span>
          <button
            onClick={onClearNeighborhoodFilter}
            className="text-white text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 focus:outline-none t-sans"
          >
            × Clear
          </button>
        </div>
      )}

      {/* Submitter filter banner */}
      {submitterFilter && (
        <div
          className="flex items-center justify-between px-4 py-2 bg-boston-blue"
        >
          <span
            className="text-xs font-bold uppercase tracking-widest text-white t-sans"
          >
            Spots by @{submitterFilter.username}
          </span>
          <button
            onClick={onClearSubmitterFilter}
            className="text-white text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 focus:outline-none t-sans"
          >
            × Clear
          </button>
        </div>
      )}

      {/* Tourist Picks / Visitor mode banner */}
      {activeCategory === "Tourist Picks" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1871bd]">
          <span className="text-sm">✈️</span>
          <span className="text-xs font-bold uppercase tracking-widest text-white t-sans">
            Visitor Mode — Local-approved picks for out-of-towners
          </span>
        </div>
      )}

      {/* Category filter */}
      <div className="py-2 bg-boston-gray-50 border-b border-boston-gray-100">
        <CategoryFilterBar active={activeCategory} onChange={onCategoryChange} />
      </div>

      {/* Search bar */}
      <div className="px-4 pt-2 pb-1.5 bg-boston-gray-50">
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-boston-gray-400"
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search spots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full focus:outline-none t-sans-navy bg-white border border-boston-gray-100 explore-search-input ${searchQuery ? "pr-8" : "pr-3"}`}
            aria-label="Search spots"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-none text-boston-gray-400 btn-clear-search"
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
              <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse h-24" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2 t-sans-navy"
            >
              Couldn&apos;t load spots.
            </p>
            <p
              className="text-sm italic t-serif-gray"
            >
              Check your connection and try refreshing.
            </p>
          </div>
        ) : sortedFiltered.length === 0 ? (
          <div className="p-8 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2 t-sans-navy"
            >
              {searchQuery.trim() ? "No results." : "Nothing here yet."}
            </p>
            <p
              className="text-sm italic t-serif-gray"
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
            {sortedFiltered.map((spot) => (
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
