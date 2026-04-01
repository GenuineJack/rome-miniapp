import { NextRequest, NextResponse } from "next/server";
import { getDispatchForDate, saveDispatch } from "@/db/actions/dispatch-actions";
import { getRecentSpots, getCommunityHappenings } from "@/db/actions/boston-actions";

export const maxDuration = 60;

// ─── Dispatch Content Type (for reference in the prompt) ─────────────────────

const DISPATCH_TYPE_REFERENCE = `
type DispatchContent = {
  date: string;                    // "Wednesday, April 1, 2026"
  banner: {
    weather: string;               // "68°F and sunny"
    transit: string | null;        // "Red Line slow near JFK/UMass" or null
    countdown: string | null;      // "Marathon Monday in 18 days" or null
  };
  intro: string;                   // 2-3 sentences, perspective-driven opener (NOT a summary)
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

INTRO (intro):
- The most important copy in the Dispatch. Write it as a tight 2–3 sentence take on the day — a PERSPECTIVE, not a summary.
- If there's nothing interesting to say, lead with something seasonal, atmospheric, or historically Boston. Don't fill it with logistics.

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
2. No section should repeat information from another section. If a story appears in the intro, it shouldn't also anchor The Number.
3. If a sentence sounds like it was written by software, rewrite it.

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
    ];
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Boston Miniapp/1.0" },
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const items: { title: string; url: string; source: string }[] = [];
        const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
        for (const match of matches) {
          const titleMatch = match[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*)<\/title>/);
          const linkMatch = match[1].match(/<link>([^<]*)<\/link>/);
          const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? "").trim();
          const url = (linkMatch?.[1] ?? "").trim();
          if (title && url) items.push({ title, url, source: feed.source });
          if (items.length >= 3) break;
        }
        return items;
      }),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<{ title: string; url: string; source: string }[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .slice(0, 8);
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
  newsHeadlines: { title: string; url: string; source: string }[];
  recentSpots: { name: string; neighborhood: string; category: string }[];
  happenings: { title: string; neighborhood: string; description: string }[];
}): string {
  return `
Today is ${ctx.date}, ${ctx.dayOfWeek}.
${ctx.weather ? `Current Boston weather: ${ctx.weather.temp}°F, ${ctx.weather.description}. High of ${ctx.weather.high}°F.` : "Weather data unavailable."}

MBTA alerts right now:
${ctx.mbtaAlerts.length ? ctx.mbtaAlerts.map((a) => `- ${a.header}`).join("\n") : "No active alerts."}

Recent news headlines (last 24hrs):
${ctx.newsHeadlines.length ? ctx.newsHeadlines.map((h) => `- "${h.title}" (${h.source}) — ${h.url}`).join("\n") : "No recent headlines available."}

New spots added to the guide (last 48hrs):
${ctx.recentSpots.length ? ctx.recentSpots.map((s) => `- ${s.name} in ${s.neighborhood} (${s.category})`).join("\n") : "No new spots in the last 48hrs."}

Community happenings today:
${ctx.happenings.length ? ctx.happenings.map((h) => `- ${h.title} in ${h.neighborhood}: ${h.description}`).join("\n") : "No community happenings today."}

Write today's dispatch.
  `.trim();
}

// ─── Route Handler ───────────────────────────────────────────────────────────

async function generateDispatch(authHeader: string | null): Promise<NextResponse> {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return generateDispatchCore();
}

async function generateDispatchCore(): Promise<NextResponse> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // Check if already generated today (idempotent)
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD
  const existing = await getDispatchForDate(today);
  if (existing) {
    return NextResponse.json({ message: "Dispatch already generated for today", date: today });
  }

  // Gather context in parallel
  const [weather, mbtaAlerts, newsHeadlines, recentSpotsRaw, happeningsRaw] = await Promise.all([
    fetchWeatherContext(),
    fetchMbtaAlerts(),
    fetchNewsHeadlines(),
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
    recentSpots,
    happenings,
  });

  // Call Anthropic API
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
        max_tokens: 2500,
        system: DISPATCH_SYSTEM_PROMPT,
        messages: [{ role: "user", content: contextMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[dispatch] Anthropic API error:", err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text ?? "";

    // Validate JSON
    try {
      JSON.parse(rawContent);
    } catch {
      console.error("[dispatch] Invalid JSON from AI:", rawContent.slice(0, 200));
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    await saveDispatch(today, rawContent);

    return NextResponse.json({ message: "Dispatch generated", date: today });
  } catch (err) {
    console.error("[dispatch] Generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

// Vercel cron jobs invoke GET requests
export async function GET(request: NextRequest) {
  // If CRON_SECRET is set, verify it. Otherwise allow Vercel cron through.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return generateDispatchCore();
}

// Admin panel uses POST (always requires auth)
export async function POST(request: NextRequest) {
  return generateDispatch(request.headers.get("authorization"));
}
