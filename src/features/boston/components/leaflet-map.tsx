"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/features/boston/types";

type LeafletMapProps = {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  height: string;
  center?: [number, number];
  zoom?: number;
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getPinColor(spot: Spot): string {
  if (Date.now() - new Date(spot.createdAt).getTime() < ONE_WEEK_MS) return "#1871bd"; // new
  if (spot.featured) return "#fcb61a"; // featured
  return "#d22d23"; // regular
}

// Build a circle SVG marker icon
function _buildIcon(L: typeof import("leaflet"), color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="9" fill="${color}" opacity="0.9" stroke="white" stroke-width="2"/>
    <circle cx="11" cy="11" r="4" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function LeafletMapInner({ spots, onSpotClick, height, center, zoom }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<import("leaflet").CircleMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Initialise map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import inside the effect — guarantees window is available
    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon URLs broken by webpack
      // @ts-expect-error _getIconUrl is not typed
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl: undefined, shadowUrl: undefined });

      const map = L.map(containerRef.current, {
        center: center ?? [42.3601, -71.0589],
        zoom: zoom ?? 13,
        minZoom: 11,
        maxZoom: 17,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;
      setMapReady(true);

      // CARTO Dark Matter — free, no API key, dark theme
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Tiny attribution tucked bottom-right
      L.control.attribution({ prefix: false, position: "bottomright" })
        .addAttribution('<a href="https://carto.com/">© CARTO</a>')
        .addTo(map);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers whenever spots list changes
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const spotsWithCoords = spots.filter(
        (s) => s.latitude !== null && s.longitude !== null
      );

      for (const spot of spotsWithCoords) {
        const color = getPinColor(spot);
        const marker = L.circleMarker(
          [spot.latitude!, spot.longitude!],
          {
            radius: 7,
            fillColor: color,
            fillOpacity: 0.9,
            color: "#ffffff",
            weight: 2,
          }
        );

        marker.on("click", () => onSpotClick(spot));
        marker.bindTooltip(spot.name, {
          permanent: false,
          direction: "top",
          offset: [0, -8],
          className: "boston-map-tooltip",
        });

        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [spots, onSpotClick, mapReady]);

  return (
    <>
      <style>{`
        .boston-map-tooltip {
          background: #091f2f;
          border: 1px solid #1871bd;
          color: #fff;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 7px;
          border-radius: 2px;
          white-space: nowrap;
        }
        .boston-map-tooltip::before {
          display: none;
        }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(9,31,47,0.7) !important;
          color: rgba(255,255,255,0.4) !important;
          padding: 1px 4px !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.5) !important; }
      `}</style>
      <div
        ref={containerRef}
        className="bg-[#0d1b2a]"
        style={{ width: "100%", height }}
      />
    </>
  );
}
