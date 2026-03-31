"use client";

import { useState, useEffect } from "react";
import { CommunityHappening, BostonGame } from "@/features/boston/types";
import { getCommunityHappenings } from "@/db/actions/boston-actions";
import { WeatherStrip, WeatherCache, WeatherData, fetchWeather, isWeatherCacheFresh } from "@/features/boston/components/weather-strip";
import { SportsRow, SportsCache, fetchAllGames, isSportsCacheFresh, getLocalDateStr } from "@/features/boston/components/sports-row";
import { HappeningsSection } from "@/features/boston/components/happenings-section";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  onNavigateToNeighborhood: (neighborhoodId: string) => void;
  onOpenSubmit: () => void;
  // Lifted caches — owned by MiniApp, survive tab switches
  weatherCache: WeatherCache;
  onWeatherCacheUpdate: (cache: WeatherCache) => void;
  sportsCache: SportsCache;
  onSportsCacheUpdate: (cache: SportsCache) => void;
};

// ─── Today Tab ────────────────────────────────────────────────────────────────

export function TodayTab({
  onNavigateToNeighborhood,
  onOpenSubmit,
  weatherCache,
  onWeatherCacheUpdate,
  sportsCache,
  onSportsCacheUpdate,
}: Props) {
  const [communityHappenings, setCommunityHappenings] = useState<CommunityHappening[]>([]);

  // Loading / error state — local since it's derived from the cache fetch lifecycle
  const [weatherLoading, setWeatherLoading] = useState(!isWeatherCacheFresh(weatherCache));
  const [weatherError, setWeatherError] = useState(false);
  const [sportsLoading, setSportsLoading] = useState(!isSportsCacheFresh(sportsCache));
  const [sportsFailed, setSportsFailed] = useState(false);

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
      </div>

    </div>
  );
}
