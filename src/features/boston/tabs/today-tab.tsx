"use client";

import { useState, useEffect } from "react";
import { CommunityHappening, BostonGame } from "@/features/boston/types";
import { getCommunityHappenings } from "@/db/actions/boston-actions";
import { WeatherStrip, WeatherCache, WeatherData, fetchWeather, isWeatherCacheFresh, fetchMbtaAlert, MbtaAlert } from "@/features/boston/components/weather-strip";
import { SportsRow, SportsCache, fetchAllGames, isSportsCacheFresh, getLocalDateStr } from "@/features/boston/components/sports-row";
import { HappeningsSection } from "@/features/boston/components/happenings-section";
import { TeamDetailSheet } from "@/features/boston/components/team-detail-sheet";
import { NewsSection } from "@/features/boston/components/news-section";
import { getTimeContext } from "@/features/boston/utils/time-context";
import type { NewsItem } from "@/app/api/news/route";

// ─── MBTA Scrolling Marquee ───────────────────────────────────────────────────

function MbtaMarquee({ alert }: { alert: MbtaAlert | null }) {
  const text = alert ? `🚇 MBTA Alert: ${alert.text}` : "🚇 MBTA: All lines running on schedule";
  return (
    <div className="bg-boston-gray-50 border-b border-boston-gray-100 overflow-hidden whitespace-nowrap">
      <div className="inline-flex animate-marquee py-1.5">
        <span className="text-xs font-bold uppercase tracking-wide t-sans px-4" style={{ color: "#091f2f" }}>
          {text}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide t-sans px-4" style={{ color: "#091f2f" }}>
          {text}
        </span>
      </div>
    </div>
  );
}

type Props = {
  onNavigateToNeighborhood: (neighborhoodId: string) => void;
  onOpenWorldCup?: () => void;
  onOpenSubmit: () => void;
  weatherCache: WeatherCache;
  onWeatherCacheUpdate: (cache: WeatherCache) => void;
  sportsCache: SportsCache;
  onSportsCacheUpdate: (cache: SportsCache) => void;
  newsCache: NewsItem[] | null;
  onNewsCacheUpdate: (items: NewsItem[]) => void;
};

export function TodayTab({
  onNavigateToNeighborhood,
  onOpenWorldCup,
  onOpenSubmit: _onOpenSubmit,
  weatherCache,
  onWeatherCacheUpdate,
  sportsCache,
  onSportsCacheUpdate,
  newsCache,
  onNewsCacheUpdate,
}: Props) {
  const [communityHappenings, setCommunityHappenings] = useState<CommunityHappening[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(!isWeatherCacheFresh(weatherCache));
  const [weatherError, setWeatherError] = useState(false);
  const [sportsLoading, setSportsLoading] = useState(!isSportsCacheFresh(sportsCache));
  const [sportsFailed, setSportsFailed] = useState(false);
  const [mbtaAlert, setMbtaAlert] = useState<MbtaAlert | null>(
    weatherCache?.mbtaAlert ?? null,
  );
  const [todayIntro, setTodayIntro] = useState<string | null>(null);

  useEffect(() => {
    getCommunityHappenings(20).then((data) => setCommunityHappenings(data as CommunityHappening[]));
  }, []);

  // Fetch the daily AI intro from the dispatch
  useEffect(() => {
    fetch("/api/dispatch/today")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        if (data.dispatch?.todayIntro) setTodayIntro(data.dispatch.todayIntro);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isWeatherCacheFresh(weatherCache)) { setWeatherLoading(false); return; }
    setWeatherLoading(true);
    Promise.all([fetchWeather(), fetchMbtaAlert()])
      .then(([data, alert]) => {
        setMbtaAlert(alert);
        onWeatherCacheUpdate({ data, mbtaAlert: alert, timestamp: Date.now() });
        setWeatherLoading(false);
      })
      .catch(() => { setWeatherError(true); setWeatherLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSportsCacheFresh(sportsCache)) { setSportsLoading(false); return; }
    setSportsLoading(true);
    fetchAllGames()
      .then((data) => { onSportsCacheUpdate({ data, timestamp: Date.now(), date: getLocalDateStr(new Date()) }); setSportsLoading(false); })
      .catch(() => { setSportsFailed(true); setSportsLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const weatherData: WeatherData | null = weatherCache?.data ?? null;
  const gamesData: BostonGame[] = sportsCache?.data ?? [];

  // Time-based section ordering: evening → sports first, morning → news first
  const timeCtx = getTimeContext();
  const sportsFirst = timeCtx === "evening" || timeCtx === "late-night";

  const sportsSection = <SportsRow games={gamesData} loading={sportsLoading} fetchFailed={sportsFailed} onTeamClick={setSelectedTeam} />;
  const newsSection = <NewsSection cachedNews={newsCache} onNewsLoaded={onNewsCacheUpdate} />;
  const happeningsSection = <HappeningsSection onNavigateToNeighborhood={onNavigateToNeighborhood} onOpenWorldCup={onOpenWorldCup} communityHappenings={communityHappenings} />;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <WeatherStrip weather={weatherData} loading={weatherLoading} error={weatherError} todayLabel={todayLabel} mbtaAlert={mbtaAlert} />
      <MbtaMarquee alert={mbtaAlert} />
      {todayIntro && (
        <div className="px-4 py-2.5 border-b border-boston-gray-100 bg-white">
          <p className="text-sm italic leading-snug t-serif-body">{todayIntro}</p>
        </div>
      )}
      <div className="flex flex-col pb-6">
        {sportsFirst ? (
          <>{sportsSection}{newsSection}{happeningsSection}</>
        ) : (
          <>{newsSection}{sportsSection}{happeningsSection}</>
        )}
      </div>

      {/* Team detail overlay */}
      <TeamDetailSheet
        teamName={selectedTeam}
        games={gamesData}
        onClose={() => setSelectedTeam(null)}
      />
    </div>
  );
}
