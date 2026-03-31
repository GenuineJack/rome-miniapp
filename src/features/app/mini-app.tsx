"use client";

import { useState, useCallback } from "react";
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
import { getSpots, getBuilderByFid } from "@/db/actions/boston-actions";
import type { Builder } from "@/features/boston/types";
import type { WeatherCache } from "@/features/boston/components/weather-strip";
import type { SportsCache } from "@/features/boston/components/sports-row";
import { useEffect } from "react";

type SubmitMode = "picker" | "spot" | "happening";

const TABS: { id: ActiveTab; label: string; icon: string; isCenter?: boolean }[] = [
  { id: "explore", label: "Explore", icon: "🗺" },
  { id: "neighborhoods", label: "Areas", icon: "🏘" },
  { id: "today", label: "Today", icon: "☀️", isCenter: true },
  { id: "builders", label: "Builders", icon: "👥" },
  { id: "new", label: "Community", icon: "✦" },
];

export function MiniApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("explore");
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode>("picker");

  // Lifted state — persists across tab switches
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [spotsError, setSpotsError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(null);
  const [submitterFilter, setSubmitterFilter] = useState<{ fid: number; username: string } | null>(null);

  // Single shared SpotDetailSheet — one instance at the root
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Builder ↔ Spot cross-navigation state
  const [pendingBuilderView, setPendingBuilderView] = useState<Builder | null>(null);

  // Onboarding overlay
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Lifted API caches — survive tab switches for the entire session
  const [weatherCache, setWeatherCache] = useState<WeatherCache>(null);
  const [sportsCache, setSportsCache] = useState<SportsCache>(null);

  useEffect(() => {
    getSpots()
      .then((data) => {
        setSpots(data as Spot[]);
        setSpotsLoading(false);
      })
      .catch(() => {
        setSpotsError(true);
        setSpotsLoading(false);
      });
  }, []);

  // Deep link: ?spotId=... opens spot detail
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const spotId = params.get("spotId");
      if (spotId && spots.length > 0) {
        const match = spots.find((s) => s.id === spotId);
        if (match) setSelectedSpot(match);
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
    <div className="flex flex-col h-dvh overflow-hidden" style={{ background: "#f3f3f3" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: "#091f2f", borderBottom: "3px solid #1871bd" }}
      >
        <div>
          <span
            className="font-black uppercase tracking-tight leading-none block"
            style={{ fontFamily: "var(--font-sans)", color: "#fff", fontSize: "15px" }}
          >
            The Boston Miniapp
          </span>
          <span
            className="leading-none block mt-0.5"
            style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "10px", fontStyle: "italic", opacity: 0.6 }}
          >
            curated by the people who live here
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSubmitMode("picker"); setShowSubmitOverlay(true); }}
            className="transition-colors duration-150"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "9px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#1871bd",
              background: "transparent",
              border: "1px solid #1871bd",
              borderRadius: "2px",
              padding: "4px 12px",
              height: "28px",
              cursor: "pointer",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1871bd";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#1871bd";
            }}
          >
            + ADD
          </button>
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`h-full ${activeTab === "explore" || activeTab === "builders" ? "flex flex-col" : "overflow-y-auto"}`}>
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
              onOpenSubmit={() => { setSubmitMode("happening"); setShowSubmitOverlay(true); }}
              weatherCache={weatherCache}
              onWeatherCacheUpdate={setWeatherCache}
              sportsCache={sportsCache}
              onSportsCacheUpdate={setSportsCache}
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
        </div>

        {/* Submit overlay */}
        {showSubmitOverlay && (
          <div className="absolute inset-0 flex flex-col" style={{ background: "#f3f3f3", zIndex: 50 }}>
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: "#091f2f", borderBottom: "3px solid #1871bd" }}
            >
              <button
                onClick={() => {
                  if (submitMode !== "picker") { setSubmitMode("picker"); }
                  else { setShowSubmitOverlay(false); }
                }}
                className="transition-opacity duration-150 hover:opacity-70"
                style={{
                  fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                ← BACK
              </button>
              <span
                style={{
                  fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)",
                }}
              >
                {submitMode === "spot" ? "Add a Spot" : submitMode === "happening" ? "Add an Event" : "Add to /boston"}
              </span>
              <div style={{ width: "40px" }} />
            </div>

            <div className="flex-1 overflow-y-auto">
              {submitMode === "picker" && (
                <div className="flex flex-col p-6 gap-4">
                  <p className="italic text-center mb-2"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "#828282" }}>
                    What are you adding to the guide?
                  </p>

                  <button
                    onClick={() => setSubmitMode("spot")}
                    className="flex items-start gap-4 p-5 rounded-sm text-left transition-colors duration-150"
                    style={{ background: "#fff", border: "2px solid #e0e0e0", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1871bd"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">📍</span>
                    <div>
                      <p className="font-bold uppercase tracking-widest mb-1"
                        style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#091f2f" }}>
                        Add a Spot
                      </p>
                      <p className="italic leading-snug"
                        style={{ fontFamily: "var(--font-serif)", fontSize: "12px", color: "#828282" }}>
                        A restaurant, bar, park, shop, or hidden gem. Goes into the Explore guide.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSubmitMode("happening")}
                    className="flex items-start gap-4 p-5 rounded-sm text-left transition-colors duration-150"
                    style={{ background: "#fff", border: "2px solid #e0e0e0", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1871bd"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">📅</span>
                    <div>
                      <p className="font-bold uppercase tracking-widest mb-1"
                        style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#091f2f" }}>
                        Add an Event
                      </p>
                      <p className="italic leading-snug"
                        style={{ fontFamily: "var(--font-serif)", fontSize: "12px", color: "#828282" }}>
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
        className="flex items-stretch shrink-0"
        style={{
          background: "#091f2f",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative focus:outline-none"
                style={{ minHeight: "64px" }}
              >
                <div
                  className="flex items-center justify-center transition-colors duration-150"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: isActive ? "#1871bd" : "rgba(24, 113, 189, 0.15)",
                    flexShrink: 0,
                  }}
                >
                  <span className="text-base leading-none" style={{ opacity: isActive ? 1 : 0.6 }}>
                    {tab.icon}
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest leading-none"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: isActive ? "#1871bd" : "rgba(255,255,255,0.45)",
                  }}
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
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors duration-150 focus:outline-none"
              style={{ minHeight: "64px" }}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ width: "60%", height: "3px", background: "#1871bd", borderRadius: "0 0 2px 2px" }}
                />
              )}
              <span className="text-base leading-none" style={{ opacity: isActive ? 1 : 0.45 }}>
                {tab.icon}
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-widest leading-none"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: isActive ? "#1871bd" : "rgba(255,255,255,0.45)",
                }}
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
    </div>
  );
}
