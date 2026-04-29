"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Map, Building2, Sun, Users, Newspaper, Settings, type LucideIcon } from "lucide-react";
import { ActiveTab, Spot, CategoryFilter } from "@/features/boston/types";
import { ExploreTab } from "@/features/boston/tabs/explore-tab";
import { NeighborhoodsTab } from "@/features/boston/tabs/neighborhoods-tab";
import { TodayTab } from "@/features/boston/tabs/today-tab";
import { BuildersTab } from "@/features/boston/tabs/builders-tab";
import { WhatsNewTab } from "@/features/boston/tabs/whats-new-tab";
import { SubmitTab } from "@/features/boston/tabs/submit-tab";
import { SubmitHappeningForm } from "@/features/boston/tabs/submit-happening-form";
import { SpotDetailSheet } from "@/features/boston/components/spot-detail-sheet";
import { OnboardingOverlay } from "@/features/boston/components/onboarding-overlay";
import { WorldCupPage } from "@/features/boston/components/world-cup-page";
import { SettingsSheet } from "@/features/app/settings-sheet";
import { getSpots, getBuilderByFid } from "@/db/actions/boston-actions";
import type { Builder } from "@/features/boston/types";
import type { WeatherCache } from "@/features/boston/components/weather-strip";
import type { SportsCache } from "@/features/boston/components/sports-row";
import type { NewsItem } from "@/app/api/news/route";

type SubmitMode = "picker" | "spot" | "happening";

const TABS: { id: ActiveTab; label: string; icon: LucideIcon; isCenter?: boolean }[] = [
  { id: "explore", label: "Explore", icon: Map },
  { id: "neighborhoods", label: "Areas", icon: Building2 },
  { id: "today", label: "Today", icon: Sun, isCenter: true },
  { id: "builders", label: "Builders", icon: Users },
  { id: "new", label: "Dispatch", icon: Newspaper },
];

