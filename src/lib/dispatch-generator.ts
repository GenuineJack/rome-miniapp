import { getDispatchForDate, saveDispatch, deleteDispatchForDate } from "@/db/actions/dispatch-actions";
import { getRecentSpots, getCommunityHappenings } from "@/db/actions/boston-actions";
import { fetchMarketData, isWeekend, type MarketSnapshot } from "@/lib/markets";

// ─── Dispatch Content Type (for reference in the prompt) ─────────────────────

const DISPATCH_TYPE_REFERENCE = `
type DispatchContent = {
  date: string;                        // "Sunday, April 26, 2026"

  greeting: string;                    // 2-3 sentences. Dry, specific, Boston-native.
                                       // References something real happening today.

  oneBigThing: {
    headline: string;                  // One declarative sentence
    whatIsHappening: string;           // 2-3 sentences of context
    whyItMatters: string;              // 1-2 sentences
    whatItMeansForYou: string;         // 1-2 sentences, direct second-person
    url: string;                       // Source link
  };

  todayInBoston: {
    sports: {
      team: string;
      result: string;                  // "Won 4–2" or "Lost 99–114" or "Tonight at 7pm vs. Toronto"
      summary: string;                 // 1 sentence
      url?: string;
    }[] | null;                        // null if nothing relevant
    events: {
      title: string;
      detail: string;
      url?: string;
    }[];                               // 2-4 items worth knowing about today
    headsUp: string | null;            // One sentence. MBTA disruptions, road closures,
                                       // weather advisories. null if nothing worth flagging.
  };

  markets: {
    nasdaq: string;                    // e.g. "17,204 ▲ 0.4%"
    dow: string;
    sp500: string;
    btc: string;
    eth: string;
    sol: string;
    localSpotlight: {
      ticker: string;                  // e.g. "BKNG" or "ACVA"
      company: string;                 // Full company name
      price: string;                   // e.g. "$142.30 ▼ 1.2%"
      note: string;                    // One sentence on why it's notable today
    } | null;                          // null on days with no local story
  } | null;                            // null on weekends/holidays

  localBusinessNews: {
    headline: string;
    summary: string;                   // Max 2 sentences
    url: string;
  }[];                                 // Always exactly 3 items

  dailyPoll: {
    question: string;                  // One question about today's city happenings
    options: string[];                 // 2-4 options
  };

  dailyTrivia: {
    question: string;                  // Boston trivia question
    hint?: string;                     // Optional short hint
    answer: string;                    // Revealed at bottom of Dispatch
    funFact: string;                   // 1 sentence of extra context after reveal
  };

  placeOfTheDay: {
    name: string;
    neighborhood: string;
    reason: string;                    // Editorial reason why today specifically
    spotId?: string;                   // DB id if this place exists in the map
  };

  numberofTheDay: {
    number: string;                    // The figure itself: "47,000" or "Day 12"
    context: string;                   // One sentence of context
  };

  signOff: string;                     // 1-2 sentences. Closes the tonal loop opened
                                       // by the greeting. Must not be generic.
};`;

const BOSTON_PUBLIC_COMPANIES_SEED = `Wayfair (W), DraftKings (DKNG), Toast (TOST), Klaviyo (KVYO),
Iron Mountain (IRM), Liberty Mutual (private), Vertex Pharmaceuticals (VRTX),
Biogen (BIIB), TripAdvisor (TRIP), Rapid7 (RPD), EzShield (private),
Acquia (private), Brightcove (BCOV), Quanterix (QTRX), GreenLight Biosciences (GRNA)`;

