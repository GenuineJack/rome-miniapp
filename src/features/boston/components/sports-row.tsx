"use client";

import { BostonGame } from "@/features/boston/types";
import { NON_ESPN_TEAMS } from "./teams-config";

// ─── ESPN public API ──────────────────────────────────────────────────────────
// No API key required. Returns today's scoreboard for each sport/league.

type EspnTeamConfig = {
  team: BostonGame["team"];
  emoji: string;
  sport: string;
  league: string;
  espnTeamId: string;
};

const BOSTON_TEAMS: EspnTeamConfig[] = [
  { team: "Celtics",    emoji: "🏀", sport: "basketball", league: "nba",    espnTeamId: "2"   },
  { team: "Bruins",     emoji: "🏒", sport: "hockey",     league: "nhl",    espnTeamId: "1"   },
  { team: "Red Sox",    emoji: "⚾", sport: "baseball",   league: "mlb",    espnTeamId: "2"   },
  { team: "Patriots",   emoji: "🏈", sport: "football",   league: "nfl",    espnTeamId: "17"  },
  { team: "Revolution", emoji: "⚽", sport: "soccer",     league: "usa.1",  espnTeamId: "928" },
];

// Off-season months by league (0-indexed). Returns true if the league
// is likely active right now, so we skip fetching dead leagues.
function isLeagueActive(league: string): boolean {
  const month = new Date().getMonth(); // 0 = Jan … 11 = Dec
  switch (league) {
    case "nfl":    return month >= 8 || month <= 1;   // Sep–Feb
    case "mlb":    return month >= 3 && month <= 10;  // Apr–Nov (incl. playoffs)
    case "nba":    return month >= 9 || month <= 5;   // Oct–Jun
    case "nhl":    return month >= 9 || month <= 5;   // Oct–Jun
    case "usa.1":  return month >= 2 && month <= 10;  // Mar–Nov
    default:       return true;
  }
}

// Return only teams whose league is currently in season
function getActiveTeams(): EspnTeamConfig[] {
  return BOSTON_TEAMS.filter((t) => isLeagueActive(t.league));
}

export type SportsCache = {
  data: BostonGame[];
  timestamp: number;
  date: string;
} | null;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function espnDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function parseEspnStatus(event: Record<string, unknown>): BostonGame["status"] {
  const status = event.status as Record<string, unknown> | undefined;
  const type = (status?.type as Record<string, unknown> | undefined);
  const state = type?.state as string | undefined;
  if (state === "in") return "live";
  if (state === "post") return "final";
  return "upcoming";
}

function parseEspnScore(
  event: Record<string, unknown>,
  _bostonTeamId: string
): { home: number; away: number } | undefined {
  try {
    const competitions = event.competitions as Record<string, unknown>[] | undefined;
    const comp = competitions?.[0];
    const competitors = comp?.competitors as Record<string, unknown>[] | undefined;
    if (!competitors) return undefined;
    const home = competitors.find((c) => (c.homeAway as string) === "home");
    const away = competitors.find((c) => (c.homeAway as string) === "away");
    if (!home || !away) return undefined;
    return {
      home: parseInt(home.score as string) || 0,
      away: parseInt(away.score as string) || 0,
    };
  } catch {
    return undefined;
  }
}

