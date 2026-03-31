"use client";

import { BostonGame } from "@/features/boston/types";

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
  bostonTeamId: string
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

  // Only today + tomorrow — 2 dates × N active leagues
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
      className="inline-block rounded-full animate-pulse shrink-0 bg-boston-red"
      style={{
        width: "6px",
        height: "6px",
        marginRight: "4px",
        verticalAlign: "middle",
      }}
    />
  );
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function GameCard({ game }: { game: BostonGame }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const isToday = game.date === getLocalDateStr(new Date());

  return (
    <div
      className="shrink-0 flex flex-col justify-between p-3 bg-white"
      style={{
        width: "160px",
        border: `2px solid ${isLive ? "#1871bd" : "#e0e0e0"}`,
        borderRadius: "3px",
      }}
    >
      <div>
        <p
          className="font-bold uppercase leading-tight t-sans-navy"
          style={{
            fontSize: "11px",
            marginBottom: "2px",
          }}
        >
          {game.emoji} {game.team}
        </p>
        <p
          className="italic leading-snug t-serif-body"
          style={{
            fontSize: "13px",
            marginBottom: "8px",
          }}
        >
          vs {game.opponent.split(" ").slice(-1)[0]}
        </p>
      </div>
      <div>
        <p
          className="uppercase leading-tight t-sans"
          style={{
            fontSize: "9px",
            color: isLive ? "#d22d23" : "#828282",
            fontWeight: "600",
            letterSpacing: "0.08em",
          }}
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
          className="uppercase leading-tight mt-0.5 t-sans-gray"
          style={{
            fontSize: "9px",
            letterSpacing: "0.05em",
          }}
        >
          {game.venue.split(",")[0]}
        </p>
      </div>
    </div>
  );
}

function SportsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="shrink-0 rounded animate-pulse bg-[#e0e0e0]"
          style={{ width: 160, height: 100 }}
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
};

export function SportsRow({ games, loading, fetchFailed }: SportsRowProps) {
  return (
    <div className="px-4" style={{ marginTop: "24px" }}>
      {/* Section header */}
      <div
        className="flex items-end justify-between pb-2"
        style={{ borderBottom: "5px solid #091f2f", marginBottom: "12px" }}
      >
        <span
          className="t-sans-navy"
          style={{
            fontSize: "10px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          Boston Sports
        </span>
        <span
          className="t-sans-gray"
          style={{
            fontSize: "9px",
          }}
        >
          Next 48 hrs
        </span>
      </div>

      {loading ? (
        <SportsSkeleton />
      ) : fetchFailed ? (
        <div
          className="flex items-center justify-center px-4 py-5 bg-white"
          style={{ border: "2px solid #e0e0e0", borderRadius: "3px" }}
        >
          <p
            className="italic text-center t-serif-gray"
            style={{ fontSize: "13px" }}
          >
            Scores unavailable. ESPN might be having a moment.
          </p>
        </div>
      ) : games.length === 0 ? (
        <div
          className="flex items-center justify-center px-4 py-5 bg-white"
          style={{ border: "2px solid #e0e0e0", borderRadius: "3px" }}
        >
          <p
            className="italic text-center t-serif-gray"
            style={{ fontSize: "13px" }}
          >
            No games in the next 48 hours. Rest up, Boston.
          </p>
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
