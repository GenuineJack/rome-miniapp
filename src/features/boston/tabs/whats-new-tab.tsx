"use client";

import { useState, useEffect } from "react";
import { Spot } from "@/features/boston/types";
import { getRecentSpots } from "@/db/actions/boston-actions";
import { SpotFeedCard } from "@/features/boston/components/spot-feed-card";

type SeasonalBlock = {
  type: "seasonal";
  id: string;
  title: string;
  description: string;
  emoji: string;
};

type SpotEntry = {
  type: "spot";
  spot: Spot;
};

type FeedEntry = SeasonalBlock | SpotEntry;

const SEASONAL_BLOCKS: SeasonalBlock[] = [
  {
    type: "seasonal",
    id: "marathon-2026",
    title: "Marathon Monday",
    description: "Third Monday of April. The whole city shuts down for a footrace and that's correct. Best spots to watch: Heartbreak Hill, Kenmore Square, Boylston Street finish line.",
    emoji: "🏃",
  },
  {
    type: "seasonal",
    id: "summer-rooftops",
    title: "Rooftop Season",
    description: "The window is short. May through September, rooftop bars are the correct answer. Know them before you need them.",
    emoji: "🌆",
  },
  {
    type: "seasonal",
    id: "patio-season-2026",
    title: "Patio Season",
    description: "The city doubles in size when the patios open. South End, North End, Eastie waterfront. If it has outdoor seating, it's the right choice.",
    emoji: "☀️",
  },
  {
    type: "seasonal",
    id: "fenway-opener-2026",
    title: "Opening Day at Fenway",
    description: "First Tuesday in April. The bleachers. The Sausage Guy. Lansdowne after. A civic holiday by any other name.",
    emoji: "⚾",
  },
];


function SeasonalBlockCard({ block }: { block: SeasonalBlock }) {
  return (
    <div
      className="p-4 rounded-sm"
      style={{ background: "#091f2f" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{block.emoji}</span>
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ fontFamily: "var(--font-sans)", color: "#fcb61a" }}
        >
          Seasonal
        </span>
      </div>
      <h3
        className="text-sm font-bold mb-1.5"
        style={{ fontFamily: "var(--font-sans)", color: "#fff" }}
      >
        {block.title}
      </h3>
      <p
        className="text-xs italic leading-relaxed"
        style={{ fontFamily: "var(--font-serif)", color: "rgba(255,255,255,0.75)" }}
      >
        {block.description}
      </p>
    </div>
  );
}

function buildFeed(spots: Spot[]): FeedEntry[] {
  // Interleave: seasonal, 3 spots, seasonal, 4 spots, seasonal, 4 spots, seasonal, rest
  const feed: FeedEntry[] = [];
  const counts = [3, 4, 4];
  let spotIdx = 0;

  for (let i = 0; i < SEASONAL_BLOCKS.length; i++) {
    feed.push(SEASONAL_BLOCKS[i]);
    const take = counts[i] ?? spots.length;
    const slice = spots.slice(spotIdx, spotIdx + take);
    slice.forEach((s) => feed.push({ type: "spot", spot: s }));
    spotIdx += take;
  }

  // Remaining spots after the last seasonal block
  spots.slice(spotIdx).forEach((s) => feed.push({ type: "spot", spot: s }));

  return feed;
}

type WhatsNewTabProps = {
  spots?: Spot[];
  loading?: boolean;
  onSelectSpot?: (spot: Spot) => void;
};

export function WhatsNewTab({ spots: parentSpots, loading: parentLoading, onSelectSpot }: WhatsNewTabProps = {}) {
  const [ownSpots, setOwnSpots] = useState<Spot[]>([]);
  const [ownLoading, setOwnLoading] = useState(parentSpots === undefined);

  const spots = parentSpots ?? ownSpots;
  const loading = parentSpots !== undefined ? (parentLoading ?? false) : ownLoading;

  // parentSpots is intentionally excluded from deps — we only want this to run
  // on mount when spots weren't provided by the parent. Adding parentSpots would
  // cause redundant fetches on every parent re-render.
  const hasParentSpots = parentSpots !== undefined;
  useEffect(() => {
    if (!hasParentSpots) {
      getRecentSpots(30).then((data) => {
        setOwnSpots(data as Spot[]);
        setOwnLoading(false);
      });
    }
  }, [hasParentSpots]);

  const feed = buildFeed(spots);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#e0e0e0]" style={{ background: "#091f2f" }}>
        <h2
          className="text-lg font-black uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          What&apos;s New
        </h2>
        <p
          className="text-xs italic text-white opacity-60 mt-0.5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Recent submissions and seasonal picks
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse" style={{ height: "112px" }} />
            ))}
          </>
        ) : spots.length === 0 ? (
          <>
            {SEASONAL_BLOCKS.map((b) => (
              <SeasonalBlockCard key={b.id} block={b} />
            ))}
            <div className="py-8 text-center">
              <p
                className="text-sm font-bold uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-sans)", color: "#091f2f" }}
              >
                Nothing submitted yet.
              </p>
              <p
                className="text-sm italic"
                style={{ fontFamily: "var(--font-serif)", color: "#828282" }}
              >
                Go be the first person to rep your neighborhood.
              </p>
            </div>
          </>
        ) : (
          feed.map((entry) => {
            if (entry.type === "seasonal") {
              return <SeasonalBlockCard key={entry.id} block={entry} />;
            }
            return <SpotFeedCard key={entry.spot.id} spot={entry.spot} onClick={onSelectSpot} />;
          })
        )}
      </div>
    </div>
  );
}