// Fetch the full league scoreboard for a given date, then filter for Boston teams.
// One call per league per date instead of one call per team per date.
async function fetchLeagueGames(
  date: string,       // YYYYMMDD format for ESPN
  teams: EspnTeamConfig[]
): Promise<BostonGame[]> {
  // All teams in this batch share the same sport/league
  const { sport, league } = teams[0];
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${date}&limit=50`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const events = (json.events as Record<string, unknown>[]) ?? [];
    const games: BostonGame[] = [];

    for (const event of events) {
      const competitions = event.competitions as Record<string, unknown>[] | undefined;
      const comp = competitions?.[0];
      const competitors = comp?.competitors as Record<string, unknown>[] | undefined;
      if (!competitors) continue;

      // Find which Boston team is in this event (if any)
      const config = teams.find((t) =>
        competitors.some((c) => {
          const team = c.team as Record<string, unknown> | undefined;
          return (team?.id as string) === t.espnTeamId;
        })
      );
      if (!config) continue;

      const opponent = competitors.find((c) => {
        const team = c.team as Record<string, unknown> | undefined;
        return (team?.id as string) !== config.espnTeamId;
      });
      const opponentName =
        ((opponent?.team as Record<string, unknown> | undefined)?.displayName as string) ?? "TBD";

      const dateStr = event.date as string;
      const eventDate = new Date(dateStr);
      const localDate = getLocalDateStr(eventDate);
      const timeStr = eventDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      });
      const venue =
        ((comp?.venue as Record<string, unknown> | undefined)?.fullName as string) ?? "TBD";
      const status = parseEspnStatus(event);
      const score = status !== "upcoming" ? parseEspnScore(event, config.espnTeamId) : undefined;

      games.push({
        id: `${config.team.toLowerCase().replace(/\s+/g, "-")}-${localDate}`,
        team: config.team,
        emoji: config.emoji,
        opponent: opponentName,
        date: localDate,
        time: timeStr,
        venue,
        status,
        score,
      });
    }
    return games;
  } catch {
    return [];
  }
}

export async function fetchAllGames(): Promise<BostonGame[]> {
  const now = new Date();
  const activeTeams = getActiveTeams();

  if (activeTeams.length === 0) return [];

  // Group active teams by league — one fetch per league per date
  const byLeague = new Map<string, EspnTeamConfig[]>();
  for (const team of activeTeams) {
    const key = team.league;
    if (!byLeague.has(key)) byLeague.set(key, []);
    byLeague.get(key)!.push(team);
  }

  // Today only — also fetch tomorrow to catch late-night games (e.g. NBA
  // playoff games scheduled past midnight ET) and surface upcoming games
  // when today is dark. We filter to "today" downstream in the dispatch and
  // keep upcoming visible in the Today tab card.
  const dates = [0, 1].map((offset) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return espnDateParam(d);
  });

  const fetches: Promise<BostonGame[]>[] = [];
  for (const teams of byLeague.values()) {
    for (const date of dates) {
      fetches.push(fetchLeagueGames(date, teams));
    }
  }

  const results = await Promise.allSettled(fetches);
  const games: BostonGame[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      games.push(...result.value);
    }
  }

  // Deduplicate by id (same game can appear in both dates if near midnight)
  const seen = new Set<string>();
  const unique = games.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });

  return unique.sort((a, b) => {
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;
    return a.date.localeCompare(b.date);
  });
}

export function isSportsCacheFresh(cache: SportsCache): boolean {
  if (!cache) return false;
  if (cache.date !== getLocalDateStr(new Date())) return false;
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
}

// ─── Components ───────────────────────────────────────────────────────────────

function LiveDot() {
  return (
    <span
      className="inline-block rounded-full animate-pulse shrink-0 bg-boston-red live-dot"
    />
  );
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function GameCard({ game, onClick }: { game: BostonGame; onClick?: () => void }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const isToday = game.date === getLocalDateStr(new Date());

  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex flex-col justify-between p-3 bg-white game-card text-left cursor-pointer hover:bg-boston-gray-50 transition-colors ${isLive ? "game-card-live" : ""}`}
    >
      <div>
        <p
          className="font-bold uppercase leading-tight t-sans-navy game-team"
        >
          {game.emoji} {game.team}
        </p>
        <p
          className="italic leading-snug t-serif-body game-opponent"
        >
          vs {game.opponent.split(" ").slice(-1)[0]}
        </p>
      </div>
      <div>
        <p
          className={`uppercase leading-tight t-sans game-status ${isLive ? "text-boston-red" : "text-boston-gray-400"}`}
        >
          {isLive ? (
            <>
              <LiveDot />
              LIVE{game.score ? ` · ${game.score.home}–${game.score.away}` : ""}
            </>
          ) : isFinal ? (
            <>FINAL{game.score ? ` · ${game.score.home}–${game.score.away}` : ""}</>
          ) : (
            <>{isToday ? "Tonight" : formatShortDate(game.date)} · {game.time}</>
          )}
        </p>
        <p
          className="uppercase leading-tight mt-0.5 t-sans-gray game-venue"
        >
          {game.venue.split(",")[0]}
        </p>
      </div>
    </button>
  );
}

function SportsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="shrink-0 rounded animate-pulse bg-[#e0e0e0] sports-skeleton-card"
        />
      ))}
    </div>
  );
}

// ─── SportsRow — pure display, all state from props ───────────────────────────

type SportsRowProps = {
  games: BostonGame[];
  loading: boolean;
  fetchFailed: boolean;
  onTeamClick?: (teamName: string) => void;
};

export function SportsRow({ games, loading, fetchFailed, onTeamClick }: SportsRowProps) {
  // Today's local date string for filtering — UAT feedback: Today tab should
  // surface games happening *today*, not the next 48h.
  const todayStr = getLocalDateStr(new Date());
  const todayGames = games.filter((g) => g.date === todayStr);

  // Build a set of teams that have games in the data
  const teamsWithGames = new Set(todayGames.map((g) => g.team));

  // All ESPN teams should always be visible
  const allEspnTeams: { team: string; emoji: string }[] = [
    { team: "Celtics", emoji: "🏀" },
    { team: "Bruins", emoji: "🏒" },
    { team: "Red Sox", emoji: "⚾" },
    { team: "Patriots", emoji: "🏈" },
    { team: "Revolution", emoji: "⚽" },
  ];

  return (
    <div className="px-4 mt-6">
      {/* Section header */}
      <div className="today-section-header">
        <h2 className="today-section-title">Boston Sports</h2>
        <span className="today-section-eyebrow">Today</span>
      </div>

      {loading ? (
        <SportsSkeleton />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {/* ESPN teams — always show all, with game data when available */}
          {allEspnTeams.map(({ team, emoji }) => {
            const teamGames = todayGames.filter((g) => g.team === team);
            if (teamGames.length > 0) {
              return teamGames.map((game) => (
                <GameCard key={game.id} game={game} onClick={() => onTeamClick?.(game.team)} />
              ));
            }
            // No game in next 48h — show placeholder card
            const inSeason = isLeagueActive(
              BOSTON_TEAMS.find((t) => t.team === team)?.league ?? ""
            );
            return (
              <button
                key={team}
                onClick={() => onTeamClick?.(team)}
                className="shrink-0 flex flex-col justify-between p-3 bg-white game-card text-left cursor-pointer hover:bg-boston-gray-50 transition-colors"
              >
                <div>
                  <p className="font-bold uppercase leading-tight t-sans-navy game-team">
                    {emoji} {team}
                  </p>
                </div>
                <p className="uppercase leading-tight t-sans text-boston-gray-400 game-status">
                  {inSeason ? "No game scheduled" : "Off-season"}
                </p>
              </button>
            );
          })}

          {/* Non-ESPN teams — always show, click opens TeamDetailSheet */}
          {NON_ESPN_TEAMS.map((team) => {
            const inSeason = team.activeMonths.includes(new Date().getMonth());
            return (
              <button
                key={team.name}
                onClick={() => onTeamClick?.(team.name)}
                className="shrink-0 flex flex-col justify-between p-3 bg-white game-card text-left cursor-pointer hover:bg-boston-gray-50 transition-colors border-none"
              >
                <div>
                  <p className="font-bold uppercase leading-tight t-sans-navy game-team">
                    {team.emoji} {team.name}
                  </p>
                  <p className="italic leading-snug t-serif-body game-opponent">
                    {team.sport}
                  </p>
                </div>
                <p className="uppercase leading-tight t-sans text-boston-gray-400 game-status">
                  {inSeason ? "View team →" : "Off-season"}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
