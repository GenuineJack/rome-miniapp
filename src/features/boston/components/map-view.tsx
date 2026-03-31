"use client";

import dynamic from "next/dynamic";
import { Spot } from "@/features/boston/types";

// Leaflet must be dynamically imported with SSR disabled (accesses `window`)
const LeafletMapInner = dynamic(
  () => import("@/features/boston/components/leaflet-map").then((m) => ({ default: m.LeafletMapInner })),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

// SVG fallback shown during Leaflet hydration — prevents layout shift
function MapSkeleton() {
  return (
    <div
      className="w-full animate-pulse"
      style={{ height: MAP_HEIGHT, background: "#0d1b2a", position: "relative" }}
    >
      {/* Decorative street lines */}
      <svg width="100%" height="100%" viewBox="0 0 380 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
        {[
          "M 15,35 Q 25,30 35,28 Q 50,26 65,27 Q 80,28 90,32",
          "M 20,38 L 85,42",
          "M 25,45 L 80,47",
          "M 45,25 L 47,70",
          "M 55,20 L 57,72",
          "M 65,22 L 67,68",
        ].map((d, i) => (
          <path key={i} d={d} stroke="#1871bd" strokeWidth={0.8} strokeOpacity="0.2" fill="none" />
        ))}
        <text x="20" y="24" fill="white" fontSize="11" fontFamily="Arial, sans-serif"
          fontWeight="700" letterSpacing="3" opacity="0.3" textAnchor="start">
          BOSTON
        </text>
      </svg>
    </div>
  );
}

type MapViewProps = {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
};

// Reduced height: was clamp(240px, 45vh, 320px) — now clamp(180px, 30vh, 240px)
const MAP_HEIGHT = "clamp(180px, 30vh, 240px)";

export function MapView({ spots, onSpotClick }: MapViewProps) {
  const spotsWithCoords = spots.filter((s) => s.latitude !== null && s.longitude !== null);

  return (
    <div className="relative w-full shrink-0 overflow-hidden" style={{ height: MAP_HEIGHT }}>
      <LeafletMapInner spots={spots} onSpotClick={onSpotClick} height="100%" />

      {/* Spot count badge */}
      <div
        className="absolute top-3 right-3 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest z-[1000] pointer-events-none t-sans-white bg-navy"
        style={{
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {spots.length} {spots.length === 1 ? "spot" : "spots"}
        {spotsWithCoords.length < spots.length && (
          <span style={{ opacity: 0.55, marginLeft: "4px" }}>
            ({spotsWithCoords.length} mapped)
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 z-[1000] pointer-events-none">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-boston-red" />
          <span className="text-[9px] font-bold uppercase tracking-wide text-white opacity-60 t-sans">
            Spot
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#fcb61a" }} />
          <span className="text-[9px] font-bold uppercase tracking-wide text-white opacity-60 t-sans">
            Featured
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-boston-blue" />
          <span className="text-[9px] font-bold uppercase tracking-wide text-white opacity-60 t-sans">
            New
          </span>
        </div>
      </div>
    </div>
  );
}
