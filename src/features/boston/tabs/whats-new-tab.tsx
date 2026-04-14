"use client";

import { useState, useEffect } from "react";
import { Spot } from "@/features/boston/types";
import { ExternalLink } from "@/neynar-farcaster-sdk/mini";

// ─── Dispatch Content Type ───────────────────────────────────────────────────

type DispatchContent = {
  date: string;
  banner: {
    weather: string;
    transit: string | null;
    countdown: string | null;
  };
  lede?: string;
  intro: string;
  whatYouMissed: { headline: string; url: string }[];
  lastNight: { team: string; result: string; summary: string; url: string }[] | null;
  getAroundToday: string | null;
  tonight: { title: string; detail: string; url?: string }[] | null;
  todaysSpot: { name: string; neighborhood: string; reason: string; spotId?: string };
  onThisDay: string | null;
  theNumber: { number: string; context: string } | null;
  sendOff: string;
  weatherWatch?: string;
};

// ─── Fallback seasonal blocks ────────────────────────────────────────────────

const FALLBACK_BLOCKS = [
  { id: "marathon", emoji: "🏃", title: "Marathon Monday", desc: "Third Monday of April. The whole city shuts down for a footrace and that's correct." },
  { id: "patios", emoji: "☀️", title: "Patio Season", desc: "The city doubles in size when the patios open. South End, North End, Eastie waterfront." },
  { id: "fenway", emoji: "⚾", title: "Opening Day at Fenway", desc: "The bleachers. The Sausage Guy. Lansdowne after. A civic holiday by any other name." },
  { id: "rooftops", emoji: "🌆", title: "Rooftop Season", desc: "May through September, rooftop bars are the correct answer." },
];

// ─── Section Components ──────────────────────────────────────────────────────

function BannerStrip({ banner }: { banner: DispatchContent["banner"] }) {
  const parts = [banner.weather];
  if (banner.transit) parts.push(banner.transit);
  if (banner.countdown) parts.push(banner.countdown);
  return (
    <div className="px-4 py-2 bg-navy text-xs t-sans text-white/70 flex items-center gap-1.5 flex-wrap">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="opacity-40 mr-1.5">·</span>}
          {p}
        </span>
      ))}
    </div>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">{emoji}</span>
      <h3 className="text-xs font-bold uppercase tracking-widest t-sans-navy">{title}</h3>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

type WhatsNewTabProps = {
  spots?: Spot[];
  loading?: boolean;
  onSelectSpot?: (spot: Spot) => void;
};

