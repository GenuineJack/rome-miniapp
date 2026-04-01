"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NEIGHBORHOODS, REGION_IDS, NeighborhoodInfo, Spot } from "@/features/boston/types";
import { getSpotCountByNeighborhood, getSpotsByNeighborhood } from "@/db/actions/boston-actions";

const LeafletMapInner = dynamic(
  () => import("@/features/boston/components/leaflet-map").then((m) => ({ default: m.LeafletMapInner })),
  { ssr: false, loading: () => <div className="w-full h-[200px] bg-navy animate-pulse rounded-sm" /> }
);

const CITY_NEIGHBORHOODS = NEIGHBORHOODS.filter((n) => !REGION_IDS.has(n.id));
const REGIONS = NEIGHBORHOODS.filter((n) => REGION_IDS.has(n.id));

type NeighborhoodDetailProps = {
  neighborhood: NeighborhoodInfo;
  spotCount: number;
  onBack: () => void;
  onViewSpots: (neighborhoodId: string) => void;
  onSelectSpot: (spot: Spot) => void;
};

function NeighborhoodDetail({ neighborhood, spotCount, onBack, onViewSpots, onSelectSpot }: NeighborhoodDetailProps) {
  const [inlineSpots, setInlineSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);

  useEffect(() => {
    setSpotsLoading(true);
    getSpotsByNeighborhood(neighborhood.name, 5).then((data) => {
      setInlineSpots(data);
      setSpotsLoading(false);
    });
  }, [neighborhood.name]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-5 bg-navy">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 text-[10px] font-bold uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-opacity t-sans"
        >
          ← Back
        </button>
        <h2
          className="text-2xl font-black uppercase tracking-tight leading-none mb-2 t-sans-white"
        >
          {neighborhood.name}
        </h2>
        <p
          className="text-sm italic opacity-80 t-serif-white"
        >
          {neighborhood.tagline}
        </p>
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-3">
          <span
            className="text-xs font-bold uppercase tracking-widest t-sans-blue"
          >
            {spotCount} {spotCount === 1 ? "spot" : "spots"} in the guide
          </span>
          {spotCount > 0 && (
            <button
              onClick={() => onViewSpots(neighborhood.id)}
              className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest shrink-0 focus:outline-none t-sans-white bg-boston-blue min-h-9"
            >
              View Spots
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-b border-[#e0e0e0]">
        <p
          className="text-sm leading-relaxed t-serif-body"
        >
          {neighborhood.description}
        </p>
      </div>

      {/* Neighborhood-scoped map */}
      <div className="border-b border-[#e0e0e0]">
        <LeafletMapInner
          spots={inlineSpots}
          onSpotClick={onSelectSpot}
          height="200px"
          center={neighborhood.center}
          zoom={14}
        />
        {!spotsLoading && inlineSpots.length === 0 && (
          <div className="relative flex items-center justify-center pointer-events-none -mt-[100px] h-0">
            <span className="bg-navy/80 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm t-sans">
              No spots here yet
            </span>
          </div>
        )}
      </div>

      {/* Inline spots */}
      <div className="p-4">
        <p
          className="text-[9px] font-bold uppercase tracking-widest mb-3 t-sans-gray"
        >
          Spots in {neighborhood.name}
        </p>
        {spotsLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse h-12" />
            ))}
          </div>
        ) : inlineSpots.length === 0 ? (
          <div className="py-6 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2 t-sans-navy"
            >
              Nobody&apos;s repped {neighborhood.name} yet.
            </p>
            <p
              className="text-sm italic t-serif-gray"
            >
              Be the first.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {inlineSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => onSelectSpot(spot)}
                  className="w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm transition-colors duration-150 hover:bg-[#e0e0e0] bg-white spot-list-btn"
                >
                  <span
                    className="text-xs font-bold truncate t-sans-navy"
                  >
                    {spot.name}
                  </span>
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest shrink-0 t-sans-white bg-navy"
                  >
                    {spot.category}
                  </span>
                </button>
              ))}
            </div>
            {spotCount > 5 && (
              <button
                onClick={() => onViewSpots(neighborhood.id)}
                className="mt-3 text-[10px] font-bold uppercase tracking-widest t-sans-blue btn-unstyled"
              >
                View all in Explore →
              </button>
            )}
          </>
        )}
      </div>
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
      className="w-full text-left p-4 rounded-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1871bd] group hover:bg-[#091f2f] bg-boston-gray-50 min-h-[110px]"
    >
      <h3
        className="text-sm font-black uppercase tracking-tight leading-none mb-1.5 text-[#091f2f] group-hover:text-white transition-colors duration-200 t-sans"
      >
        {neighborhood.name}
      </h3>
      <p
        className="text-xs italic leading-snug mb-2 line-clamp-3 text-[#58585b] group-hover:text-white/80 transition-colors duration-200 t-serif"
      >
        {neighborhood.tagline}
      </p>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-widest text-[#1871bd] group-hover:text-white/70 transition-colors duration-200 t-sans"
        >
          📍 {spotCount} {spotCount === 1 ? "spot" : "spots"}
        </span>
        <span className="text-xs text-[#828282] group-hover:text-white/50 transition-colors duration-200">→</span>
      </div>
    </button>
  );
}

