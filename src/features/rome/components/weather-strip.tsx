"use client";

import { useState, useEffect } from "react";

export type WeatherData = {
  tempF: number;
  condition: string;
  emoji: string;
  highF: number;
  lowF: number;
  updatedAt: string;
};

export type MbtaAlert = {
  text: string;
  routes: string[];
  severity: number;
};

export type WeatherCache = {
  data: WeatherData;
  mbtaAlert?: MbtaAlert | null;
  timestamp: number;
} | null;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getWeatherCondition(code: number): { condition: string; emoji: string } {
  if (code === 0) return { condition: "Clear", emoji: "☀️" };
  if (code <= 3) return { condition: "Partly Cloudy", emoji: "⛅" };
  if (code === 45 || code === 48) return { condition: "Foggy", emoji: "🌫️" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", emoji: "🌧️" };
  if (code >= 61 && code <= 67) return { condition: "Rain", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { condition: "Snow", emoji: "🌨️" };
  if (code >= 80 && code <= 82) return { condition: "Showers", emoji: "🌧️" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", emoji: "⛈️" };
  return { condition: "Overcast", emoji: "☁️" };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export async function fetchWeather(): Promise<WeatherData> {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=42.3601&longitude=-71.0589&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Weather fetch failed");

  const json = await res.json();
  const current = json.current;
  const daily = json.daily;

  const { condition, emoji } = getWeatherCondition(current.weather_code);

  return {
    tempF: Math.round(current.temperature_2m),
    condition,
    emoji,
    highF: Math.round(daily.temperature_2m_max[0]),
    lowF: Math.round(daily.temperature_2m_min[0]),
    updatedAt: formatTime(new Date()),
  };
}

export function isWeatherCacheFresh(cache: WeatherCache): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
}

export async function fetchMbtaAlert(): Promise<MbtaAlert | null> {
  try {
    const res = await fetch("/api/mbta");
    if (!res.ok) return null;
    const json = await res.json();
    return json.alert ?? null;
  } catch {
    return null;
  }
}

function shortenMbtaAlert(text: string): string {
  // Shorten common MBTA alert patterns for the one-line strip
  return text
    .replace(/Shuttle buses replacing .+ service /i, "Shuttle replacing ")
    .replace(/Delays of .+ minutes? /i, "Delays ")
    .slice(0, 60)
    .trim();
}

// ─── Component ────────────────────────────────────────────────────────────────
// Stateless — all data and state come from props managed by TodayTab.

type WeatherStripProps = {
  weather: WeatherData | null;
  loading: boolean;
  error: boolean;
  todayLabel: string;
  mbtaAlert?: MbtaAlert | null;
  countdown?: string | null;
};

export function WeatherStrip({ weather, loading, error, todayLabel, mbtaAlert, countdown }: WeatherStripProps) {
  const [bostonTime, setBostonTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", hour12: true })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBostonTime(
        new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", hour12: true })
      );
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="shrink-0 px-4 py-3 bg-navy-bar"
    >
      {/* Context strip — one-line weather + countdown */}
      {!loading && weather && countdown && (
        <div className="text-xs text-white/70 mb-2 t-sans flex items-center gap-1.5 flex-wrap">
          <span>{weather.emoji} {weather.tempF}°F</span>
          {countdown && (
            <>
              <span className="opacity-40">·</span>
              <span>{countdown}</span>
            </>
          )}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-between animate-pulse">
          <div>
            <div className="h-5 w-32 rounded bg-white/10 mb-1" />
            <div className="h-3 w-48 rounded bg-white/10" />
          </div>
          <div className="text-right">
            <div className="h-8 w-20 rounded bg-white/10 mb-1" />
            <div className="h-3 w-24 rounded bg-white/10" />
          </div>
        </div>
      ) : error || !weather ? (
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="font-black uppercase tracking-tight text-white t-sans weather-title"
            >
              Today in Boston
            </h2>
            <p
              className="italic opacity-60 text-white mt-0.5 t-serif weather-date"
            >
              {todayLabel}
            </p>
            <p
              className="t-sans weather-time"
            >
              {bostonTime} ET
            </p>
          </div>
          <p
            className="italic t-serif weather-unavailable"
          >
            Weather unavailable
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          {/* Left: title + date */}
          <div className="min-w-0">
            <h2
              className="font-black uppercase tracking-tight text-white leading-none t-sans weather-title-sm"
            >
              Today in Boston
            </h2>
            <p
              className="italic text-white mt-0.5 leading-none t-serif weather-date-sm"
            >
              {todayLabel}
            </p>
            <p
              className="t-sans weather-time-sm"
            >
              {bostonTime} ET
            </p>
          </div>

          {/* Right: weather */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl leading-none">{weather.emoji}</span>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span
                  className="t-sans-white weather-temp"
                >
                  {weather.tempF}°F
                </span>
              </div>
              <p
                className="italic t-serif weather-condition"
              >
                {weather.condition}
              </p>
              <p
                className="t-sans weather-hilo"
              >
                H:{weather.highF}° L:{weather.lowF}°
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
