"use client";

import { useState, useEffect } from "react";
import { Spot, CommunityHappening, BostonGame } from "@/features/boston/types";
import { getRecentSpots, getCommunityHappenings } from "@/db/actions/boston-actions";
import { WeatherStrip, WeatherCache, WeatherData, fetchWeather, isWeatherCacheFresh } from "@/features/boston/components/weather-strip";
import { SportsRow, SportsCache, fetchAllGames, isSportsCacheFresh, getLocalDateStr } from "@/features/boston/components/sports-row";
import { HappeningsSection } from "@/features/boston/components/happenings-section";
import { SpotFeedCard } from "@/features/boston/components/spot-feed-card";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  onNavigateToNeighborhood: (neighborhoodId: string) => void;
  onNavigateToNew: () => void;
  onOpenSubmit: () => void;
  onSelectSpot: (spot: Spot) => void;
  recentSpots?: Spot[];
  recentSpotsLoading?: boolean;
  // Lifted caches — owned by MiniApp, survive tab switches
  weatherCache: WeatherCache;
  onWeatherCacheUpdate: (cache: WeatherCache) => void;
  sportsCache: SportsCache;
  onSportsCacheUpdate: (cache: SportsCache) => void;
};

// ─── Today Tab ────────────────────────────────────────────────────────────────

export function TodayTab({
  onNavigateToNeighborhood,
  onNavigateToNew,
  onOpenSubmit,
  onSelectSpot,
  recentSpots,
  recentSpotsLoading,
  weatherCache,
  onWeatherCacheUpdate,
  sportsCache,
  onSportsCacheUpdate,
}: Props) {
  const [ownSpots, setOwnSpots] = useState<Spot[]>([]);
  const [ownSpotsLoading, setOwnSpotsLoading] = useState(recentSpots === undefined);
  const [communityHappenings, setCommunityHappenings] = useState<CommunityHappening[]>([]);

  // Loading / error state — local since it's derived from the cache fetch lifecycle
  const [weatherLoading, setWeatherLoading] = useState(!isWeatherCacheFresh(weatherCache));
  const [weatherError, setWeatherError] = useState(false);
  const [sportsLoading, setSportsLoading] = useState(!isSportsCacheFresh(sportsCache));
  const [sportsFailed, setSportsFailed] = useState(false);

  const spots = recentSpots ?? ownSpots;
  const spotsLoading = recentSpots !== undefined ? (recentSpotsLoading ?? false) : ownSpotsLoading;

  const hasParentSpots = recentSpots !== undefined;
  useEffect(() => {
    if (!hasParentSpots) {
      getRecentSpots(5).then((data) => {
        setOwnSpots(data as Spot[]);
        setOwnSpotsLoading(false);
      });
    }
  }, [hasParentSpots]);

  useEffect(() => {
    getCommunityHappenings(20).then((data) => {
      setCommunityHappenings(data as CommunityHappening[]);
    });
  }, []);

  // Fetch weather — use parent cache if fresh, otherwise hit API
  useEffect(() => {
    if (isWeatherCacheFresh(weatherCache)) {
      setWeatherLoading(false);
      return;
    }
    setWeatherLoading(true);
    fetchWeather()
      .then((data) => {
        onWeatherCacheUpdate({ data, timestamp: Date.now() });
        setWeatherLoading(false);
      })
      .catch(() => {
        setWeatherError(true);
        setWeatherLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sports — use parent cache if fresh, otherwise hit ESPN
  useEffect(() => {
    if (isSportsCacheFresh(sportsCache)) {
      setSportsLoading(false);
      return;
    }
    setSportsLoading(true);
    fetchAllGames()
      .then((data) => {
        onSportsCacheUpdate({ data, timestamp: Date.now(), date: getLocalDateStr(new Date()) });
        setSportsLoading(false);
      })
      .catch(() => {
        setSportsFailed(true);
        setSportsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const weatherData: WeatherData | null = weatherCache?.data ?? null;
  const gamesData: BostonGame[] = sportsCache?.data ?? [];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Merged header + weather — single navy bar */}
      <WeatherStrip
        weather={weatherData}
        loading={weatherLoading}
        error={weatherError}
        todayLabel={todayLabel}
      />

      {/* Body */}
      <div className="flex flex-col pb-6">
        {/* Sports */}
        <SportsRow games={gamesData} loading={sportsLoading} fetchFailed={sportsFailed} />

        {/* Happenings */}
        <HappeningsSection
          onNavigateToNeighborhood={onNavigateToNeighborhood}
          communityHappenings={communityHappenings}
        />

        {/* Community section */}
        <div className="px-4" style={{ marginTop: "24px" }}>
          <div
            className="flex items-end justify-between pb-2"
            style={{ borderBottom: "5px solid #091f2f", marginBottom: "12px" }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#091f2f",
              }}
            >
              From the Community
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "9px",
                color: "#828282",
              }}
            >
              Latest submissions
            </span>
          </div>

          {spotsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-sm bg-[#e0e0e0] animate-pulse"
                  style={{ height: "100px" }}
                />
              ))}
            </div>
          ) : spots.length === 0 ? (
            <div className="py-6 text-center">
              <p
                className="font-bold uppercase tracking-widest mb-3"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  color: "#091f2f",
                }}
              >
                No submissions yet.
              </p>
              <p
                className="italic mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "13px",
                  color: "#828282",
                }}
              >
                Be the first to add a spot.
              </p>
              <button
                onClick={onOpenSubmit}
                className="px-5 py-2 rounded-sm font-bold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  background: "#1871bd",
                  color: "#fff",
                  minHeight: "44px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Add Spot
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {spots.map((spot) => (
                <SpotFeedCard key={spot.id} spot={spot} onClick={onSelectSpot} />
              ))}
            </div>
          )}

          {spots.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={onNavigateToNew}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#1871bd",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                See all in What&apos;s New →
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
