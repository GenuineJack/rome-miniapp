"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/features/rome/types";

type LeafletMapProps = {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  center?: [number, number];
  zoom?: number;
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getPinColor(spot: Spot): string {
  if (Date.now() - new Date(spot.createdAt).getTime() < ONE_WEEK_MS) return "#1f5f3a"; // new
  if (spot.featured) return "#c69214"; // featured
  return "#a83232"; // regular
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

export function LeafletMapInner({ spots, onSpotClick, center, zoom }: LeafletMapProps) {
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
        center: center ?? [41.9028, 12.4964],
        zoom: zoom ?? 13,
        minZoom: 11,
        maxZoom: 17,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;
      setMapReady(true);

      // CARTO Voyager — free, no API key, better daytime contrast.
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
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
            color: "#f5efe2",
            weight: 2,
          }
        );

        marker.on("click", () => onSpotClick(spot));
        marker.bindTooltip(spot.name, {
          permanent: false,
          direction: "top",
          offset: [0, -8],
          className: "rome-map-tooltip",
        });

        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [spots, onSpotClick, mapReady]);

  return (
    <>
      <style>{`
        .rome-map-tooltip {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #c69214;
          color: #3a2a1a;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 7px;
          border-radius: 2px;
          white-space: nowrap;
        }
        .rome-map-tooltip::before {
          display: none;
        }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: color-mix(in srgb, #f5efe2 85%, transparent) !important;
          color: color-mix(in srgb, #3a2a1a 70%, transparent) !important;
          padding: 1px 4px !important;
        }
        .leaflet-control-attribution a {
          color: color-mix(in srgb, #3a2a1a 80%, transparent) !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full bg-boston-gray-50"
      />
    </>
  );
}
