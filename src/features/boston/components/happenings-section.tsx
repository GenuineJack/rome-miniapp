"use client";

import { useMemo } from "react";
import { Happening, CommunityHappening } from "@/features/boston/types";

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
    description: "Boston is hosting World Cup matches at Gillette Stadium in Foxborough. Five group stage matches and a Round of 16 game, June through July 2026. One of 16 North American host cities. The biggest sporting event on the planet is coming to Greater Boston.",
    relatedNeighborhood: "south-shore-cape",
    emoji: "⚽",
    isActive: (today) => {
      const start = new Date(2026, 0, 1);
      const end = new Date(2026, 6, 31);
      return today >= start && today <= end;
    },
    timingLabel: (today) => {
      const firstMatch = new Date(2026, 5, 15);
      const d = Math.round((firstMatch.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (d <= 0) return "HAPPENING NOW";
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
  communityHappenings?: CommunityHappening[];
};

function CuratedCard({
  happening,
  onNavigateToNeighborhood,
}: {
  happening: Happening;
  onNavigateToNeighborhood?: (id: string) => void;
}) {
  return (
    <div className="rounded-sm" style={{ background: "#f3f3f3", padding: "20px", border: "1px solid #e0e0e0" }}>
      <p className="uppercase mb-2" style={{
        fontFamily: "var(--font-sans)",
        fontSize: "9px", fontWeight: "700", letterSpacing: "0.15em", color: "#1871bd", lineHeight: 1,
      }}>
        {happening.emoji} {happening.timing}
      </p>
      <h3 className="font-bold leading-tight mb-2"
        style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "#091f2f" }}>
        {happening.title}
      </h3>
      <p className="italic leading-relaxed mb-3"
        style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "#58585b", lineHeight: "1.6" }}>
        {happening.description}
      </p>
      {onNavigateToNeighborhood && (
        <button
          onClick={() => onNavigateToNeighborhood(happening.relatedNeighborhood)}
          className="text-left transition-opacity duration-150 hover:opacity-70"
          style={{
            fontFamily: "var(--font-sans)", fontSize: "10px", color: "#1871bd",
            fontWeight: "600", letterSpacing: "0.05em", background: "none", border: "none", padding: 0, cursor: "pointer",
          }}
        >
          📍 See spots in this neighborhood →
        </button>
      )}
    </div>
  );
}

function CommunityCard({ happening }: { happening: CommunityHappening }) {
  return (
    <div className="rounded-sm" style={{ background: "#fff", padding: "20px", border: "2px solid #e0e0e0" }}>
      {/* Community badge + timing */}
      <div className="flex items-center justify-between mb-2">
        <p className="uppercase" style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9px", fontWeight: "700", letterSpacing: "0.15em", color: "#1871bd", lineHeight: 1,
        }}>
          {happening.emoji} {happening.dateLabel}
        </p>
        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
          style={{ fontFamily: "var(--font-sans)", background: "rgba(24,113,189,0.1)", color: "#1871bd" }}>
          Community
        </span>
      </div>

      <h3 className="font-bold leading-tight mb-2"
        style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "#091f2f" }}>
        {happening.title}
      </h3>
      <p className="italic leading-relaxed mb-3"
        style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "#58585b", lineHeight: "1.6" }}>
        {happening.description}
      </p>

      {/* Link */}
      {happening.url && (
        <a
          href={happening.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mb-3 transition-opacity duration-150 hover:opacity-70"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: "600",
            color: "#1871bd",
            letterSpacing: "0.05em",
            textDecoration: "none",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          More info →
        </a>
      )}

      {/* Submitted by */}
      <div className="flex items-center gap-2">
        {happening.submittedByPfpUrl ? (
          <img src={happening.submittedByPfpUrl} alt={happening.submittedByDisplayName}
            loading="lazy"
            className="w-5 h-5 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ background: "#1871bd" }}>
            {happening.submittedByDisplayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span className="text-[10px]" style={{ fontFamily: "var(--font-sans)", color: "#828282" }}>
          📍 {happening.neighborhood} · <span style={{ color: "#1871bd" }}>@{happening.submittedByUsername}</span>
        </span>
      </div>
    </div>
  );
}

export function HappeningsSection({ onNavigateToNeighborhood, communityHappenings = [] }: Props) {
  // Stable date — doesn't need to update mid-session, and avoids recalculating
  // all the happening date windows on every parent re-render.
  const today = useMemo(() => new Date(), []);
  const curated = useMemo(() => getActiveHappenings(today), [today]);

  if (curated.length === 0 && communityHappenings.length === 0) return null;

  return (
    <div className="px-4" style={{ marginTop: "24px" }}>
      <div
        className="flex items-end justify-between pb-2"
        style={{ borderBottom: "5px solid #091f2f", marginBottom: "12px" }}
      >
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: "700",
          textTransform: "uppercase", letterSpacing: "0.15em", color: "#091f2f",
        }}>
          Happening in Boston
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "#828282" }}>
          {communityHappenings.length > 0 ? `${communityHappenings.length} from community` : "Curated"}
        </span>
      </div>

      <div className="flex flex-col" style={{ gap: "12px" }}>
        {/* Community submissions first — most timely */}
        {communityHappenings.map((h) => (
          <CommunityCard key={h.id} happening={h} />
        ))}
        {/* Curated editorial cards */}
        {curated.map((h) => (
          <CuratedCard key={h.id} happening={h} onNavigateToNeighborhood={onNavigateToNeighborhood} />
        ))}
      </div>
    </div>
  );
}
