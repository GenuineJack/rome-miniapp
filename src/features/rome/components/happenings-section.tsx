"use client";

import { useMemo, useState, useEffect } from "react";
import { Happening, CommunityHappening } from "@/features/rome/types";
import type { EventItem } from "@/app/api/events/route";
import type { MonthlyHappening } from "@/db/actions/monthly-happenings-actions";
import { ExternalLink } from "@/neynar-farcaster-sdk/mini";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

// ─── Happening definitions ────────────────────────────────────────────────────
// Each entry has date window logic and a dynamic timing label function.
// Cards are filtered to only show if they're currently relevant.
// timingLabel() receives today's Date and returns the display string.

type HappeningDef = Omit<Happening, "timing"> & {
  isActive: (today: Date) => boolean;
  timingLabel: (today: Date) => string;
};

function daysUntil(today: Date, month: number, day: number, year?: number): number {
  const y = year ?? today.getFullYear();
  const target = new Date(y, month - 1, day);
  if (target < today && !year) {
    target.setFullYear(today.getFullYear() + 1);
  }
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isFirstFridayThisWeek(today: Date): boolean {
  // Is the first Friday of this month within the next 7 days?
  const month = today.getMonth();
  const year = today.getFullYear();
  const firstFriday = new Date(year, month, 1);
  while (firstFriday.getDay() !== 5) firstFriday.setDate(firstFriday.getDate() + 1);
  const diff = Math.round((firstFriday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= 7;
}

function isFirstFridayToday(today: Date): boolean {
  if (today.getDay() !== 5) return false;
  const firstFriday = new Date(today.getFullYear(), today.getMonth(), 1);
  while (firstFriday.getDay() !== 5) firstFriday.setDate(firstFriday.getDate() + 1);
  return firstFriday.getDate() === today.getDate();
}

// ─── Helper: nth weekday of a month ──────────────────────────────────────────
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  // weekday: 0=Sun, 1=Mon … 6=Sat. n: 1=first, 2=second, etc.
  const d = new Date(year, month - 1, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === weekday) { count++; if (count === n) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const d = new Date(year, month, 0); // last day of month
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
  return d;
}

function nextFirstFriday(today: Date): Date {
  const ff = new Date(today.getFullYear(), today.getMonth(), 1);
  while (ff.getDay() !== 5) ff.setDate(ff.getDate() + 1);
  if (ff <= today) {
    ff.setMonth(ff.getMonth() + 1);
    ff.setDate(1);
    while (ff.getDay() !== 5) ff.setDate(ff.getDate() + 1);
  }
  return ff;
}

function shortLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Countdown helpers ────────────────────────────────────────────────────────
function countdown(today: Date, target: Date): string {
  const days = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  if (days <= 7) return `IN ${days} DAYS`;
  if (days <= 14) return `${shortLabel(target)} — THIS MONTH`;
  return shortLabel(target).toUpperCase();
}

const HAPPENING_DEFS: HappeningDef[] = [
  // ── YEAR-ROUND / MONTHLY ────────────────────────────────────────────────────
  {
    id: "first-friday-sowa",
    title: "First Friday at SoWa",
    description: "Galleries open, food trucks show up, and the South End becomes the best neighborhood in the city for three hours.",
    relatedNeighborhood: "south-end",
    emoji: "🎨",
    isActive: (today) => today.getMonth() + 1 >= 3 && today.getMonth() + 1 <= 11,
    timingLabel: (today) => {
      if (isFirstFridayToday(today)) return "TONIGHT";
      if (isFirstFridayThisWeek(today)) return "THIS WEEK";
      return `NEXT: ${shortLabel(nextFirstFriday(today))}`;
    },
  },
  {
    id: "patio-season",
    title: "Patio Season Is Open",
    description: "The window is short and the city knows it. South End porches, Eastie waterfront, North End sidewalk tables. If it's above 55°F, you sit outside.",
    relatedNeighborhood: "south-end",
    emoji: "☀️",
    isActive: (today) => today.getMonth() + 1 >= 4 && today.getMonth() + 1 <= 10,
    timingLabel: (today) => {
      const m = today.getMonth() + 1;
      if (m === 4) return "PATIO SEASON JUST OPENED";
      if (m >= 9) return "LAST WEEKS — ENJOY IT";
      return "NOW THROUGH OCTOBER";
    },
  },
  {
    id: "harbor-islands",
    title: "Harbor Islands Are Open",
    description: "Ferries from Long Wharf. Spectacle Island has a beach. Georges Island has a fort. Most Bostonians have never been. Fix that.",
    relatedNeighborhood: "seaport",
    emoji: "⛴️",
    isActive: (today) => today.getMonth() + 1 >= 5 && today.getMonth() + 1 <= 10,
    timingLabel: (today) => {
      const m = today.getMonth() + 1;
      if (m === 5) return "JUST OPENED FOR THE SEASON";
      if (m >= 9) return "CLOSING SOON";
      return "OPEN NOW — MAY THROUGH OCTOBER";
    },
  },

  // ── SPRING ──────────────────────────────────────────────────────────────────
  {
    id: "fenway-opener",
    title: "Opening Day at Fenway",
    description: "First home game of the season. The bleachers, the Sausage Guy, Lansdowne after. A civic holiday that doesn't need a proclamation.",
    relatedNeighborhood: "fenway-kenmore",
    emoji: "⚾",
    isActive: (today) => { const d = daysUntil(today, 4, 2, 2026); return d >= 0 && d <= 14; },
    timingLabel: (today) => countdown(today, new Date(2026, 3, 2)),
  },
  {
    id: "marathon",
    title: "Marathon Monday",
    description: "The whole city shuts down for a footrace and that's correct. Heartbreak Hill, Kenmore Square, the Boylston Street finish. Pick your spot early.",
    relatedNeighborhood: "fenway-kenmore",
    emoji: "🏃",
    isActive: (today) => { const d = daysUntil(today, 4, 20, 2026); return d >= 0 && d <= 21; },
    timingLabel: (today) => {
      const d = daysUntil(today, 4, 20, 2026);
      if (d === 0) return "TODAY — MARATHON MONDAY";
      return countdown(today, new Date(2026, 3, 20));
    },
  },
  {
    id: "restaurant-week-spring",
    title: "Boston Restaurant Week",
    description: "Prix-fixe menus at 200+ restaurants. Three courses for a fixed price. The Back Bay and South End fill up fast — make reservations now.",
    relatedNeighborhood: "back-bay",
    emoji: "🍽️",
    // Spring edition: typically third week of March
    isActive: (today) => {
      const start = nthWeekday(today.getFullYear(), 3, 1, 3); // 3rd Monday of March
      const end = new Date(start); end.setDate(end.getDate() + 14);
      const prewindow = new Date(start); prewindow.setDate(prewindow.getDate() - 7);
      return today >= prewindow && today <= end;
    },
    timingLabel: (today) => {
      const start = nthWeekday(today.getFullYear(), 3, 1, 3);
      const end = new Date(start); end.setDate(end.getDate() + 14);
      if (today >= start && today <= end) return "HAPPENING NOW";
      return countdown(today, start);
    },
  },
  {
    id: "north-end-feasts",
    title: "North End Feasts Begin",
    description: "Street saints, brass bands, and zeppole. The North End feast season runs every weekend June through August. Check the schedule, pick a saint, show up.",
    relatedNeighborhood: "north-end",
    emoji: "🎺",
    isActive: (today) => today.getMonth() + 1 >= 6 && today.getMonth() + 1 <= 8,
    timingLabel: (today) => {
      const m = today.getMonth() + 1;
      if (m === 6) return "STARTING THIS MONTH";
      if (m === 7) return "EVERY WEEKEND";
      return "FINAL WEEKS";
    },
  },

  // ── SUMMER ──────────────────────────────────────────────────────────────────
  {
    id: "fourth-of-july",
    title: "Fourth of July on the Esplanade",
    description: "The BSO plays the 1812 Overture with actual cannons. A million people show up. The fireworks over the Charles are the real thing. Get there early.",
    relatedNeighborhood: "back-bay",
    emoji: "🎆",
    isActive: (today) => { const d = daysUntil(today, 7, 4); return d >= 0 && d <= 14; },
    timingLabel: (today) => {
      const d = daysUntil(today, 7, 4);
      if (d === 0) return "TODAY — HAPPY FOURTH";
      return countdown(today, new Date(today.getFullYear(), 6, 4));
    },
  },
  {
    id: "boston-harbor-fest",
    title: "Boston Harborfest",
    description: "Six days of Revolutionary War history, tall ships, USS Constitution tours, and chowderfest. It's peak tourist week — locals know to lean in.",
    relatedNeighborhood: "downtown",
    emoji: "⚓",
    isActive: (today) => {
      // Runs the week of July 4
      const start = new Date(today.getFullYear(), 6, 1);
      const end = new Date(today.getFullYear(), 6, 7);
      const prewindow = new Date(start); prewindow.setDate(prewindow.getDate() - 7);
      return today >= prewindow && today <= end;
    },
    timingLabel: (today) => {
      const start = new Date(today.getFullYear(), 6, 1);
      const end = new Date(today.getFullYear(), 6, 7);
      if (today >= start && today <= end) return "HAPPENING NOW";
      return countdown(today, start);
    },
  },
  {
    id: "sowa-open-market",
    title: "SoWa Open Market Is Back",
    description: "The outdoor market on Harrison Ave every Sunday, May through October. Local farmers, food trucks, vintage, and the kind of Sunday that makes you glad you live here.",
    relatedNeighborhood: "south-end",
    emoji: "🌿",
    isActive: (today) => today.getMonth() + 1 >= 5 && today.getMonth() + 1 <= 10,
    timingLabel: (today) => {
      const isSunday = today.getDay() === 0;
      if (isSunday) return "TODAY — OPEN NOW";
      const daysToSunday = (7 - today.getDay()) % 7 || 7;
      if (daysToSunday === 1) return "TOMORROW";
      return `THIS SUNDAY`;
    },
  },

  // ── FALL ────────────────────────────────────────────────────────────────────
  {
    id: "allston-christmas",
    title: "Allston Christmas",
    description: "September 1st. Every lease in Allston turns over on the same day. Perfectly good furniture lines every sidewalk. It's a holiday. Bring a truck.",
    relatedNeighborhood: "allston-brighton",
    emoji: "🛋️",
    isActive: (today) => { const d = daysUntil(today, 9, 1); return d >= 0 && d <= 7; },
    timingLabel: (today) => {
      const d = daysUntil(today, 9, 1);
      if (d === 0) return "TODAY — ALLSTON CHRISTMAS";
      if (d === 1) return "TOMORROW — BRING A TRUCK";
      return `IN ${d} DAYS`;
    },
  },
  {
    id: "head-of-the-charles",
    title: "Head of the Charles Regatta",
    description: "The Charles River fills up with rowing crews from around the world. The banks fill up with everyone else. It's the best autumn day Boston does.",
    relatedNeighborhood: "cambridge-somerville",
    emoji: "🚣",
    isActive: (today) => {
      // Third weekend of October
      const sat = nthWeekday(today.getFullYear(), 10, 6, 3);
      const prewindow = new Date(sat); prewindow.setDate(prewindow.getDate() - 7);
      const end = new Date(sat); end.setDate(end.getDate() + 1);
      return today >= prewindow && today <= end;
    },
    timingLabel: (today) => {
      const sat = nthWeekday(today.getFullYear(), 10, 6, 3);
      if (today >= sat) return "THIS WEEKEND";
      return countdown(today, sat);
    },
  },
  {
    id: "restaurant-week-fall",
    title: "Boston Restaurant Week",
    description: "Prix-fixe menus at 200+ restaurants. Three courses for a fixed price. The Back Bay and South End fill up fast — make reservations now.",
    relatedNeighborhood: "back-bay",
    emoji: "🍽️",
    // Fall edition: typically third week of August
    isActive: (today) => {
      const start = nthWeekday(today.getFullYear(), 8, 1, 3);
      const end = new Date(start); end.setDate(end.getDate() + 14);
      const prewindow = new Date(start); prewindow.setDate(prewindow.getDate() - 7);
      return today >= prewindow && today <= end;
    },
    timingLabel: (today) => {
      const start = nthWeekday(today.getFullYear(), 8, 1, 3);
      const end = new Date(start); end.setDate(end.getDate() + 14);
      if (today >= start && today <= end) return "HAPPENING NOW";
      return countdown(today, start);
    },
  },
  {
    id: "haunted-happenings",
    title: "Salem Haunted Happenings",
    description: "October in Salem. Yes, everyone knows about it. Yes, you should still go. Take the commuter rail, skip the parking, stay past sundown.",
    relatedNeighborhood: "north-end",
    emoji: "🎃",
    isActive: (today) => today.getMonth() + 1 === 10,
    timingLabel: (today) => {
      const d = today.getDate();
      if (d >= 25) return "FINAL DAYS";
      if (d >= 15) return "PEAK SEASON — GO NOW";
      return "ALL OCTOBER";
    },
  },
  {
    id: "boston-book-festival",
    title: "Boston Book Festival",
    description: "Copley Square fills up with readers, authors, and people who meant to read more this year. Free, outdoors, and genuinely good. One day in October.",
    relatedNeighborhood: "back-bay",
    emoji: "📚",
    isActive: (today) => {
      // Usually last Saturday of October
      const sat = lastWeekday(today.getFullYear(), 10, 6);
      const prewindow = new Date(sat); prewindow.setDate(prewindow.getDate() - 7);
      return today >= prewindow && today <= sat;
    },
    timingLabel: (today) => {
      const sat = lastWeekday(today.getFullYear(), 10, 6);
      if (today.toDateString() === sat.toDateString()) return "TODAY";
      return countdown(today, sat);
    },
  },

  // ── WINTER ──────────────────────────────────────────────────────────────────
  {
    id: "winter-market",
    title: "Snowport Winter Market",
    description: "The Seaport gets string lights and a Christmas tree. Local makers, warm drinks, ice skating. Surprisingly not terrible.",
    relatedNeighborhood: "seaport",
    emoji: "🎄",
    isActive: (today) => today.getMonth() + 1 === 11 || today.getMonth() + 1 === 12,
    timingLabel: (today) => {
      if (today.getMonth() + 1 === 11) return "STARTS THIS MONTH";
      return "HAPPENING NOW";
    },
  },
  {
    id: "first-night",
    title: "First Night Boston",
    description: "New Year's Eve on the Esplanade. Ice sculptures, live music all over the city, fireworks at midnight over the harbor. Dress for it.",
    relatedNeighborhood: "back-bay",
    emoji: "🎇",
    isActive: (today) => {
      const d = daysUntil(today, 12, 31);
      return d >= 0 && d <= 14;
    },
    timingLabel: (today) => {
      const d = daysUntil(today, 12, 31);
      if (d === 0) return "TONIGHT — FIRST NIGHT";
      if (d === 1) return "TOMORROW NIGHT";
      return `IN ${d} DAYS`;
    },
  },
  {
    id: "boskone",
    title: "Boskone Sci-Fi Convention",
    description: "February in the Seaport. The oldest sci-fi convention in New England. Three days of panels, art, and people who have strong opinions about Ursula Le Guin.",
    relatedNeighborhood: "seaport",
    emoji: "🚀",
    isActive: (today) => {
      // Presidents Day weekend, typically 3rd Friday of February
      const fri = nthWeekday(today.getFullYear(), 2, 5, 3);
      const prewindow = new Date(fri); prewindow.setDate(fri.getDate() - 7);
      const end = new Date(fri); end.setDate(fri.getDate() + 3);
      return today >= prewindow && today <= end;
    },
    timingLabel: (today) => {
      const fri = nthWeekday(today.getFullYear(), 2, 5, 3);
      const end = new Date(fri); end.setDate(fri.getDate() + 3);
      if (today >= fri && today <= end) return "HAPPENING NOW";
      return countdown(today, fri);
    },
  },
  {
    id: "chinese-new-year",
    title: "Chinatown New Year Parade",
    description: "Dragon dances down Beach Street. Firecrackers, lion dancers, dumplings everywhere. The best February thing Boston does. Show up for the parade, stay for the food.",
    relatedNeighborhood: "downtown",
    emoji: "🐉",
    isActive: (today) => {
      // Approximate: late Jan / early Feb — show for all of February
      return today.getMonth() + 1 === 1 || today.getMonth() + 1 === 2;
    },
    timingLabel: (today) => {
      const m = today.getMonth() + 1;
      if (m === 1) return "COMING UP IN FEBRUARY";
      return "THIS MONTH";
    },
  },
  {
    id: "world-cup-2026",
    title: "FIFA World Cup 2026 — Boston Host City",
    description: "Gillette Stadium — renamed Boston Stadium for the tournament — hosts seven matches from June 13 through a quarterfinal on July 9. England, France, Scotland, Norway, Morocco, Ghana, and Haiti all play here. The biggest sporting event on the planet is coming to Greater Boston.",
    relatedNeighborhood: "south-shore-cape",
    emoji: "⚽",
    isActive: (today) => {
      const start = new Date(2026, 0, 1);
      const end = new Date(2026, 6, 31);
      return today >= start && today <= end;
    },
    timingLabel: (today) => {
      const firstMatch = new Date(2026, 5, 13);
      const lastMatch = new Date(2026, 6, 9);
      const d = Math.round((firstMatch.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (today >= firstMatch && today <= lastMatch) return "HAPPENING NOW";
      if (d <= 0) return "MATCHES COMPLETE";
      if (d <= 30) return `FIRST MATCH IN ${d} DAYS`;
      if (d <= 60) return "COMING THIS SUMMER";
      return "SUMMER 2026";
    },
  },
];

// ─── Resolve happenings for today ─────────────────────────────────────────────

function getActiveHappenings(today: Date): (Happening & { computed: true })[] {
  return HAPPENING_DEFS
    .filter((h) => h.isActive(today))
    .map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      relatedNeighborhood: h.relatedNeighborhood,
      emoji: h.emoji,
      timing: h.timingLabel(today),
      computed: true as const,
    }));
}

// ─── Components ───────────────────────────────────────────────────────────────

type Props = {
  onNavigateToNeighborhood?: (neighborhoodId: string) => void;
  onOpenWorldCup?: () => void;
  communityHappenings?: CommunityHappening[];
  monthlyHappenings?: MonthlyHappening[];
  onOpenMonthlyHappening?: (h: MonthlyHappening) => void;
};

function MonthlyCard({
  happening,
  onOpen,
}: {
  happening: MonthlyHappening;
  onOpen: (h: MonthlyHappening) => void;
}) {
  return (
    <button
      onClick={() => onOpen(happening)}
      className="text-left w-full rounded-sm happening-card bg-gradient-to-br from-boston-gray-50 to-white border border-boston-gray-100 transition-colors hover:bg-boston-gray-50 cursor-pointer"
    >
      <p className="uppercase mb-2 happening-timing t-sans-blue">
        {happening.emoji} This month
      </p>
      <h3 className="font-bold leading-tight mb-2 t-sans-navy happening-title">
        {happening.title}
      </h3>
      <p className="italic leading-relaxed mb-3 t-serif-body happening-desc">
        {happening.summary}
      </p>
      <span className="transition-opacity duration-150 hover:opacity-70 t-sans-blue happening-link">
        Read more →
      </span>
    </button>
  );
}

function CuratedCard({
  happening,
  onNavigateToNeighborhood,
  onOpenWorldCup,
}: {
  happening: Happening;
  onNavigateToNeighborhood?: (id: string) => void;
  onOpenWorldCup?: () => void;
}) {
  const isWorldCup = happening.id === "world-cup-2026";

  return (
    <div className={`rounded-sm happening-card ${isWorldCup ? "border-2 border-boston-blue bg-gradient-to-br from-boston-gray-50 to-blue-50" : "bg-boston-gray-50"}`}>
      <p className={`uppercase mb-2 happening-timing ${isWorldCup ? "t-sans text-boston-blue font-black" : "t-sans-blue"}`}>
        {happening.emoji} {happening.timing}
      </p>
      <h3 className="font-bold leading-tight mb-2 t-sans-navy happening-title">
        {happening.title}
      </h3>
      <p className="italic leading-relaxed mb-3 t-serif-body happening-desc">
        {happening.description}
      </p>
      {isWorldCup && onOpenWorldCup ? (
        <button
          onClick={onOpenWorldCup}
          className="text-left transition-opacity duration-150 hover:opacity-70 t-sans-blue happening-link"
        >
          ⚽ Full World Cup Guide →
        </button>
      ) : onNavigateToNeighborhood ? (
        <button
          onClick={() => onNavigateToNeighborhood(happening.relatedNeighborhood)}
          className="text-left transition-opacity duration-150 hover:opacity-70 t-sans-blue happening-link"
        >
          📍 See spots in this neighborhood →
        </button>
      ) : null}
    </div>
  );
}

function CommunityCard({ happening }: { happening: CommunityHappening }) {
  return (
    <div className="rounded-sm bg-white community-card">
      {/* Community badge + timing */}
      <div className="flex items-center justify-between mb-2">
        <p className="uppercase t-sans-blue happening-timing">
          {happening.emoji} {happening.dateLabel}
        </p>
        <span className="text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm t-sans-blue region-badge">
          Community
        </span>
      </div>

      <h3 className="font-bold leading-tight mb-2 t-sans-navy happening-title">
        {happening.title}
      </h3>
      <p className="italic leading-relaxed mb-3 t-serif-body happening-desc">
        {happening.description}
      </p>

      {/* Link */}
      {happening.url && (
        <ExternalLink
          href={happening.url}
          className="inline-flex items-center gap-1 mb-3 transition-opacity duration-150 hover:opacity-70 t-sans-blue happening-ext-link"
        >
          <ExternalLinkIcon size={11} strokeWidth={2.5} aria-hidden="true" />
          More info →
        </ExternalLink>
      )}

      {/* Submitted by */}
      <div className="flex items-center gap-2">
        {happening.submittedByPfpUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={happening.submittedByPfpUrl} alt={happening.submittedByDisplayName}
            loading="lazy"
            className="w-5 h-5 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-boston-blue">
            {happening.submittedByDisplayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span className="text-xs t-sans-gray">
          📍 {happening.neighborhood} · <span className="text-boston-blue">@{happening.submittedByUsername}</span>
        </span>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const CATEGORY_EMOJI: Record<string, string> = {
    city: "🏛️",
    arts: "🎭",
    music: "🎵",
    community: "🤝",
    tech: "💻",
  };

  function eventTimeAgo(dateStr: string): string {
    if (!dateStr) return "";
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      if (isNaN(diff)) return "";
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return "just now";
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch { return ""; }
  }

  return (
    <ExternalLink
      href={event.url}
      className="block rounded-sm bg-white p-3 no-underline text-inherit border border-boston-gray-100 transition-colors hover:bg-boston-gray-50"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-widest t-sans-blue">
          {CATEGORY_EMOJI[event.category] ?? "📅"} {event.source}
        </span>
        {eventTimeAgo(event.date) && (
          <span className="text-xs t-sans-gray">{eventTimeAgo(event.date)}</span>
        )}
      </div>
      <p className="text-xs font-bold leading-tight t-sans-navy mb-1">{event.title}</p>
      {event.description && (
        <p className="text-xs leading-relaxed t-serif-gray line-clamp-2">{event.description}</p>
      )}
    </ExternalLink>
  );
}

export function HappeningsSection({ onNavigateToNeighborhood, onOpenWorldCup, communityHappenings = [], monthlyHappenings = [], onOpenMonthlyHappening }: Props) {
  // Stable date — doesn't need to update mid-session, and avoids recalculating
  // all the happening date windows on every parent re-render.
  const today = useMemo(() => new Date(), []);
  const curated = useMemo(() => getActiveHappenings(today), [today]);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("All");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { items: EventItem[] }) => {
        setEvents(data.items ?? []);
        setEventsLoading(false);
      })
      .catch(() => setEventsLoading(false));
  }, []);

  const SOURCE_FILTERS = [
    { id: "All", label: "All" },
    { id: "city", label: "City Events" },
    { id: "arts", label: "Arts" },
    { id: "music", label: "Music" },
    { id: "community", label: "Community" },
  ];

  const EXPLORE_MORE = [
    { name: "Do617", url: "https://do617.com" },
    { name: "Luma Boston", url: "https://lu.ma/boston" },
    { name: "Mass AI Coalition", url: "https://www.massai.org" },
    { name: "MassTech", url: "https://masstech.org" },
    { name: "City of Boston", url: "https://www.boston.gov/events" },
  ];

  const filteredEvents = sourceFilter === "All"
    ? events
    : sourceFilter === "community"
      ? [] // community filter shows only community submissions, not RSS events
      : events.filter((e) => e.category === sourceFilter);

  // Community submissions are shown when filter is "All" or "community"
  const showCommunity = sourceFilter === "All" || sourceFilter === "community";
  // Curated editorial cards show only on "All"
  const showCurated = sourceFilter === "All";

  if (curated.length === 0 && communityHappenings.length === 0 && events.length === 0 && monthlyHappenings.length === 0) return null;

  return (
    <div className="px-4 mt-6">
      <div className="today-section-header">
        <h2 className="today-section-title">Happening in Boston</h2>
        <span className="today-section-eyebrow">
          {communityHappenings.length > 0 ? `${communityHappenings.length} from community` : "Curated"}
        </span>
      </div>

      {/* Source filter pills */}
      {events.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-hide">
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer border-none transition-colors ${
                sourceFilter === f.id
                  ? "bg-boston-blue text-white"
                  : "bg-boston-gray-100 t-sans-gray"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* AI-generated monthly happenings — top of the editorial stack */}
        {showCurated && onOpenMonthlyHappening && monthlyHappenings.map((h) => (
          <MonthlyCard key={h.id} happening={h} onOpen={onOpenMonthlyHappening} />
        ))}
        {/* Community submissions — most timely */}
        {showCommunity && communityHappenings.map((h) => (
          <CommunityCard key={h.id} happening={h} />
        ))}
        {/* Curated editorial cards */}
        {showCurated && curated.map((h) => (
          <CuratedCard key={h.id} happening={h} onNavigateToNeighborhood={onNavigateToNeighborhood} onOpenWorldCup={onOpenWorldCup} />
        ))}

        {/* RSS event feed items */}
        {eventsLoading && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-sm bg-boston-gray-100 animate-pulse" />
            ))}
          </div>
        )}
        {filteredEvents.slice(0, 8).map((evt, i) => (
          <EventCard key={`${evt.source}-${i}`} event={evt} />
        ))}
      </div>

      {/* Explore More */}
      <div className="mt-4 pt-3 border-t border-boston-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest t-sans-gray mb-2">
            Explore More Events
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPLORE_MORE.map((link) => (
              <ExternalLink
                key={link.name}
                href={link.url}
                className="px-3 py-1.5 rounded-full bg-boston-gray-50 text-xs font-bold t-sans-blue no-underline hover:bg-boston-gray-100 transition-colors"
              >
                {link.name} ↗
              </ExternalLink>
            ))}
          </div>
        </div>
    </div>
  );
}
