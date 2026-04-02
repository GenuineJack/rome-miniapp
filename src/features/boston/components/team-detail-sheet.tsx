"use client";

import dynamic from "next/dynamic";
import { TEAM_METADATA, TeamMetadata } from "./teams-config";
import { BostonGame, Spot } from "@/features/boston/types";
import { ExternalLink } from "@/neynar-farcaster-sdk/mini";

const LeafletMapInner = dynamic(
  () => import("@/features/boston/components/leaflet-map").then((m) => ({ default: m.LeafletMapInner })),
  { ssr: false, loading: () => <div className="w-full h-[160px] bg-navy animate-pulse rounded-sm" /> }
);

type TeamDetailSheetProps = {
  teamName: string | null;
  games: BostonGame[];
  onClose: () => void;
};

export function TeamDetailSheet({ teamName, games, onClose }: TeamDetailSheetProps) {
  if (!teamName) return null;

  const meta = TEAM_METADATA[teamName];
  if (!meta) return null;

  const teamGames = games.filter((g) => g.team === teamName);

  // Venue as a spot for the map
  const venueSpot: Spot = {
    id: `venue-${meta.venue.toLowerCase().replace(/\s+/g, "-")}`,
    name: meta.venue,
    category: "Culture",
    subcategory: null,
    neighborhood: "",
    description: `Home of the ${meta.fullName}`,
    address: null,
    latitude: meta.venueCoords[0],
    longitude: meta.venueCoords[1],
    link: null,
    submittedByFid: 0,
    submittedByUsername: "boston",
    submittedByDisplayName: "Boston Miniapp",
    submittedByPfpUrl: null,
    featured: false,
    status: "approved",
    touristPick: false,
    createdAt: new Date(),
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-navy px-4 pt-4 pb-5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-opacity t-sans"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white t-sans leading-tight">
              {meta.fullName}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-boston-blue t-sans">
              {meta.sport} · Est. {meta.founded}
            </p>
          </div>
        </div>
      </div>

      {/* Venue Map */}
      <div className="border-b border-[#e0e0e0]">
        <LeafletMapInner
          spots={[venueSpot]}
          onSpotClick={() => {}}
          height="160px"
          center={meta.venueCoords}
          zoom={15}
        />
        <div className="px-4 py-2 bg-boston-gray-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest t-sans-navy">
            📍 {meta.venue}
          </span>
          <span className="text-xs t-sans-gray">{meta.colors}</span>
        </div>
      </div>

      {/* Upcoming Games */}
      {teamGames.length > 0 && (
        <div className="px-4 py-4 border-b border-[#e0e0e0]">
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-3">
            Upcoming
          </h2>
          <div className="flex flex-col gap-2">
            {teamGames.map((game) => (
              <GameRow key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      <div className="px-4 py-4 border-b border-[#e0e0e0]">
        <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-2">
          About
        </h2>
        <p className="text-sm italic leading-relaxed t-serif-body">{meta.bio}</p>
      </div>

      {/* Championships */}
      {meta.championships.length > 0 && (
        <div className="px-4 py-4 border-b border-[#e0e0e0]">
          <h2 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-2">
            🏆 Championships ({meta.championships.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {meta.championships.map((year) => (
              <span
                key={year}
                className="px-2 py-0.5 rounded-sm bg-navy text-xs font-bold text-white t-sans"
              >
                {year}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule link */}
      <div className="px-4 py-4 pb-8">
        <ExternalLink
          href={meta.scheduleUrl}
          className="block w-full text-center px-4 py-3 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest t-sans hover:opacity-90 transition-opacity"
        >
          Full Schedule →
        </ExternalLink>
      </div>
    </div>
  );
}

function GameRow({ game }: { game: BostonGame }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <div className={`flex items-center justify-between p-3 rounded-sm ${isLive ? "bg-boston-red/10 border border-boston-red/30" : "bg-boston-gray-50"}`}>
      <div>
        <p className="text-xs font-bold t-sans-navy">vs {game.opponent}</p>
        <p className="text-xs t-sans-gray">{game.venue.split(",")[0]}</p>
      </div>
      <div className="text-right">
        {isLive ? (
          <p className="text-xs font-bold uppercase t-sans text-boston-red">
            🔴 LIVE {game.score ? `${game.score.home}–${game.score.away}` : ""}
          </p>
        ) : isFinal ? (
          <p className="text-xs font-bold uppercase t-sans-gray">
            Final {game.score ? `${game.score.home}–${game.score.away}` : ""}
          </p>
        ) : (
          <>
            <p className="text-xs font-bold t-sans-navy">{game.time}</p>
            <p className="text-xs t-sans-gray">{game.date}</p>
          </>
        )}
      </div>
    </div>
  );
}