export function MiniApp({ initialSpots = [] }: { initialSpots?: Spot[] }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("today");
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode>("picker");

  // Lifted state — persists across tab switches
  const [spots, setSpots] = useState<Spot[]>(initialSpots);
  const [spotsLoading, setSpotsLoading] = useState(initialSpots.length === 0);
  const [spotsError, setSpotsError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(null);
  const [submitterFilter, setSubmitterFilter] = useState<{ fid: number; username: string } | null>(null);

  // Single shared SpotDetailSheet — one instance at the root
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Builder ↔ Spot cross-navigation state
  const [pendingBuilderView, setPendingBuilderView] = useState<Builder | null>(null);

  // Onboarding overlay
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem("boston-onboarding-seen");
    } catch {
      return false;
    }
  });

  // World Cup page overlay
  const [showWorldCup, setShowWorldCup] = useState(false);

  // Settings sheet
  const [showSettings, setShowSettings] = useState(false);

  // Lifted API caches — survive tab switches for the entire session
  const [weatherCache, setWeatherCache] = useState<WeatherCache>(null);
  const [sportsCache, setSportsCache] = useState<SportsCache>(null);
  const [newsCache, setNewsCache] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    // Skip fetch if we already have server-provided data
    if (initialSpots.length > 0) return;
    getSpots()
      .then((data) => {
        setSpots(data as Spot[]);
        setSpotsLoading(false);
      })
      .catch(() => {
        setSpotsError(true);
        setSpotsLoading(false);
      });
  }, [initialSpots.length]);

  // Deep link: ?spotId=... opens spot detail, ?builderId=... opens builder detail
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const spotId = params.get("spotId");
      if (spotId && spots.length > 0) {
        const match = spots.find((s) => s.id === spotId);
        if (match) {
          setSelectedSpot(match);
          setActiveTab("explore");
        }
      }
      const builderId = params.get("builderId");
      if (builderId) {
        import("@/db/actions/boston-actions").then(({ getBuilderByFid }) => {
          getBuilderByFid(Number(builderId)).then((builder) => {
            if (builder) {
              setPendingBuilderView(builder as Builder);
              setActiveTab("builders");
            }
          });
        });
      }
    } catch {
      // ignore
    }
  }, [spots]);

  function handleNavigateToExplore(neighborhoodId: string) {
    setNeighborhoodFilter(neighborhoodId);
    setSubmitterFilter(null);
    setActiveTab("explore");
  }

  function handleClearNeighborhoodFilter() {
    setNeighborhoodFilter(null);
  }

  function handleClearSubmitterFilter() {
    setSubmitterFilter(null);
  }

  function handleViewBuilderSpots(fid: number, username: string) {
    setSubmitterFilter({ fid, username });
    setNeighborhoodFilter(null);
    setActiveTab("explore");
  }

  const handleViewBuilderFromSpot = useCallback(async (fid: number) => {
    const builder = await getBuilderByFid(fid);
    if (builder) {
      setPendingBuilderView(builder as Builder);
      setSelectedSpot(null);
      setActiveTab("builders");
    }
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-boston-gray-50">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0 bg-navy-bar"
      >
        <div>
          <span
            className="font-black uppercase tracking-tight leading-none block t-sans-white text-base"
          >
            The Boston Miniapp
          </span>
          <span
            className="leading-none block mt-0.5 t-serif-white text-xs italic opacity-60"
          >
            curated by the people who live here
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="transition-opacity duration-150 hover:opacity-70 text-white/60 hover:text-white focus:outline-none"
            aria-label="Settings"
          >
            <Settings size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => { setSubmitMode("picker"); setShowSubmitOverlay(true); }}
            className="transition-colors duration-150 t-sans btn-add-header"
            aria-label="Add a spot or event"
          >
            + ADD
          </button>
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className={`h-full ${activeTab === "explore" || activeTab === "builders" ? "flex flex-col" : "overflow-y-auto"}`}
          >
            {activeTab === "explore" && (
              <ExploreTab
                spots={spots}
                loading={spotsLoading}
                error={spotsError}
                activeCategory={activeCategory}
                onCategoryChange={(cat) => {
                  setActiveCategory(cat === activeCategory ? "All" : cat);
                }}
                neighborhoodFilter={neighborhoodFilter}
                onClearNeighborhoodFilter={handleClearNeighborhoodFilter}
                submitterFilter={submitterFilter}
                onClearSubmitterFilter={handleClearSubmitterFilter}
                onSelectSpot={setSelectedSpot}
                onSpotDetailBuilderClick={handleViewBuilderFromSpot}
              />
            )}
            {activeTab === "neighborhoods" && (
              <NeighborhoodsTab onNavigateToExplore={handleNavigateToExplore} onSelectSpot={setSelectedSpot} />
            )}
            {activeTab === "today" && (
              <TodayTab
                onNavigateToNeighborhood={handleNavigateToExplore}
                onOpenWorldCup={() => setShowWorldCup(true)}
                onOpenSubmit={() => { setSubmitMode("happening"); setShowSubmitOverlay(true); }}
                weatherCache={weatherCache}
                onWeatherCacheUpdate={setWeatherCache}
                sportsCache={sportsCache}
                onSportsCacheUpdate={setSportsCache}
                newsCache={newsCache}
                onNewsCacheUpdate={setNewsCache}
              />
            )}
            {activeTab === "builders" && (
              <BuildersTab
                onViewBuilderSpots={handleViewBuilderSpots}
                onSpotClick={setSelectedSpot}
                pendingBuilderView={pendingBuilderView}
                onPendingBuilderViewConsumed={() => setPendingBuilderView(null)}
              />
            )}
            {activeTab === "new" && (
              <WhatsNewTab spots={spots} loading={spotsLoading} onSelectSpot={setSelectedSpot} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Submit overlay */}
        {showSubmitOverlay && (
          <div className="fixed inset-0 flex flex-col bg-boston-gray-50 z-[9999]">
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0 bg-navy-bar"
            >
              <button
                onClick={() => {
                  if (submitMode !== "picker") { setSubmitMode("picker"); }
                  else { setShowSubmitOverlay(false); }
                }}
                className="transition-opacity duration-150 hover:opacity-70 t-sans-white btn-overlay-back"
              >
                ← BACK
              </button>
              <span
                className="t-sans overlay-header-label"
              >
                {submitMode === "spot" ? "Add a Spot" : submitMode === "happening" ? "Add an Event" : "Add to /boston"}
              </span>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {submitMode === "picker" && (
                <div className="flex flex-col p-6 gap-4">
                  <p className="italic text-center mb-2 t-serif-gray text-sm">
                    What are you adding to the guide?
                  </p>

                  <button
                    onClick={() => setSubmitMode("spot")}
                    className="flex items-start gap-4 p-5 rounded-sm text-left transition-colors duration-150 btn-picker-card"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">📍</span>
                    <div>
                      <p className="font-bold uppercase tracking-widest mb-1 t-sans-navy text-xs">
                        Add a Spot
                      </p>
                      <p className="italic leading-snug t-serif-gray text-xs">
                        A restaurant, bar, park, shop, or hidden gem. Goes into the Explore guide.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSubmitMode("happening")}
                    className="flex items-start gap-4 p-5 rounded-sm text-left transition-colors duration-150 btn-picker-card"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">📅</span>
                    <div>
                      <p className="font-bold uppercase tracking-widest mb-1 t-sans-navy text-xs">
                        Add an Event
                      </p>
                      <p className="italic leading-snug t-serif-gray text-xs">
                        Something happening in Boston — a market, show, open studio, pop-up. Goes into Today.
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {submitMode === "spot" && <SubmitTab />}

              {submitMode === "happening" && (
                <SubmitHappeningForm onSuccess={() => setShowSubmitOverlay(false)} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="flex items-stretch shrink-0 nav-bottom"
        role="navigation"
        aria-label="Main navigation"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative focus:outline-none tab-btn"
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={`flex items-center justify-center transition-colors duration-150 tab-circle ${isActive ? "tab-circle-active" : "tab-circle-inactive"}`}
                >
                  <tab.icon
                    size={20}
                    strokeWidth={2}
                    className={isActive ? "" : "opacity-60"}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest leading-none t-sans ${isActive ? "tab-label-active" : "tab-label-inactive"}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors duration-150 focus:outline-none tab-btn"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 tab-indicator"
                />
              )}
              <tab.icon
                size={20}
                strokeWidth={2}
                className={isActive ? "" : "opacity-45"}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] font-bold uppercase tracking-widest leading-none t-sans ${isActive ? "tab-label-active" : "tab-label-inactive"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Single shared SpotDetailSheet — root level, one instance for all tabs */}
      <SpotDetailSheet
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onViewBuilder={handleViewBuilderFromSpot}
      />

      {/* Onboarding overlay — shown once per device */}
      {showOnboarding && (
        <OnboardingOverlay onDismiss={() => setShowOnboarding(false)} />
      )}

      {/* World Cup full-screen page */}
      {showWorldCup && (
        <WorldCupPage
          onBack={() => setShowWorldCup(false)}
          spots={spots}
          onSelectSpot={setSelectedSpot}
        />
      )}

      {/* Settings sheet */}
      {showSettings && (
        <SettingsSheet onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
