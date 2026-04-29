"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { getRomeEvents, submitRomeEvent } from "@/db/actions/rome-actions";
import { copyLink, shareToFarcaster, shareToX } from "@/features/rome/utils/share";
import type { RomeEvent } from "@/features/rome/types";

type RomeNewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
};

type FarconCast = {
  text: string;
  author: { username: string; pfp_url?: string | null };
  timestamp: string;
  reactions: { likes_count: number };
  hash: string;
};

export function TodayTab() {
  const [romeTime, setRomeTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const [weather, setWeather] = useState<string>("Loading weather...");
  const [news, setNews] = useState<RomeNewsItem[]>([]);
  const [casts, setCasts] = useState<FarconCast[]>([]);
  const [events, setEvents] = useState<RomeEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRomeTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Europe/Rome",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=41.9028&longitude=12.4964&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code";
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const current = data.current;
        if (!current) {
          setWeather("Weather unavailable");
          return;
        }
        const text = `${current.temperature_2m}°C · humidity ${current.relative_humidity_2m}% · wind ${current.wind_speed_10m} km/h`;
        setWeather(text);
      })
      .catch(() => setWeather("Weather unavailable"));
  }, []);

  useEffect(() => {
    fetch("/api/rome-news")
      .then((response) => response.json())
      .then((data) => setNews((data.items ?? []) as RomeNewsItem[]))
      .catch(() => setNews([]));

    fetch("/api/farcon-casts")
      .then((response) => response.json())
      .then((data) => setCasts((data.casts ?? []) as FarconCast[]))
      .catch(() => setCasts([]));
  }, []);

  const refreshEvents = useCallback(async () => {
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const data = await getRomeEvents();
      setEvents(data as RomeEvent[]);
    } catch (error) {
      setEvents([]);
      setEventsError(error instanceof Error ? error.message : "Could not load events right now.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const latestRows = useMemo(() => {
    return [
      ...news.slice(0, 3).map((item) => ({ type: "news" as const, item })),
      ...casts.slice(0, 7).map((cast) => ({ type: "cast" as const, cast })),
    ];
  }, [news, casts]);

  return (
    <div className="h-full overflow-y-auto pb-6">
      <section className="px-4 py-4 bg-navy-bar border-b border-boston-gray-100">
        <h2 className="text-lg font-black uppercase tracking-wide t-sans-white">Happening in Rome Today</h2>
        <p className="text-xs italic t-serif-white opacity-80 mt-1">Rome local time: {romeTime}</p>
        <p className="text-xs t-sans-white opacity-75 mt-1">{weather}</p>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">The Latest in Rome</h3>
        <div className="flex flex-col gap-2">
          {latestRows.map((row, index) => {
            if (row.type === "news") {
              return (
                <a key={`news-${index}`} href={row.item.link} target="_blank" rel="noreferrer" className="block bg-white border border-boston-gray-100 rounded-sm p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest t-sans-blue mb-1">{row.item.source}</p>
                  <p className="text-sm t-sans-navy">{row.item.title}</p>
                  <p className="text-[11px] t-sans-gray mt-1">{new Date(row.item.pubDate).toLocaleString()}</p>
                </a>
              );
            }

            const cast = row.cast;
            const castText = cast.text.length > 180 ? `${cast.text.slice(0, 177)}...` : cast.text;
            const castUrl = `https://farcaster.xyz/~/conversations/${cast.hash}`;

            return (
              <article key={`cast-${cast.hash}`} className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start gap-2">
                  {cast.author.pfp_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cast.author.pfp_url} alt={cast.author.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-boston-gray-100" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest t-sans-navy">@{cast.author.username}</p>
                    <p className="text-sm t-serif-body mt-1">{castText}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] uppercase tracking-widest t-sans-gray">Likes {cast.reactions.likes_count}</span>
                      <a href={castUrl} target="_blank" rel="noreferrer" className="text-[11px] uppercase tracking-widest t-sans-blue underline">
                        View on Farcaster
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-4">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Farcon Events</h3>
        {loadingEvents ? (
          <div className="animate-pulse h-20 rounded-sm bg-boston-gray-100" />
        ) : eventsError ? (
          <div className="border border-boston-gray-200 bg-white rounded-sm p-3">
            <p className="text-xs t-sans-red">{eventsError}</p>
            <button
              type="button"
              onClick={refreshEvents}
              className="mt-2 px-2.5 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy"
            >
              Refresh Events
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="border border-boston-gray-200 bg-white rounded-sm p-3">
            <p className="text-xs t-sans-gray">
              No events are live yet. Add one below or refresh to check for newly synced events.
            </p>
            <button
              type="button"
              onClick={refreshEvents}
              className="mt-2 px-2.5 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy"
            >
              Refresh Events
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => {
              const text = `📅 ${event.title} — ${event.date} in Rome. Get details: ${event.lumaUrl ?? "https://rome-miniapp.com"} #FarconRome`;
              return (
                <article key={event.id} className="border border-boston-gray-100 bg-white rounded-sm p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest t-sans-blue">{event.category ?? "farcon"}</p>
                  <h4 className="text-sm font-black uppercase tracking-wide t-sans-navy mt-1">{event.title}</h4>
                  <p className="text-xs t-serif-body mt-1">{event.description}</p>
                  <p className="text-[11px] uppercase tracking-widest t-sans-gray mt-2">
                    {event.date}
                    {event.startTime ? ` · ${event.startTime}` : ""}
                    {event.endTime ? `-${event.endTime}` : ""}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest t-sans-gray mt-1">{event.location}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {event.lumaUrl && (
                      <a href={event.lumaUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-widest bg-boston-blue text-white">
                        Luma
                      </a>
                    )}
                    <button type="button" onClick={() => shareToFarcaster(text)} className="px-2.5 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-widest bg-navy text-white">
                      Share FC
                    </button>
                    <button type="button" onClick={() => shareToX(text, event.lumaUrl ?? undefined)} className="px-2.5 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy">
                      Share X
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyLink(event.lumaUrl ?? `https://rome-miniapp.com?eventId=${event.id}`);
                        setCopiedEventId(ok ? event.id : null);
                      }}
                      className="px-2.5 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy"
                    >
                      {copiedEventId === event.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowAddEvent(true)}
          className="mt-4 w-full py-2.5 rounded-sm border border-boston-gray-200 text-xs font-bold uppercase tracking-widest t-sans-blue"
        >
          -&gt; Add an Event
        </button>
      </section>

      {showAddEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-xl p-4">
            <h4 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Add an Event</h4>
            <AddEventForm
              onClose={() => setShowAddEvent(false)}
              onSuccess={async () => {
                await refreshEvents();
                setShowAddEvent(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type AddEventFormProps = {
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

function AddEventForm({ onClose, onSuccess }: AddEventFormProps) {
  const { data: user } = useFarcasterUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("INDUSTRIE FLUVIALI");
  const [lumaUrl, setLumaUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    setPending(true);
    setError(null);

    const result = await submitRomeEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime: time || undefined,
      location: location.trim(),
      lumaUrl: lumaUrl.trim() || undefined,
      category: "community",
      submittedByFid: user.fid,
      submittedByUsername: user.username ?? "",
    });

    setPending(false);

    if (!result.success) {
      setError(result.error ?? "Could not submit event.");
      return;
    }

    await onSuccess();
  }

  if (!user) {
    return <p className="text-sm italic t-serif-gray">Sign in with Farcaster to add an event.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input className="submit-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required />
      <textarea className="submit-input submit-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <input
        type="date"
        className="submit-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Event date"
        title="Event date"
        required
      />
      <input className="submit-input" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time (e.g. 18:00)" />
      <input className="submit-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required />
      <input className="submit-input" value={lumaUrl} onChange={(e) => setLumaUrl(e.target.value)} placeholder="Luma URL" />
      {error && <p className="text-xs t-sans-red">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-sm border border-boston-gray-200 text-xs font-bold uppercase tracking-widest t-sans-gray">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="flex-1 py-2.5 rounded-sm bg-navy text-white text-xs font-bold uppercase tracking-widest">
          {pending ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
