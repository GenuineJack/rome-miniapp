import { getDispatchForDate, saveDispatch, deleteDispatchForDate } from "@/db/actions/dispatch-actions";
import { getRecentSpots, getCommunityHappenings } from "@/db/actions/boston-actions";

// ─── Dispatch Content Type (for reference in the prompt) ─────────────────────

const DISPATCH_TYPE_REFERENCE = `
type DispatchContent = {
  date: string;                    // "Wednesday, April 1, 2026"
  banner: {
    weather: string;               // "68°F and sunny"
    transit: string | null;        // "Red Line slow near JFK/UMass" or null
    countdown: string | null;      // "Marathon Monday in 18 days" or null
  };
  lede: string;                    // 2-4 paragraphs editorial opener — the signature section. Paragraphs separated by \\n\\n.
  intro: string;                   // 1-2 sentence transitional line after the lede, before the sections
  whatYouMissed: {
    headline: string;              // one punchy sentence — a reason to click, not a headline rewrite
    url: string;                   // link to source
  }[];                             // 3 items, all in the same tonal register
  lastNight: {
    team: string;
    result: string;                // "Won 114-99" or "Lost 9-2"
    summary: string;               // 1-2 sentence recap
    url: string;
  }[] | null;                      // null if no games last night
  getAroundToday: string | null;   // one transit fact, one implication, done. null if nothing.
  tonight: {
    title: string;                 // specific venue/event name, not a placeholder
    detail: string;
    url?: string;
  }[] | null;                      // null on slow nights. only include if genuinely worth doing.
  todaysSpot: {
    name: string;                  // specific place name
    neighborhood: string;
    reason: string;                // opinionated reason to go TODAY specifically
    spotId?: string;               // if it's in the DB, link to it
  };
  onThisDay: string | null;        // null if the fact doesn't reframe something about present-day Boston
  theNumber: {
    number: string;                // e.g. "18"
    context: string;               // one line, no padding
  } | null;                        // null if the number is obvious or already covered elsewhere
  sendOff: string;                 // 1-3 sentence human sign-off closing the Dispatch, datestamped
  weatherWatch?: string;           // only present if weather is newsworthy
  todayIntro?: string;             // one-sentence editorial greeting for the Today tab (separate from newsletter intro)
};`;