const DISPATCH_SYSTEM_PROMPT = `You are the editor of The Dispatch, Boston's daily city briefing.
You write with dry Boston wit — specific, never tourist-guide,
never corporate civic. You are a builder-native Bostonian who
respects the reader's time.

Your output is always a single valid JSON object matching the
DispatchContent type. No markdown. No preamble. No explanation.
Just the JSON.

VOICE RULES:
- The greeting sets the tone for the day. Make it specific to today.
  Never generic ("It's a great day in Boston!").
  Reference something actually happening.
- The sign-off closes the tonal loop opened by the greeting.
  If the greeting is dry, the sign-off is drier.
  Never "See you tomorrow!" or "Stay warm out there."
- Second-person ("you", "your") is appropriate in
  oneBigThing.whatItMeansForYou. Avoid it everywhere else.
- Headlines are declarative statements, not clickbait questions.

STRUCTURAL RULES:
- localBusinessNews must always have exactly 3 items.
- markets is null on weekends and market holidays.
- localSpotlight within markets should only appear when there is a
  genuine news reason for a Boston-headquartered company today.
  If there isn't one, set localSpotlight to null.
- todayInBoston.headsUp is null unless something genuinely affects
  commutes or plans. Do not fabricate alerts.
- dailyTrivia.answer must appear verbatim in the JSON — it is revealed
  at the bottom of the Dispatch UI as a retention mechanic.
  Do not be coy about it in the question.
- placeOfTheDay.reason must be specific to today, not evergreen
  ("great for a spring Sunday morning" beats "a great neighborhood spot").
- signOff must be 1-2 sentences. Never use filler closings.

CONTEXT YOU WILL RECEIVE:
- Today's date and day of week
- Current Boston weather
- MBTA active alerts
- Last night's Boston sports scores
- Market data (pre-fetched — use as-is, do not invent figures)
- Recent community submissions and events from the DB
- Recent spots added to the map

Only reference information you can verify from the provided context
or from your training data. Do not invent news stories, scores,
or market figures.

LOCAL SPOTLIGHT GUIDANCE:
When choosing a Boston-headquartered public company for
markets.localSpotlight, reason from this seed list as a starting
point but do not feel limited to it. Choose based on news
relevance for today, not rotation:

${BOSTON_PUBLIC_COMPANIES_SEED}

${DISPATCH_TYPE_REFERENCE}`;

// ─── Context Gathering ───────────────────────────────────────────────────────

async function fetchWeatherContext() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.3601&longitude=-71.0589&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FNew_York",
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return {
      temp: Math.round(json.current.temperature_2m),
      code: json.current.weather_code,
      high: Math.round(json.daily.temperature_2m_max[0]),
      low: Math.round(json.daily.temperature_2m_min[0]),
    };
  } catch {
    return null;
  }
}

async function fetchMbtaAlerts() {
  try {
    const apiKey = process.env.MBTA_API_KEY;
    const baseUrl = "https://api-v3.mbta.com/alerts?filter[activity]=BOARD,EXIT&filter[route_type]=0,1,2&filter[lifecycle]=NEW,ONGOING";
    const url = apiKey ? `${baseUrl}&api_key=${apiKey}` : baseUrl;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).slice(0, 5).map((a: { attributes?: { header?: string } }) => ({
      header: a.attributes?.header ?? "",
    }));
  } catch {
    return [];
  }
}

async function fetchNewsHeadlines() {
  try {
    const feeds = [
      { url: "https://www.universalhub.com/rss.xml", source: "Universal Hub" },
      { url: "https://www.wbur.org/rss/news", source: "WBUR" },
      { url: "https://www.bostonherald.com/feed/", source: "Boston Herald" },
      { url: "https://feeds.bizjournals.com/bizj_boston", source: "Boston Business Journal" },
      { url: "https://www.wgbh.org/rss/news", source: "GBH News" },
      { url: "https://www.bostonmagazine.com/feed/", source: "Boston Magazine" },
    ];
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Boston Miniapp/1.0" },
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const items: { title: string; url: string; source: string; description: string }[] = [];
        const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
        for (const match of matches) {
          const titleMatch = match[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*)<\/title>/);
          const linkMatch = match[1].match(/<link>([^<]*)<\/link>/);
          const descMatch = match[1].match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([^<]*)<\/description>/);
          const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? "").trim();
          const url = (linkMatch?.[1] ?? "").trim();
          const rawDesc = (descMatch?.[1] ?? descMatch?.[2] ?? "").trim();
          const description = rawDesc.replace(/<[^>]+>/g, "").trim().slice(0, 200);
          if (title && url) items.push({ title, url, source: feed.source, description });
          if (items.length >= 5) break;
        }
        return items;
      }),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<{ title: string; url: string; source: string; description: string }[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .slice(0, 15);
  } catch {
    return [];
  }
}

