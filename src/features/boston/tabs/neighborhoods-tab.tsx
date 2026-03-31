"use client";

import { useState, useEffect } from "react";
import { NEIGHBORHOODS, NeighborhoodInfo } from "@/features/boston/types";
import { getSpotCountByNeighborhood } from "@/db/actions/boston-actions";

type NeighborhoodDetailProps = {
  neighborhood: NeighborhoodInfo;
  spotCount: number;
  onBack: () => void;
  onViewSpots: (neighborhoodId: string) => void;
};

function NeighborhoodDetail({ neighborhood, spotCount, onBack, onViewSpots }: NeighborhoodDetailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-5" style={{ background: "#091f2f" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 text-[10px] font-bold uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ← Back
        </button>
        <h2
          className="text-2xl font-black uppercase tracking-tight leading-none mb-2"
          style={{ fontFamily: "var(--font-sans)", color: "#fff" }}
        >
          {neighborhood.name}
        </h2>
        <p
          className="text-sm italic opacity-80"
          style={{ fontFamily: "var(--font-serif)", color: "#fff" }}
        >
          {neighborhood.tagline}
        </p>
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-3">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: "var(--font-sans)", color: "#1871bd" }}
          >
            {spotCount} {spotCount === 1 ? "spot" : "spots"} in the guide
          </span>
          {spotCount > 0 && (
            <button
              onClick={() => onViewSpots(neighborhood.id)}
              className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest shrink-0 focus:outline-none"
              style={{
                fontFamily: "var(--font-sans)",
                background: "#1871bd",
                color: "#fff",
                minHeight: "36px",
              }}
            >
              View Spots
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-b border-[#e0e0e0]">
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-serif)", color: "#58585b" }}
        >
          {neighborhood.description}
        </p>
      </div>

      {/* Empty state if no spots */}
      {spotCount === 0 && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
            >
              Nobody's repped {neighborhood.name} yet.
            </p>
            <p
              className="text-sm italic"
              style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
            >
              Be the first.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type NeighborhoodCardProps = {
  neighborhood: NeighborhoodInfo;
  spotCount: number;
  onClick: () => void;
};

function NeighborhoodCard({ neighborhood, spotCount, onClick }: NeighborhoodCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1871bd] group hover:bg-[#091f2f]"
      style={{
        background: "#f3f3f3",
        minHeight: "100px",
      }}
    >
      <h3
        className="text-sm font-black uppercase tracking-tight leading-none mb-1.5 text-[#091f2f] group-hover:text-white transition-colors duration-200"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {neighborhood.name}
      </h3>
      <p
        className="text-xs italic leading-snug mb-3 line-clamp-2 text-[#58585b] group-hover:text-white/80 transition-colors duration-200"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {neighborhood.tagline}
      </p>
      <span
        className="text-[10px] font-bold uppercase tracking-widest text-[#1871bd] group-hover:text-white/70 transition-colors duration-200"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {spotCount} {spotCount === 1 ? "spot" : "spots"}
      </span>
    </button>
  );
}

type NeighborhoodsTabProps = {
  onNavigateToExplore: (neighborhoodId: string) => void;
};

export function NeighborhoodsTab({ onNavigateToExplore }: NeighborhoodsTabProps) {
  const [selected, setSelected] = useState<NeighborhoodInfo | null>(null);
  const [spotCounts, setSpotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getSpotCountByNeighborhood().then(setSpotCounts);
  }, []);

  function getCount(neighborhood: NeighborhoodInfo) {
    return spotCounts[neighborhood.id] ?? 0;
  }

  if (selected) {
    return (
      <NeighborhoodDetail
        neighborhood={selected}
        spotCount={getCount(selected)}
        onBack={() => setSelected(null)}
        onViewSpots={(id) => {
          setSelected(null);
          onNavigateToExplore(id);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#e0e0e0]" style={{ background: "#091f2f" }}>
        <h2
          className="text-lg font-black uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Neighborhoods
        </h2>
        <p
          className="text-xs italic text-white opacity-60 mt-0.5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Every part of the city, in the city's words
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {NEIGHBORHOODS.map((n) => (
          <NeighborhoodCard
            key={n.id}
            neighborhood={n}
            spotCount={getCount(n)}
            onClick={() => setSelected(n)}
          />
        ))}
      </div>
    </div>
  );
}