type RegionCardProps = {
  neighborhood: NeighborhoodInfo;
  spotCount: number;
  onClick: () => void;
};

function RegionCard({ neighborhood, spotCount, onClick }: RegionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1871bd] hover:bg-[#f8f8f8] bg-white region-card"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm t-sans-blue region-badge"
        >
          Region
        </span>
      </div>
      <h3
        className="text-sm font-black uppercase tracking-tight leading-none mb-1.5 t-sans-navy"
      >
        {neighborhood.name}
      </h3>
      <p
        className="text-xs italic leading-relaxed mb-2 text-[#58585b] t-serif"
      >
        {neighborhood.description}
      </p>
      <span
        className="text-[10px] font-bold uppercase tracking-widest t-sans-blue"
      >
        {spotCount > 0 ? `📍 ${spotCount} ${spotCount === 1 ? "spot" : "spots"}` : "Be the first to add a spot in this region"}
      </span>
    </button>
  );
}

type NeighborhoodsTabProps = {
  onNavigateToExplore: (neighborhoodId: string) => void;
  onSelectSpot?: (spot: Spot) => void;
};

export function NeighborhoodsTab({ onNavigateToExplore, onSelectSpot }: NeighborhoodsTabProps) {
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
        onSelectSpot={(spot) => onSelectSpot?.(spot)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#e0e0e0] bg-navy">
        <h2
          className="text-lg font-black uppercase tracking-tight text-white t-sans"
        >
          Areas
        </h2>
        <p
          className="text-xs italic text-white opacity-60 mt-0.5 t-serif"
        >
          Every part of the city, in the city&apos;s words
        </p>
      </div>

      {/* City Neighborhoods — 2-column grid */}
      <div className="p-4">
        <p
          className="text-[9px] font-bold uppercase tracking-widest mb-3 t-sans-navy"
        >
          Boston Neighborhoods
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CITY_NEIGHBORHOODS.map((n) => (
            <NeighborhoodCard
              key={n.id}
              neighborhood={n}
              spotCount={getCount(n)}
              onClick={() => setSelected(n)}
            />
          ))}
        </div>
      </div>

      {/* Region divider */}
      <div className="flex items-center justify-center py-4 px-4">
        <div className="flex-1 border-t border-[#e0e0e0]" />
        <span
          className="px-3 t-sans-gray region-divider-label"
        >
          — Greater Boston Region —
        </span>
        <div className="flex-1 border-t border-[#e0e0e0]" />
      </div>

      {/* Regions — single column */}
      <div className="flex flex-col gap-3 px-4 pb-6">
        {REGIONS.map((n) => (
          <RegionCard
            key={n.id}
            neighborhood={n}
            spotCount={getCount(n)}
            onClick={() => onNavigateToExplore(n.id)}
          />
        ))}
      </div>
    </div>
  );
}