// ─── Boston Sports Scores (ESPN) ─────────────────────────────────────────────

type SportsResult = {
  team: string;
  opponent: string;
  score: string;
  won: boolean;
  headline: string;
  url: string;
};

const BOSTON_TEAMS: Record<string, { abbr: string[]; name: string }> = {
  "baseball/mlb": { abbr: ["BOS"], name: "Red Sox" },
  "basketball/nba": { abbr: ["BOS"], name: "Celtics" },
  "hockey/nhl": { abbr: ["BOS"], name: "Bruins" },
  "football/nfl": { abbr: ["NE"], name: "Patriots" },
};

async function fetchBostonSportsScores(): Promise<SportsResult[]> {
  try {
    // Yesterday's date in YYYYMMDD format (EST)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dateStr = yesterday.toLocaleDateString("en-CA", { timeZone: "America/New_York" }).replace(/-/g, "");

    const leagues = Object.keys(BOSTON_TEAMS);
    const results = await Promise.allSettled(
      leagues.map(async (league) => {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${league}/scoreboard?dates=${dateStr}`,
          { signal: AbortSignal.timeout(6000) },
        );
        if (!res.ok) return [];
        const json = await res.json();
        const games: SportsResult[] = [];
        const teamInfo = BOSTON_TEAMS[league];

        for (const event of json.events ?? []) {
          const competition = event.competitions?.[0];
          if (!competition) continue;

          const competitors = competition.competitors ?? [];
          const bostonTeam = competitors.find(
            (c: { team?: { abbreviation?: string } }) =>
              teamInfo.abbr.includes(c.team?.abbreviation ?? ""),
          );
          if (!bostonTeam) continue;

          const otherTeam = competitors.find(
            (c: { team?: { abbreviation?: string } }) =>
              !teamInfo.abbr.includes(c.team?.abbreviation ?? ""),
          );
          if (!otherTeam) continue;

          const bostonScore = parseInt(bostonTeam.score ?? "0", 10);
          const otherScore = parseInt(otherTeam.score ?? "0", 10);
          const won = bostonTeam.winner === true;

          const headline =
            competition.headlines?.[0]?.shortLinkText ??
            event.name ??
            "";

          const recapUrl =
            event.links?.find((l: { text?: string }) => l.text === "Recap")?.href ??
            event.links?.find((l: { text?: string }) => l.text === "Gamecast")?.href ??
            event.links?.[0]?.href ??
            `https://www.espn.com/${league.split("/")[1]}`;

          games.push({
            team: teamInfo.name,
            opponent: otherTeam.team?.displayName ?? otherTeam.team?.name ?? "Unknown",
            score: `${bostonScore}-${otherScore}`,
            won,
            headline,
            url: recapUrl,
          });
        }
        return games;
      }),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<SportsResult[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);
  } catch {
    return [];
  }
}

// ─── Events Data ─────────────────────────────────────────────────────────────

type EventResult = {
  title: string;
  description: string;
  url: string;
  category: string;
};