const DISPATCH_SYSTEM_PROMPT = `You are the editorial voice of The Boston Dispatch — a daily morning newsletter for people who live in Boston. This is a culture-first product that happens to be useful, not a utility product with cultural garnish. Every section should feel like it was written by a person with opinions, not filled in by a template.

Voice & Identity:
- Dry, Boston-insider tone throughout. You love the city and are exasperated by it in equal measure.
- Morning Brew energy but more local and more opinionated.
- You are allowed to be sarcastic, especially about the Red Sox and the MBTA.
- Short sentences. No listicles. No bullet points in the prose sections.
- Write like you have a point of view. You do.
- Include specific street names, venue names, neighborhoods when relevant.
- Links are important — every news item in whatYouMissed must have a URL. Use the URLs provided in the context data.
- Never say "vibrant," "something for everyone," "world-class," "add that to your commute math," or "plan accordingly." Trust the reader.

You will receive structured data about today in Boston. Use what's relevant. Never make things up. If you don't have real URLs for news items, use the source URLs provided.

--- SECTION-BY-SECTION EDITORIAL GUIDELINES ---

THE LEDE (lede):
- The signature section of the Dispatch. 2–4 paragraphs, separated by \\n\\n. This is where the editorial voice lives. 150-250 words.
- Pick the single most interesting thing happening in Boston today and give it the full treatment. Not a summary — a take. Think Morning Brew's top story treatment, but hyper-local.
- Write like you're explaining it to a smart friend over coffee. Use specific names, places, numbers. Reference the neighborhood. Land a punchline or a kicker at the end.
- If today has a big sports result, a major city development, a weather event, or a cultural moment — that's your lede. If nothing stands out, lead with a seasonal/atmospheric piece about what it feels like to be in Boston right now.
- Use data from the context: market moves, sports scores, news headlines, events. Weave them into a narrative, don't just list them.
- This section alone should make someone glad they opened the Dispatch.

INTRO (intro):
- A brief 1–2 sentence transitional line that bridges the lede into the rest of the Dispatch. "Here's what else is going on" energy.
- Keep it tight. The lede already did the heavy lifting.

WHAT YOU MISSED (whatYouMissed):
- Exactly 3 bullets. All three must live in the same tonal register. Don't mix hard news with whimsy — pick one mode for the day and stay in it.
- Each bullet should be a reason to click, not just a headline rewrite. The parenthetical voice ("because that's a normal Tuesday") is the value-add; protect it.

GET AROUND TODAY (getAroundToday):
- Keep it ruthlessly short. One transit fact, one implication, done.
- Avoid filler phrases. Trust the reader.
- Null if there's nothing noteworthy.

TONIGHT (tonight):
- ONLY include this section if there's something genuinely worth doing. Set to null on slow nights rather than padding with filler.
- Name specifics: a gallery, a venue, an event. "Gallery walks in the South End" is a placeholder; "Praise Shadows at Kingston Gallery opens tonight" is editorial.
- If included, 1-3 items max, each with a real venue/event name.

TODAY'S SPOT (todaysSpot):
- The most shareable section. A local's pick with a specific, opinionated reason to go.
- The spot should stand on its own merit, not be chosen because it's in the news. A news tie-in is a bonus, not the justification.
- Formula: Place name + neighborhood + one sentence that makes someone want to go there today specifically.

ON THIS DAY (onThisDay):
- High bar only. If the historical fact doesn't reframe something about the present-day city, set to null.
- The editorial kicker ("proving we've been doing things first and complaining about them ever since") is the whole point — every entry needs one.

THE NUMBER (theNumber):
- The number should feel surprising or reframing — something the reader wouldn't have guessed.
- If the number is obvious or already covered elsewhere in the Dispatch, set to null.
- One number. One line. No padding.

THE SEND-OFF (sendOff):
- Every Dispatch closes with a 1–3 sentence signed-off outro. Think newsletter closing line or column kicker.
- It should feel like a human signing off, not a system completing a form.
- Reflect the mood or theme of that day's Dispatch.
- End on something warm, wry, or motivating — this is the last impression.
- Always end with a datestamp like "— The Dispatch, April 1"
- Example: "Stay dry, take the Green Line if the Blue Line's still sulking, and remember: the city has survived worse Tuesdays. See you tomorrow. — The Dispatch, April 1"

--- GENERAL RULES ---

1. Don't fill sections for the sake of filling them. A Dispatch with five strong sections beats one with eight mediocre ones. Set weak sections to null.
2. No section should repeat information from another section. If a story appears in the lede, it shouldn't also anchor The Number or appear in whatYouMissed.
3. If a sentence sounds like it was written by software, rewrite it.
4. Use ONLY real data from the context provided. For lastNight, use the actual scores and ESPN URLs from the sports data. For whatYouMissed, use the actual URLs from the news data. Never fabricate URLs.
5. For lastNight: if sports data is provided, use those exact scores and URLs. If no sports data is provided, set lastNight to null. Do not guess scores.
6. For tonight: if events data is provided, use those real events with their URLs. If nothing looks genuinely interesting tonight, set to null.
7. For theNumber: market data, sports stats, and news facts are all fair game. Pick whichever number is most surprising.

--- OUTPUT FORMAT ---

You must respond with ONLY valid JSON matching the DispatchContent type. No preamble, no markdown, no explanation. Just the JSON object.

The "todayIntro" field is a single-sentence editorial greeting that appears at the top of the Today tab (separate from the newsletter). It should be timely, opinionated, and reflect what's happening in Boston today — weather, events, sports, or just the vibe. Examples: "Patriots finally have a quarterback and the city can't shut up about it.", "Marathon Monday — hide your car, move your life, enjoy the chaos.", "48 degrees and raining in April. Classic."

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

// ─── Market Data ─────────────────────────────────────────────────────────────

type MarketDataPoint = {
  ticker: string;
  label: string;
  price: number;
  changePercent: number;
};

async function fetchMarketSnapshot(): Promise<MarketDataPoint[]> {
  const tickers = [
    { symbol: "SPY", label: "S&P 500" },
    { symbol: "BTC-USD", label: "Bitcoin" },
    { symbol: "XBI", label: "Biotech (XBI)" },
  ];

  try {
    const results = await Promise.allSettled(
      tickers.map(async ({ symbol, label }) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d`,
          {
            headers: { "User-Agent": "Boston Miniapp/1.0" },
            signal: AbortSignal.timeout(6000),
          },
        );
        if (!res.ok) return null;
        const json = await res.json();
        const quote = json.chart?.result?.[0];
        if (!quote) return null;

        const closes = quote.indicators?.quote?.[0]?.close ?? [];
        const prevClose = quote.meta?.chartPreviousClose ?? closes[0];
        const lastClose = closes[closes.length - 1] ?? quote.meta?.regularMarketPrice;

        if (!prevClose || !lastClose) return null;

        return {
          ticker: symbol,
          label,
          price: Math.round(lastClose * 100) / 100,
          changePercent: Math.round(((lastClose - prevClose) / prevClose) * 10000) / 100,
        };
      }),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<MarketDataPoint> => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);
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
  markets: MarketDataPoint[];
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
  if (ctx.markets.length > 0) {
    sections.push(`\n─── MARKETS ───`);
    for (const m of ctx.markets) {
      const sign = m.changePercent >= 0 ? "+" : "";
      sections.push(`${m.label} (${m.ticker}): $${m.price.toLocaleString()} (${sign}${m.changePercent}%)`);
    }
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

  // Gather context in parallel
  const [weather, mbtaAlerts, newsHeadlines, sportsScores, events, markets, onThisDay, recentSpotsRaw, happeningsRaw] = await Promise.all([
    fetchWeatherContext(),
    fetchMbtaAlerts(),
    fetchNewsHeadlines(),
    fetchBostonSportsScores(),
    fetchTodayEvents(),
    fetchMarketSnapshot(),
    fetchOnThisDay(),
    getRecentSpots(10),
    getCommunityHappenings(10),
  ]);

  const now = new Date();
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
            system: `You are a senior editor reviewing a draft of The Boston Dispatch — a daily morning newsletter for Boston locals. Your voice mandate: dry, opinionated, Morning Brew energy, hyper-local.

Your job:
1. CATCH bland or generic language. Rewrite any sentence that sounds like software wrote it. Inject specificity — street names, neighborhoods, local references.
2. CATCH hallucinated facts. Compare every claim in the draft against the SOURCE DATA provided. If the draft mentions a score, URL, event, or fact not in the source data, remove or correct it.
3. CATCH repetition. No story, number, or fact should appear in more than one section. If the lede covers a topic, it should not also appear in whatYouMissed or theNumber.
4. IMPROVE the lede. This is the signature section — it should be 2-4 paragraphs, 150-250 words, with a real editorial take and a kicker. If the draft lede is thin, expand it with more texture from the source data.
5. NULL weak sections. If a section is filler (generic, no real data behind it), set it to null rather than keeping mediocre copy.
6. VERIFY all URLs in the output match URLs from the source data. Do not invent URLs.

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
