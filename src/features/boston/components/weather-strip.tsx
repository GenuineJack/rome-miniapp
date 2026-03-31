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

export type WeatherCache = {
  data: WeatherData;
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

// ─── Component ────────────────────────────────────────────────────────────────
// Stateless — all data and state come from props managed by TodayTab.

type WeatherStripProps = {
  weather: WeatherData | null;
  loading: boolean;
  error: boolean;
  todayLabel: string;
};

export function WeatherStrip({ weather, loading, error, todayLabel }: WeatherStripProps) {
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
              className="font-black uppercase tracking-tight text-white t-sans"
              style={{ fontSize: "16px" }}
            >
              Today in Boston
            </h2>
            <p
              className="italic opacity-60 text-white mt-0.5 t-serif"
              style={{ fontSize: "11px" }}
            >
              {todayLabel}
            </p>
            <p
              className="t-sans"
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}
            >
              {bostonTime} ET
            </p>
          </div>
          <p
            className="italic t-serif"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
          >
            Weather unavailable
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          {/* Left: title + date */}
          <div className="min-w-0">
            <h2
              className="font-black uppercase tracking-tight text-white leading-none t-sans"
              style={{ fontSize: "15px" }}
            >
              Today in Boston
            </h2>
            <p
              className="italic text-white mt-0.5 leading-none t-serif"
              style={{ fontSize: "10px", opacity: 0.6 }}
            >
              {todayLabel}
            </p>
            <p
              className="t-sans"
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "3px", lineHeight: 1 }}
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
                  className="t-sans-white"
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    lineHeight: 1,
                  }}
                >
                  {weather.tempF}°F
                </span>
              </div>
              <p
                className="italic t-serif"
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.2,
                }}
              >
                {weather.condition}
              </p>
              <p
                className="t-sans"
                style={{
                  fontSize: "9px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.3,
                }}
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