export function WhatsNewTab({ spots, onSelectSpot }: WhatsNewTabProps) {
  const [dispatch, setDispatch] = useState<DispatchContent | null>(null);
  const [dispatchLoading, setDispatchLoading] = useState(true);
  const [dispatchError, setDispatchError] = useState(false);

  useEffect(() => {
    fetch("/api/dispatch/today")
      .then((res) => {
        if (!res.ok) throw new Error("No dispatch");
        return res.json();
      })
      .then((data) => {
        if (data.dispatch) setDispatch(data.dispatch);
        else setDispatchError(true);
        setDispatchLoading(false);
      })
      .catch(() => {
        setDispatchError(true);
        setDispatchLoading(false);
      });
  }, []);

  // Loading skeleton
  if (dispatchLoading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-4 py-4 bg-navy">
          <div className="h-4 w-48 rounded bg-white/10 animate-pulse mb-2" />
          <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="flex flex-col gap-4 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-sm bg-[#e0e0e0] animate-pulse h-20" />
          ))}
        </div>
      </div>
    );
  }

  // Error / no dispatch — show fallback
  if (dispatchError || !dispatch) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-4 py-4 bg-navy border-b border-white/10">
          <h2 className="text-lg font-black uppercase tracking-tight text-white t-sans">
            The Dispatch
          </h2>
          <p className="text-[13px] italic text-white/60 mt-0.5 t-serif">
            Your daily Boston briefing
          </p>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm italic t-serif-gray mb-6">
            Today&apos;s dispatch is on its way. Check back later.
          </p>
        </div>
        <div className="flex flex-col gap-3 px-4 pb-6">
          {FALLBACK_BLOCKS.map((b) => (
            <div key={b.id} className="p-4 rounded-sm bg-navy">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{b.emoji}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest t-sans text-white/40">Seasonal</span>
              </div>
              <h3 className="text-sm font-bold mb-1.5 t-sans-white">{b.title}</h3>
              <p className="text-[13px] italic leading-relaxed t-serif text-white/75">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Rendered Dispatch ───────────────────────────────────────────────────

  function handleSpotTap() {
    if (dispatch?.todaysSpot?.spotId && spots && onSelectSpot) {
      const match = spots.find((s) => s.id === dispatch.todaysSpot.spotId);
      if (match) onSelectSpot(match);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Banner */}
      <BannerStrip banner={dispatch.banner} />

      {/* Date header */}
      <div className="px-4 pt-4 pb-3 bg-navy border-b border-white/10">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 t-sans mb-1">
          {dispatch.date}
        </p>
        <h2 className="text-xl font-black uppercase tracking-tight text-white t-sans">
          The Boston Dispatch
        </h2>
      </div>

      <div className="flex flex-col gap-0 pb-6">
        {/* The Lede */}
        {dispatch.lede && (
          <div className="px-4 py-5 border-b border-[#e0e0e0]">
            {dispatch.lede.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className={`text-[15px] leading-[1.7] t-serif-body ${i > 0 ? "mt-3" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Intro */}
        <div className="px-4 py-4 border-b border-[#e0e0e0]">
          <p className="text-sm italic leading-relaxed t-serif-body">{dispatch.intro}</p>
        </div>

        {/* What You Missed */}
        {dispatch.whatYouMissed.length > 0 && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="📰" title="What You Missed" />
            <div className="flex flex-col gap-2">
              {dispatch.whatYouMissed.map((item, i) => (
                <ExternalLink
                  key={i}
                  href={item.url}
                  className="text-[13px] leading-snug t-sans-navy hover:underline block"
                >
                  <span className="text-boston-gray-400 mr-1.5">·</span>
                  {item.headline}
                  <span className="text-boston-blue ml-1">→</span>
                </ExternalLink>
              ))}
            </div>
          </div>
        )}

        {/* Last Night */}
        {dispatch.lastNight && dispatch.lastNight.length > 0 && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="⚾" title="Last Night" />
            <div className="flex flex-col gap-3">
              {dispatch.lastNight.map((game, i) => (
                <div key={i} className="p-3 rounded-sm bg-boston-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold t-sans-navy">{game.team}</span>
                    <span className={`text-xs font-bold uppercase tracking-widest t-sans ${game.result.startsWith("Won") ? "text-[#007A33]" : "text-boston-red"}`}>
                      {game.result}
                    </span>
                  </div>
                  <p className="text-[13px] italic t-serif-body">{game.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Get Around Today */}
        {dispatch.getAroundToday && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="🚇" title="Get Around Today" />
            <p className="text-[13px] italic t-serif-body">{dispatch.getAroundToday}</p>
          </div>
        )}

        {/* Tonight */}
        {dispatch.tonight && dispatch.tonight.length > 0 && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="🌆" title="Tonight" />
            <div className="flex flex-col gap-2">
              {dispatch.tonight.map((ev, i) => (
                <div key={i}>
                  <p className="text-xs font-bold t-sans-navy">{ev.title}</p>
                  <p className="text-[13px] italic t-serif-body">{ev.detail}</p>
                  {ev.url && (
                    <ExternalLink href={ev.url} className="text-xs font-bold t-sans-blue hover:underline">
                      Details →
                    </ExternalLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Spot */}
        <div
          className={`px-4 py-4 border-b border-[#e0e0e0] ${dispatch.todaysSpot.spotId ? "cursor-pointer hover:bg-boston-gray-50" : ""}`}
          onClick={handleSpotTap}
        >
          <SectionHeader emoji="📍" title="Today's Spot" />
          <p className="text-sm font-bold t-sans-navy">{dispatch.todaysSpot.name}</p>
          <p className="text-xs uppercase tracking-widest t-sans-gray mb-1">
            {dispatch.todaysSpot.neighborhood}
          </p>
          <p className="text-[13px] italic t-serif-body">{dispatch.todaysSpot.reason}</p>
        </div>

        {/* On This Day */}
        {dispatch.onThisDay && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="🗓" title="On This Day" />
            <p className="text-[13px] italic t-serif-body">{dispatch.onThisDay}</p>
          </div>
        )}

        {/* The Number */}
        {dispatch.theNumber && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="🔢" title="The Number" />
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black t-sans-navy">{dispatch.theNumber.number}</span>
              <p className="text-[13px] italic t-serif-body flex-1">{dispatch.theNumber.context}</p>
            </div>
          </div>
        )}

        {/* Weather Watch */}
        {dispatch.weatherWatch && (
          <div className="px-4 py-4 border-b border-[#e0e0e0]">
            <SectionHeader emoji="⛈️" title="Weather Watch" />
            <p className="text-[13px] italic t-serif-body">{dispatch.weatherWatch}</p>
          </div>
        )}

        {/* Send-Off */}
        {dispatch.sendOff && (
          <div className="px-4 pt-5 pb-4">
            <p className="text-[13px] italic leading-relaxed t-serif-body text-boston-gray-400">
              {dispatch.sendOff}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
