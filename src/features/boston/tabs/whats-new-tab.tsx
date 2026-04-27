"use client";

import { useState, useEffect, useCallback } from "react";
import { Spot } from "@/features/boston/types";
import { ExternalLink, useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { fetchWeather, type WeatherData } from "@/features/boston/components/weather-strip";

// ─── Dispatch Content Type ───────────────────────────────────────────────────

type DispatchContent = {
  date: string;
  greeting: string;
  oneBigThing: {
    headline: string;
    whatIsHappening: string;
    whyItMatters: string;
    whatItMeansForYou: string;
    url: string;
  };
  todayInBoston: {
    sports:
      | { team: string; result: string; summary: string; url?: string }[]
      | null;
    events: { title: string; detail: string; url?: string }[];
    headsUp: string | null;
  };
  markets: {
    nasdaq: string;
    dow: string;
    sp500: string;
    btc: string;
    eth: string;
    sol: string;
    localSpotlight: {
      ticker: string;
      company: string;
      price: string;
      note: string;
    } | null;
  } | null;
  localBusinessNews: { headline: string; summary: string; url: string }[];
  dailyPoll: { question: string; options: string[] };
  dailyTrivia: {
    question: string;
    hint?: string;
    answer: string;
    funFact: string;
  };
  placeOfTheDay: {
    name: string;
    neighborhood: string;
    reason: string;
    spotId?: string;
  };
  numberofTheDay: { number: string; context: string };
  signOff: string;
};

type PollResults = {
  date: string;
  results: { option: string; count: number; percentage: number }[];
  total: number;
};

// ─── Fallback seasonal blocks ────────────────────────────────────────────────

const FALLBACK_BLOCKS = [
  { id: "marathon", emoji: "🏃", title: "Marathon Monday", desc: "Third Monday of April. The whole city shuts down for a footrace and that's correct." },
  { id: "patios", emoji: "☀️", title: "Patio Season", desc: "The city doubles in size when the patios open. South End, North End, Eastie waterfront." },
  { id: "fenway", emoji: "⚾", title: "Opening Day at Fenway", desc: "The bleachers. The Sausage Guy. Lansdowne after. A civic holiday by any other name." },
  { id: "rooftops", emoji: "🌆", title: "Rooftop Season", desc: "May through September, rooftop bars are the correct answer." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-2">
      {label}
    </h3>
  );
}

function getYesterdayDateStr(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return yesterday.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function getTodayDateStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

// ─── Sections ────────────────────────────────────────────────────────────────

function HeaderSection({ date, weather }: { date: string; weather: WeatherData | null }) {
  const [bostonTime, setBostonTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBostonTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      );
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const weatherStr = weather
    ? `${weather.emoji} ${weather.tempF}°F · ${weather.condition}`
    : null;

  return (
    <div className="px-4 pt-4 pb-3 bg-navy border-b border-white/10">
      <h2 className="text-lg font-black uppercase tracking-tight text-white t-sans">
        The Dispatch · Boston
      </h2>
      <p className="text-xs text-white/60 mt-1 t-sans flex flex-wrap gap-x-1.5">
        <span>{date}</span>
        <span className="opacity-40">·</span>
        <span>{bostonTime} ET</span>
        {weatherStr && (
          <>
            <span className="opacity-40">·</span>
            <span>{weatherStr}</span>
          </>
        )}
      </p>
    </div>
  );
}

function GreetingSection({ greeting }: { greeting: string }) {
  return (
    <div className="px-4 py-5 border-b border-[#e0e0e0]">
      <p className="text-[15px] leading-[1.7] t-serif-body">{greeting}</p>
    </div>
  );
}

function OneBigThingSection({ data }: { data: DispatchContent["oneBigThing"] }) {
  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="The One Big Thing" />
      <h4 className="text-lg font-black t-sans-navy leading-tight mb-2">
        {data.headline}
      </h4>
      <p className="text-[14px] leading-relaxed t-serif-body mb-2">
        {data.whatIsHappening}
      </p>
      <p className="text-[14px] leading-relaxed t-serif-body mb-3">
        {data.whyItMatters}
      </p>
      <div className="border-l-2 border-boston-blue pl-3 py-1 bg-boston-gray-50">
        <p className="text-[14px] leading-relaxed t-serif-body">
          {data.whatItMeansForYou}
        </p>
      </div>
      {data.url && (
        <ExternalLink
          href={data.url}
          className="inline-block mt-3 text-xs font-bold uppercase tracking-widest t-sans-blue hover:underline"
        >
          Read more →
        </ExternalLink>
      )}
    </div>
  );
}

function TodayInBostonSection({
  data,
}: {
  data: DispatchContent["todayInBoston"];
}) {
  const hasSports = data.sports && data.sports.length > 0;
  const hasEvents = data.events && data.events.length > 0;
  const hasHeadsUp = !!data.headsUp;

  if (!hasSports && !hasEvents && !hasHeadsUp) return null;

  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="Today in Boston" />
      <div className="flex flex-col gap-4">
        {hasSports && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-2">
              🏒 Sports
            </h4>
            <div className="flex flex-col gap-2">
              {data.sports!.map((s, i) => (
                <div key={i} className="p-2 rounded-sm bg-boston-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold t-sans-navy">{s.team}</span>
                    <span className="text-xs font-bold uppercase tracking-widest t-sans-gray">
                      {s.result}
                    </span>
                  </div>
                  <p className="text-[13px] italic t-serif-body">{s.summary}</p>
                  {s.url && (
                    <ExternalLink
                      href={s.url}
                      className="text-xs font-bold t-sans-blue hover:underline mt-1 inline-block"
                    >
                      Recap →
                    </ExternalLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasEvents && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-2">
              📅 Happening Today
            </h4>
            <div className="flex flex-col gap-2">
              {data.events.map((e, i) => (
                <div key={i}>
                  <p className="text-xs font-bold t-sans-navy">{e.title}</p>
                  <p className="text-[13px] italic t-serif-body">{e.detail}</p>
                  {e.url && (
                    <ExternalLink
                      href={e.url}
                      className="text-xs font-bold t-sans-blue hover:underline"
                    >
                      Details →
                    </ExternalLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasHeadsUp && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest t-sans-navy mb-2">
              ⚠️ Heads Up
            </h4>
            <p className="text-[13px] italic t-serif-body">{data.headsUp}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketsSection({ data }: { data: NonNullable<DispatchContent["markets"]> }) {
  const cell = (label: string, value: string) => (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-widest t-sans-gray">
        {label}
      </span>
      <span className="text-[13px] t-sans-navy font-bold">{value}</span>
    </div>
  );

  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="Markets" />
      <div className="grid grid-cols-3 gap-3 mb-3">
        {cell("Nasdaq", data.nasdaq)}
        {cell("Dow", data.dow)}
        {cell("S&P", data.sp500)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cell("BTC", data.btc)}
        {cell("ETH", data.eth)}
        {cell("SOL", data.sol)}
      </div>
      {data.localSpotlight && (
        <div className="mt-3 p-3 rounded-sm bg-boston-gray-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold t-sans-navy">
              {data.localSpotlight.ticker} · {data.localSpotlight.company}
            </span>
            <span className="text-xs font-bold t-sans-gray">
              {data.localSpotlight.price}
            </span>
          </div>
          <p className="text-[13px] italic t-serif-body">
            {data.localSpotlight.note}
          </p>
        </div>
      )}
    </div>
  );
}

function LocalBusinessNewsSection({
  items,
}: {
  items: DispatchContent["localBusinessNews"];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="Business" />
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[13px] font-bold t-sans-navy mb-0.5">
              {item.headline}
            </p>
            <p className="text-[13px] italic t-serif-body line-clamp-2">
              {item.summary}
            </p>
            {item.url && (
              <ExternalLink
                href={item.url}
                className="text-xs font-bold t-sans-blue hover:underline"
              >
                Read →
              </ExternalLink>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyGamesSection({
  poll,
  trivia,
  todayDate,
}: {
  poll: DispatchContent["dailyPoll"];
  trivia: DispatchContent["dailyTrivia"];
  todayDate: string;
}) {
  const { data: user } = useFarcasterUser();
  const fid = user?.fid ? String(user.fid) : null;

  const yesterdayDate = getYesterdayDateStr();
  const [yesterdayResults, setYesterdayResults] = useState<PollResults | null>(null);
  const [todayResults, setTodayResults] = useState<PollResults | null>(null);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dispatch/poll?date=${yesterdayDate}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PollResults | null) => {
        if (d && d.total > 0) setYesterdayResults(d);
      })
      .catch(() => {});
  }, [yesterdayDate]);

  async function handleVote(option: string) {
    if (voted || voting) return;
    setVoting(true);
    setVoteError(null);
    try {
      const res = await fetch("/api/dispatch/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayDate, option, fid }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          setVoted(true);
          const r = await fetch(`/api/dispatch/poll?date=${todayDate}`);
          if (r.ok) setTodayResults(await r.json());
        } else {
          setVoteError("Vote failed");
        }
        return;
      }
      const data: PollResults = await res.json();
      setTodayResults(data);
      setVoted(true);
    } catch {
      setVoteError("Vote failed");
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="Daily Games" />

      {/* Daily Poll */}
      <div className="mb-5">
        {yesterdayResults && (
          <div className="mb-3 p-3 rounded-sm bg-boston-gray-50">
            <p className="text-[11px] font-bold uppercase tracking-widest t-sans-gray mb-2">
              Yesterday&apos;s results
            </p>
            <div className="flex flex-col gap-1">
              {yesterdayResults.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[12px] t-sans-navy flex-1 truncate">
                    {r.option}
                  </span>
                  <div className="w-24 h-2 rounded-sm bg-boston-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-boston-blue"
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] t-sans-gray w-10 text-right">
                    {r.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[14px] font-bold t-sans-navy mb-2">{poll.question}</p>
        <div className="flex flex-col gap-1.5">
          {poll.options.map((opt, i) => {
            const result = todayResults?.results.find((r) => r.option === opt);
            const pct = result?.percentage ?? 0;
            return (
              <button
                key={i}
                onClick={() => handleVote(opt)}
                disabled={voted || voting}
                className={`relative px-3 py-2 rounded-sm border text-left text-[13px] t-sans-navy overflow-hidden ${
                  voted
                    ? "border-boston-gray-200 bg-white cursor-default"
                    : "border-boston-gray-200 bg-white hover:bg-boston-gray-50 cursor-pointer"
                }`}
              >
                {voted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-boston-blue/10"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span>{opt}</span>
                  {voted && (
                    <span className="text-[11px] font-bold t-sans-gray">
                      {pct}%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {voteError && (
          <p className="text-xs t-sans-red mt-2">{voteError}</p>
        )}
      </div>

      {/* Daily Trivia (question only) */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest t-sans-gray mb-1">
          Trivia
        </p>
        <p className="text-[14px] t-sans-navy mb-1">{trivia.question}</p>
        {trivia.hint && (
          <p className="text-[13px] italic t-serif-body mb-1">
            Hint: {trivia.hint}
          </p>
        )}
        <p className="text-[12px] uppercase tracking-widest t-sans-gray">
          Answer below ↓
        </p>
      </div>
    </div>
  );
}

function PlaceOfTheDaySection({
  data,
  spots,
  onSelectSpot,
}: {
  data: DispatchContent["placeOfTheDay"];
  spots?: Spot[];
  onSelectSpot?: (spot: Spot) => void;
}) {
  const handleTap = useCallback(() => {
    if (data.spotId && spots && onSelectSpot) {
      const match = spots.find((s) => s.id === data.spotId);
      if (match) onSelectSpot(match);
    }
  }, [data.spotId, spots, onSelectSpot]);

  return (
    <div
      className={`px-4 py-4 border-b border-[#e0e0e0] ${
        data.spotId ? "cursor-pointer hover:bg-boston-gray-50" : ""
      }`}
      onClick={handleTap}
    >
      <SectionHeader label="Place of the Day" />
      <p className="text-sm font-bold t-sans-navy">{data.name}</p>
      <p className="text-xs uppercase tracking-widest t-sans-gray mb-1">
        {data.neighborhood}
      </p>
      <p className="text-[13px] italic t-serif-body">{data.reason}</p>
    </div>
  );
}

function NumberOfTheDaySection({
  data,
}: {
  data: DispatchContent["numberofTheDay"];
}) {
  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="Number of the Day" />
      <p className="text-4xl font-black t-sans-navy leading-tight mb-1">
        {data.number}
      </p>
      <p className="text-[13px] italic t-serif-body">{data.context}</p>
    </div>
  );
}

function SignOffSection({ signOff }: { signOff: string }) {
  const todayPath = `/dispatch/${getTodayDateStr()}`;
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${todayPath}` : todayPath;

  return (
    <div className="px-4 pt-5 pb-4 border-b border-[#e0e0e0]">
      <p className="text-[14px] italic leading-relaxed t-serif-body mb-3">
        {signOff}
      </p>
      <ExternalLink
        href={shareUrl}
        className="text-[13px] italic t-serif-body text-boston-gray-400 hover:underline"
      >
        <em>Know someone who should be reading this? →</em>
      </ExternalLink>
    </div>
  );
}

function TriviaAnswerSection({
  data,
}: {
  data: DispatchContent["dailyTrivia"];
}) {
  return (
    <div className="px-4 py-4 border-b border-[#e0e0e0]">
      <SectionHeader label="Trivia Answer" />
      <p className="text-[14px] font-bold t-sans-navy mb-1">{data.answer}</p>
      <p className="text-[13px] italic t-serif-body">{data.funFact}</p>
    </div>
  );
}

function FooterSection() {
  return (
    <div className="px-4 py-4 text-center">
      <p className="text-[11px] font-bold uppercase tracking-widest t-sans-gray">
        The Dispatch · Boston
      </p>
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
  const [weather, setWeather] = useState<WeatherData | null>(null);

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

  useEffect(() => {
    fetchWeather()
      .then(setWeather)
      .catch(() => {});
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
            The Dispatch · Boston
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
                <span className="text-[11px] font-bold uppercase tracking-widest t-sans text-white/40">
                  Seasonal
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1.5 t-sans-white">{b.title}</h3>
              <p className="text-[13px] italic leading-relaxed t-serif text-white/75">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const todayDate = getTodayDateStr();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Section 1: Header */}
      <HeaderSection date={dispatch.date} weather={weather} />

      <div className="flex flex-col">
        {/* Section 2: Editorial Greeting */}
        <GreetingSection greeting={dispatch.greeting} />

        {/* Section 3: The One Big Thing */}
        <OneBigThingSection data={dispatch.oneBigThing} />

        {/* Section 4: Today in Boston */}
        <TodayInBostonSection data={dispatch.todayInBoston} />

        {/* Section 5: Markets */}
        {dispatch.markets && <MarketsSection data={dispatch.markets} />}

        {/* Section 6: Local Business News */}
        <LocalBusinessNewsSection items={dispatch.localBusinessNews} />

        {/* Section 7: Daily Games */}
        <DailyGamesSection
          poll={dispatch.dailyPoll}
          trivia={dispatch.dailyTrivia}
          todayDate={todayDate}
        />

        {/* Section 8: Place of the Day */}
        <PlaceOfTheDaySection
          data={dispatch.placeOfTheDay}
          spots={spots}
          onSelectSpot={onSelectSpot}
        />

        {/* Section 9: Number of the Day */}
        <NumberOfTheDaySection data={dispatch.numberofTheDay} />

        {/* Section 10: Sign-Off */}
        <SignOffSection signOff={dispatch.signOff} />

        {/* Section 11: Trivia Answer */}
        <TriviaAnswerSection data={dispatch.dailyTrivia} />

        {/* Section 12: Footer */}
        <FooterSection />
      </div>
    </div>
  );
}