async function fetchTodayEvents(): Promise<EventResult[]> {
  try {
    const feeds = [
      { url: "https://www.boston.gov/news.rss", source: "Boston.gov", category: "city" },
      { url: "https://bostonarts.org/feed/", source: "BCA", category: "arts" },
      { url: "https://thesoundofboston.com/feed/", source: "Sound of Boston", category: "music" },
    ];
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Boston Miniapp/1.0" },
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const items: EventResult[] = [];
        const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
        for (const match of matches) {
          const titleMatch = match[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*)<\/title>/);
          const linkMatch = match[1].match(/<link>([^<]*)<\/link>|<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/);
          const descMatch = match[1].match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([^<]*)<\/description>/);
          const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? "").trim();
          const url = (linkMatch?.[1] ?? linkMatch?.[2] ?? "").trim();
          const rawDesc = (descMatch?.[1] ?? descMatch?.[2] ?? "").trim();
          const description = rawDesc.replace(/<[^>]+>/g, "").trim().slice(0, 200);
          if (title && url) items.push({ title, description, url, category: feed.category });
          if (items.length >= 5) break;
        }
        return items;
      }),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<EventResult[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .slice(0, 10);
  } catch {
    return [];
  }
}

// ─── On This Day (Wikipedia) ─────────────────────────────────────────────────

type OnThisDayEvent = {
  year: number;
  text: string;
};

const BOSTON_KEYWORDS = /boston|massachusetts|harvard|mit|fenway|red sox|celtics|patriots|bruins|cambridge|new england|mass\.|quincy|somerville|brookline/i;

async function fetchOnThisDay(): Promise<OnThisDayEvent[]> {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`,
      {
        headers: {
          "User-Agent": "Boston Miniapp/1.0",
          "Api-User-Agent": "Boston Miniapp/1.0",
        },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const events: { year: number; text: string }[] = json.events ?? [];

    // Prefer Boston-specific events
    const bostonEvents = events
      .filter((e) => BOSTON_KEYWORDS.test(e.text))
      .map((e) => ({ year: e.year, text: e.text }))
      .slice(0, 3);

    if (bostonEvents.length > 0) return bostonEvents;

    // Fallback: return a few interesting general events for the AI to consider
    return events.slice(0, 3).map((e) => ({ year: e.year, text: e.text }));
  } catch {
    return [];
  }
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "clear skies";
  if (code <= 3) return "partly cloudy";
  if (code === 45 || code === 48) return "foggy";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 95) return "thunderstorms";
  return "overcast";
}

function buildContextMessage(ctx: {
  date: string;
  dayOfWeek: string;
  weather: { temp: number; description: string; high: number } | null;
  mbtaAlerts: { header: string }[];
  newsHeadlines: { title: string; url: string; source: string; description: string }[];
  sportsScores: SportsResult[];
  events: EventResult[];
  markets: MarketSnapshot | null;
  marketsClosed: boolean;
  onThisDay: OnThisDayEvent[];
  recentSpots: { name: string; neighborhood: string; category: string }[];
  happenings: { title: string; neighborhood: string; description: string }[];
}): string {
  const sections: string[] = [];

  sections.push(`Today is ${ctx.date}, ${ctx.dayOfWeek}.`);
  sections.push(
    ctx.weather
      ? `Current Boston weather: ${ctx.weather.temp}°F, ${ctx.weather.description}. High of ${ctx.weather.high}°F.`
      : "Weather data unavailable.",
  );

  // Markets
  sections.push(`\n─── MARKETS ───`);
  if (ctx.marketsClosed) {
    sections.push("Weekend or market holiday — set markets to null in response.");
  } else if (ctx.markets) {
    sections.push(JSON.stringify(ctx.markets));
    sections.push(
      "Use these strings verbatim for the markets fields. Choose a Boston-headquartered public company for localSpotlight only if a real news reason supports it today; otherwise null.",
    );
  } else {
    sections.push("Market data fetch failed — set markets to null in response.");
  }

  // MBTA
  sections.push(`\n─── MBTA ALERTS ───`);
  if (ctx.mbtaAlerts.length) {
    for (const a of ctx.mbtaAlerts) sections.push(`- ${a.header}`);
  } else {
    sections.push("No active alerts.");
  }

  // News
  sections.push(`\n─── NEWS (last 24hrs) ───`);
  if (ctx.newsHeadlines.length) {
    for (let i = 0; i < ctx.newsHeadlines.length; i++) {
      const h = ctx.newsHeadlines[i];
      let line = `${i + 1}. "${h.title}" (${h.source}) — ${h.url}`;
      if (h.description) line += `\n   Summary: ${h.description}`;
      sections.push(line);
    }
  } else {
    sections.push("No recent headlines available.");
  }

  // Events
  if (ctx.events.length > 0) {
    sections.push(`\n─── EVENTS & THINGS TO DO TODAY ───`);
    for (const e of ctx.events) {
      let line = `- ${e.title} [${e.category}] — ${e.url}`;
      if (e.description) line += `\n  ${e.description}`;
      sections.push(line);
    }
  }

  // Sports
  sections.push(`\n─── BOSTON SPORTS LAST NIGHT ───`);
  if (ctx.sportsScores.length) {
    for (const s of ctx.sportsScores) {
      sections.push(`${s.team} vs ${s.opponent}: ${s.won ? "Won" : "Lost"} ${s.score}. ${s.headline}`);
      sections.push(`ESPN recap: ${s.url}`);
    }
  } else {
    sections.push("No Boston games last night.");
  }

  // On This Day
  if (ctx.onThisDay.length > 0) {
    sections.push(`\n─── ON THIS DAY IN HISTORY ───`);
    for (const e of ctx.onThisDay) {
      sections.push(`- ${e.year}: ${e.text}`);
    }
  }

  // Community data
  if (ctx.recentSpots.length > 0) {
    sections.push(`\n─── COMMUNITY SPOTS (last 48hrs) ───`);
    for (const s of ctx.recentSpots) sections.push(`- ${s.name} in ${s.neighborhood} (${s.category})`);
  }

  if (ctx.happenings.length > 0) {
    sections.push(`\n─── COMMUNITY HAPPENINGS ───`);
    for (const h of ctx.happenings) sections.push(`- ${h.title} in ${h.neighborhood}: ${h.description}`);
  }

  sections.push(`\nWrite today's dispatch. Lead with the most interesting story for the lede. Use ONLY the data above — do not fabricate URLs, scores, or facts.`);

  return sections.join("\n");
}

