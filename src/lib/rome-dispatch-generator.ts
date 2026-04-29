/* eslint-disable @neynar/no-process-env */

import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/neynar-db-sdk/db";
import { romeDispatchCache, romeEvents, romeSpots, kv } from "@/db/schema";

type DispatchPayload = {
  masthead: { date: string; localTime: string; weather: string };
  intro: string;
  latestFromFarcon: Array<{ castHash: string; author: string; text: string; commentary: string }>;
  todayInRome: string;
  buildersBuilding: Array<{ castHash: string; author: string; text: string; whatTheyreBuilding: string }>;
  poll: { question: string; options: [string, string, string, string] };
  triviaQuestion: string;
  triviaAnswer: string;
  placeOfTheDay: { name: string; spotId: string; teaser: string };
  phraseOfTheDay: { italian: string; english: string; phonetic: string; usedInSentence: string };
  untilTomorrow: string;
};

type CastContext = {
  hash: string;
  text: string;
  author: string;
  likes: number;
};

const DISPATCH_SYSTEM_PROMPT = `
You are the editor of The Dispatch Rome - the daily briefing for Farcaster builders
attending Farcon in Rome. Your voice is warm, sharp, and irreverent - the best host
at a dinner party who also ships code. You're not a tourist guide. You're a builder
who happens to love Rome and wants your crew to have the best possible week.

Farcon Rome is May 4-5, 2026 at INDUSTRIE FLUVIALI, Via del Porto Fluviale 35, Roma.
May 4 is Builders Day (dev Q&A, IRL connections, project showcases).
May 5 is the Summit (talks, panels, community conversations).

Write in English. Weave in Italian phrases naturally where appropriate.
Never be corporate. Never be a press release. Be the person everyone wants to
grab an espresso with.

Return a JSON object with EXACTLY these keys:
{
  "masthead": { "date": string, "localTime": string, "weather": string },
  "intro": string,
  "latestFromFarcon": [
    { "castHash": string, "author": string, "text": string, "commentary": string }
  ],
  "todayInRome": string,
  "buildersBuilding": [
    { "castHash": string, "author": string, "text": string, "whatTheyreBuilding": string }
  ],
  "poll": { "question": string, "options": [string, string, string, string] },
  "triviaQuestion": string,
  "triviaAnswer": string,
  "placeOfTheDay": { "name": string, "spotId": string, "teaser": string },
  "phraseOfTheDay": {
    "italian": string,
    "english": string,
    "phonetic": string,
    "usedInSentence": string
  },
  "untilTomorrow": string
}
`;

function getRomeDate(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
}

function getRomeTime(now = new Date()) {
  return now.toLocaleTimeString("en-GB", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchWeather() {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=41.9028&longitude=12.4964&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    { next: { revalidate: 300 } },
  );
  const data = await response.json();
  const current = data.current ?? {};
  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m,
    condition: String(current.weather_code ?? "clear"),
  };
}

