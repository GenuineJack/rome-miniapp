"use client";

import dynamic from "next/dynamic";
import { Spot } from "@/features/boston/types";

const LeafletMapInner = dynamic(
  () => import("@/features/boston/components/leaflet-map").then((m) => ({ default: m.LeafletMapInner })),
  { ssr: false, loading: () => <div className="w-full h-[200px] bg-navy animate-pulse rounded-sm" /> }
);

// ─── Match schedule (TBD teams, dates confirmed) ─────────────────────────────

const WORLD_CUP_MATCHES = [
  { id: "wc-1", date: "June 13, 2026", time: "9:00 PM ET", teams: "Haiti vs. Scotland", round: "Group C" },
  { id: "wc-2", date: "June 16, 2026", time: "6:00 PM ET", teams: "Playoff Winner vs. Norway", round: "Group I" },
  { id: "wc-3", date: "June 19, 2026", time: "6:00 PM ET", teams: "Scotland vs. Morocco", round: "Group C" },
  { id: "wc-4", date: "June 23, 2026", time: "4:00 PM ET", teams: "England vs. Ghana", round: "Group L" },
  { id: "wc-5", date: "June 26, 2026", time: "3:00 PM ET", teams: "Norway vs. France", round: "Group I" },
  { id: "wc-6", date: "June 29, 2026", time: "4:30 PM ET", teams: "Winner Group E vs. 3rd Place", round: "Round of 32" },
  { id: "wc-7", date: "July 9, 2026", time: "4:00 PM ET", teams: "Quarterfinal — TBD vs TBD", round: "Quarterfinal" },
];

const GILLETTE_CENTER: [number, number] = [42.0909, -71.2643];

type WorldCupPageProps = {
  onBack: () => void;
  spots?: Spot[];
  onSelectSpot?: (spot: Spot) => void;
};

export function WorldCupPage({ onBack, spots = [], onSelectSpot }: WorldCupPageProps) {
  // Countdown — first match at Gillette is June 13
  const firstMatch = new Date(2026, 5, 13);
  const now = new Date();
  const daysUntil = Math.max(0, Math.round((firstMatch.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Filter spots good for watching games
  const watchSpots = spots.filter(
    (s) => s.category === "Food & Drink" || s.category === "Nightlife"
  ).slice(0, 8);

  // Gillette as a fake spot for the map
  const gilletteSpot: Spot = {
    id: "gillette-stadium",
    name: "Gillette Stadium",
    category: "Culture",
    subcategory: null,
    neighborhood: "Foxborough",
    description: "Home of the FIFA World Cup 2026 Boston matches. Referred to as Boston Stadium for the tournament. 65,878 capacity.",
    address: "1 Patriot Pl, Foxborough, MA 02035",
    latitude: 42.0909,
    longitude: -71.2643,
    link: "https://www.gillettestadium.com",
    submittedByFid: 0,
    submittedByUsername: "boston",
    submittedByDisplayName: "Boston Miniapp",
    submittedByPfpUrl: null,
    featured: true,
    status: "approved",
    touristPick: true,
    createdAt: new Date(),
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* Hero */}
      <div className="bg-navy px-4 pt-4 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-opacity t-sans"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚽</span>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white t-sans leading-tight">
              FIFA World Cup 2026
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-boston-blue t-sans">
              Boston Host City — Boston Stadium (Gillette)
            </p>
          </div>
        </div>
        {daysUntil > 0 && (
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white t-sans">{daysUntil}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 t-sans">
              days until first match
            </span>
          </div>
        )}
      </div>

      {/* Match Schedule */}
      <div className="px-4 py-4 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🏟</span>
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy">
            Match Schedule — Boston Stadium
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {WORLD_CUP_MATCHES.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-3 rounded-sm bg-boston-gray-50">
              <div>
                <p className="text-xs font-bold t-sans-navy">{match.teams}</p>
                <p className="text-xs t-sans-gray">{match.date} · {match.time}</p>
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm t-sans ${
                match.round === "Quarterfinal" ? "bg-[#c8102e] text-white" : match.round.startsWith("Round") ? "bg-boston-blue text-white" : "bg-[#e0e0e0] text-navy"
              }`}>
                {match.round}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Venue Map */}
      <div className="border-b border-[#e0e0e0]">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📍</span>
            <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy">
              Venue — Gillette Stadium, Foxborough
            </h2>
          </div>
        </div>
        <LeafletMapInner
          spots={[gilletteSpot]}
          onSpotClick={() => {}}
          height="200px"
          center={GILLETTE_CENTER}
          zoom={13}
        />
      </div>

      {/* Getting There */}
      <div className="px-4 py-4 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🚇</span>
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy">
            Getting There
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-sm bg-boston-gray-50">
            <p className="text-xs font-bold t-sans-navy mb-1">MBTA + Shuttle</p>
            <p className="text-[13px] italic t-serif-body">
              Take the Commuter Rail Foxboro Pilot from South Station or Back Bay. MBTA typically runs special event service for major Gillette events. Check mbta.com for World Cup schedules.
            </p>
          </div>
          <div className="p-3 rounded-sm bg-boston-gray-50">
            <p className="text-xs font-bold t-sans-navy mb-1">Driving</p>
            <p className="text-[13px] italic t-serif-body">
              35 miles south of Boston via I-93 S to I-95 S. Budget 90+ minutes on game days. Parking at Gillette opens 4 hours before kickoff.
            </p>
          </div>
          <div className="p-3 rounded-sm bg-boston-gray-50">
            <p className="text-xs font-bold t-sans-navy mb-1">Fan Zones</p>
            <p className="text-[13px] italic t-serif-body">
              FIFA fan zones expected in Downtown Boston and at Gillette. Official viewing parties TBD. Check back as the schedule solidifies.
            </p>
          </div>
        </div>
      </div>

      {/* Watch Spots */}
      {watchSpots.length > 0 && (
        <div className="px-4 py-4 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📺</span>
            <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy">
              Where to Watch in Boston
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {watchSpots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => onSelectSpot?.(spot)}
                className="w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm transition-colors hover:bg-[#e0e0e0] bg-boston-gray-50"
              >
                <div>
                  <span className="text-xs font-bold t-sans-navy">{spot.name}</span>
                  <span className="text-xs t-sans-gray ml-2">{spot.neighborhood}</span>
                </div>
                <span className="text-xs t-sans-blue shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Need to Know */}
      <div className="px-4 py-4 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">📋</span>
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy">
            Need to Know
          </h2>
        </div>
        <div className="flex flex-col gap-2 text-[13px] italic t-serif-body">
          <p>· Boston is hosting 7 matches: 5 group stage, 1 Round of 32, and a quarterfinal at Gillette Stadium (Boston Stadium for the tournament).</p>
          <p>· Matches feature England, France, Scotland, Norway, Morocco, Ghana, and Haiti — plus knockout rounds.</p>
          <p>· Gillette is in Foxborough, ~35 miles south of Boston. Plan transportation early.</p>
          <p>· Hotels in Boston will book fast. The South Shore is the backup plan.</p>
          <p>· The World Cup runs June 11–July 19, 2026 across 16 cities in the US, Mexico, and Canada.</p>
        </div>
      </div>
    </div>
  );
}