// ─── Core Generation Logic ───────────────────────────────────────────────────

export type DispatchGenerationResult =
  | { ok: true; date: string; message: string }
  | { ok: false; error: string };

/**
 * Generate dispatch for today. If `force` is true, deletes existing dispatch first.
 * Returns a result object instead of a NextResponse so it can be used from server actions.
 */
export async function generateDispatchContent(options?: { force?: boolean }): Promise<DispatchGenerationResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY not configured" };
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  // If force, delete existing first
  if (options?.force) {
    await deleteDispatchForDate(today);
  }

  // Check if already generated today (idempotent unless forced)
  const existing = await getDispatchForDate(today);
  if (existing) {
    return { ok: true, date: today, message: "Dispatch already generated for today" };
  }

  const todayDate = new Date();
  const marketsClosed = isWeekend(todayDate);

  // Gather context in parallel
  const [weather, mbtaAlerts, newsHeadlines, sportsScores, events, markets, onThisDay, recentSpotsRaw, happeningsRaw] = await Promise.all([
    fetchWeatherContext(),
    fetchMbtaAlerts(),
    fetchNewsHeadlines(),
    fetchBostonSportsScores(),
    fetchTodayEvents(),
    marketsClosed ? Promise.resolve(null) : fetchMarketData(),
    fetchOnThisDay(),
    getRecentSpots(10),
    getCommunityHappenings(10),
  ]);

  const now = todayDate;
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const recentSpots = (recentSpotsRaw as { name: string; neighborhood: string; category: string; createdAt: Date }[])
    .filter((s) => new Date(s.createdAt) >= twoDaysAgo)
    .map((s) => ({ name: s.name, neighborhood: s.neighborhood, category: s.category }));

  const happenings = (happeningsRaw as { title: string; neighborhood: string; description: string }[])
    .map((h) => ({ title: h.title, neighborhood: h.neighborhood, description: h.description }));

  const dateStr = now.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const dayOfWeek = now.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long" });

  const contextMessage = buildContextMessage({
    date: dateStr,
    dayOfWeek,
    weather: weather
      ? { temp: weather.temp, description: getWeatherDescription(weather.code), high: weather.high }
      : null,
    mbtaAlerts,
    newsHeadlines,
    sportsScores,
    events,
    markets,
    marketsClosed,
    onThisDay,
    recentSpots,
    happenings,
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: DISPATCH_SYSTEM_PROMPT,
        messages: [{ role: "user", content: contextMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[dispatch] Anthropic API error:", err);
      return { ok: false, error: "AI generation failed" };
    }

    const data = await response.json();
    let rawContent = (data.content?.[0]?.text ?? "").trim();

    // Strip markdown code fences if the AI wrapped its response
    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    try {
      JSON.parse(rawContent);
    } catch {
      console.error("[dispatch] Invalid JSON from AI:", rawContent.slice(0, 200));
      return { ok: false, error: "AI returned invalid JSON" };
    }

    // ─── Self-Review Pass ──────────────────────────────────────────────────
    // Optional second AI call that acts as an editor reviewing the draft
    if (!process.env.DISPATCH_SKIP_REVIEW) {
      try {
        const reviewResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: `You are a senior editor reviewing a draft of The Dispatch — Boston's daily city briefing. Your voice mandate: dry Boston wit, specific, never tourist-guide, never corporate civic.

Your job:
1. CATCH bland or generic language. Rewrite any sentence that sounds like software wrote it. Inject specificity — street names, neighborhoods, local references.
2. CATCH hallucinated facts. Compare every claim in the draft against the SOURCE DATA provided. If the draft mentions a score, URL, event, or fact not in the source data, remove or correct it.
3. CATCH repetition. No story, number, or fact should appear in more than one section.
4. ENFORCE structure: localBusinessNews must be exactly 3 items. localSpotlight only when there is a genuine Boston-headquartered news reason — otherwise null. headsUp null unless something genuinely affects commutes or plans. markets null on weekends/holidays.
5. IMPROVE the greeting and signOff so they form a tonal loop — both specific to today, never generic.
6. VERIFY all URLs in the output match URLs from the source data. Do not invent URLs or market figures.

Return ONLY the corrected JSON. No preamble, no markdown, no explanation.

${DISPATCH_TYPE_REFERENCE}`,
            messages: [
              {
                role: "user",
                content: `SOURCE DATA:\n${contextMessage}\n\n---\n\nDRAFT DISPATCH:\n${rawContent}\n\nReview and improve this draft. Return the corrected JSON.`,
              },
            ],
          }),
        });

        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          let reviewedContent = (reviewData.content?.[0]?.text ?? "").trim();
          if (reviewedContent.startsWith("```")) {
            reviewedContent = reviewedContent.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
          }
          try {
            JSON.parse(reviewedContent);
            rawContent = reviewedContent;
            console.log("[dispatch] Self-review pass applied successfully");
          } catch {
            console.warn("[dispatch] Self-review returned invalid JSON, using original draft");
          }
        } else {
          console.warn("[dispatch] Self-review API call failed, using original draft");
        }
      } catch (reviewErr) {
        console.warn("[dispatch] Self-review failed:", reviewErr);
      }
    }

    await saveDispatch(today, rawContent);

    return { ok: true, date: today, message: "Dispatch generated" };
  } catch (err) {
    console.error("[dispatch] Generation failed:", err);
    return { ok: false, error: "Generation failed" };
  }
}