async function fetchFarconCasts(limit: number) {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return [] as CastContext[];

  const url = new URL("https://api.neynar.com/v2/farcaster/feed/channels");
  url.searchParams.set("channel_ids", "farcon-rome");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort_type", "engagement");

  const response = await fetch(url, {
    headers: { api_key: apiKey, accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as { casts?: unknown[]; feed?: { casts?: unknown[] } };
  const rows = ((payload.casts ?? payload.feed?.casts ?? []) as Array<Record<string, unknown>>).slice(0, limit);

  return rows.map((row) => ({
    hash: String(row.hash ?? ""),
    text: String(row.text ?? ""),
    author: String((row.author as Record<string, unknown> | undefined)?.username ?? "unknown"),
    likes: Number((row.reactions as Record<string, unknown> | undefined)?.likes_count ?? 0),
  }));
}

async function fetchTodaysEvents(date: string) {
  return db
    .select()
    .from(romeEvents)
    .where(and(eq(romeEvents.status, "approved"), eq(romeEvents.date, date)))
    .orderBy(romeEvents.startTime);
}

async function fetchRandomFeaturedSpot() {
  const featured = await db
    .select()
    .from(romeSpots)
    .where(and(eq(romeSpots.status, "approved"), eq(romeSpots.featured, true)));

  if (!featured.length) return null;
  const index = Math.floor(Math.random() * featured.length);
  return featured[index];
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as DispatchPayload;
  } catch {
    return null;
  }
}

function fallbackDispatch(date: string, localTime: string, weather: string, spot: { id: string; name: string } | null): DispatchPayload {
  return {
    masthead: { date, localTime, weather },
    intro: "Rome is awake, builders are shipping, and espresso is carrying the roadmap.",
    latestFromFarcon: [],
    todayInRome: "Farcon energy is building across Ostiense. Keep your demos tight and your invites looser.",
    buildersBuilding: [],
    poll: {
      question: "What should tonight optimize for?",
      options: ["Demos", "Serendipity", "Deep chats", "Pasta"],
    },
    triviaQuestion: "Which river runs through Rome?",
    triviaAnswer: "The Tiber river.",
    placeOfTheDay: {
      name: spot?.name ?? "INDUSTRIE FLUVIALI",
      spotId: spot?.id ?? "",
      teaser: "Good builders pick one place and make it the gravitational center of the day.",
    },
    phraseOfTheDay: {
      italian: "Andiamo",
      english: "Let's go",
      phonetic: "ahn-DYAH-moh",
      usedInSentence: "Andiamo, we ship before dinner.",
    },
    untilTomorrow: "Same city, new commits. A domani.",
  };
}

export async function getCachedRomeDispatch(date: string) {
  const rows = await db
    .select()
    .from(romeDispatchCache)
    .where(eq(romeDispatchCache.date, date))
    .orderBy(desc(romeDispatchCache.generatedAt))
    .limit(1);

  if (!rows.length) return null;
  try {
    return JSON.parse(rows[0].content) as DispatchPayload;
  } catch {
    return null;
  }
}

export async function saveRomeDispatch(date: string, dispatch: DispatchPayload, model: string) {
  await db.insert(romeDispatchCache).values({
    id: randomUUID(),
    date,
    content: JSON.stringify(dispatch),
    model,
  });
}

export async function getRomeDispatchPoll(date: string) {
  const key = `rome-dispatch-poll-${date}`;
  const rows = await db.select().from(kv).where(eq(kv.key, key)).limit(1);
  if (!rows.length) return {} as Record<string, number>;
  try {
    return JSON.parse(rows[0].value) as Record<string, number>;
  } catch {
    return {};
  }
}

export async function recordRomeDispatchVote(date: string, option: string) {
  const key = `rome-dispatch-poll-${date}`;
  const current = await getRomeDispatchPoll(date);
  const next = { ...current, [option]: (current[option] ?? 0) + 1 };

  await db
    .insert(kv)
    .values({ key, value: JSON.stringify(next) })
    .onConflictDoUpdate({ target: kv.key, set: { value: JSON.stringify(next) } });

  return next;
}

export async function generateRomeDispatch(date = getRomeDate()) {
  const [weather, casts, events, placeOfTheDay] = await Promise.all([
    fetchWeather(),
    fetchFarconCasts(20),
    fetchTodaysEvents(date),
    fetchRandomFeaturedSpot(),
  ]);

  const localTime = getRomeTime();
  const weatherLine = `${weather.temperature ?? "?"}°C, condition ${weather.condition}, humidity ${weather.humidity ?? "?"}%, wind ${weather.wind ?? "?"} km/h`;

  const context = {
    weather,
    casts,
    events,
    placeOfTheDay: placeOfTheDay ? { id: placeOfTheDay.id, name: placeOfTheDay.name } : null,
    localTime,
    date,
  };

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    const fallback = fallbackDispatch(date, localTime, weatherLine, placeOfTheDay ? { id: placeOfTheDay.id, name: placeOfTheDay.name } : null);
    await saveRomeDispatch(date, fallback, "fallback-no-anthropic");
    return fallback;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: DISPATCH_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: JSON.stringify(context),
          },
        ],
      }),
    });

    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = payload.content?.[0]?.text ?? "";
    const parsed = extractJson(text);

    if (!parsed) {
      const fallback = fallbackDispatch(date, localTime, weatherLine, placeOfTheDay ? { id: placeOfTheDay.id, name: placeOfTheDay.name } : null);
      await saveRomeDispatch(date, fallback, "fallback-parse-error");
      return fallback;
    }

    await saveRomeDispatch(date, parsed, "claude-sonnet-4-20250514");
    return parsed;
  } catch {
    const fallback = fallbackDispatch(date, localTime, weatherLine, placeOfTheDay ? { id: placeOfTheDay.id, name: placeOfTheDay.name } : null);
    await saveRomeDispatch(date, fallback, "fallback-request-error");
    return fallback;
  }
}

export async function getOrGenerateRomeDispatch() {
  const date = getRomeDate();
  const cached = await getCachedRomeDispatch(date);
  if (cached) return { date, dispatch: cached };

  const dispatch = await generateRomeDispatch(date);
  return { date, dispatch };
}
