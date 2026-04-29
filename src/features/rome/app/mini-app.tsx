"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, Plane, Sun, Users, Newspaper, type LucideIcon } from "lucide-react";
import { ExploreTab, AddSpotForm } from "@/features/rome/tabs/explore-tab";
import { TodayTab, AddEventForm } from "@/features/rome/tabs/today-tab";
import { VivereTab } from "@/features/rome/tabs/vivere-tab";
import { AttendeesTab } from "@/features/rome/tabs/attendees-tab";
import { DispatchTab } from "@/features/rome/tabs/dispatch-tab";
import { SpotDetailSheet } from "@/features/rome/components/spot-detail-sheet";
import { getRomeSpots } from "@/db/actions/rome-actions";
import type { RomeSpot } from "@/features/rome/types";

type ActiveTab = "explore" | "vivere" | "today" | "attendees" | "dispatch";

const TABS: { id: ActiveTab; label: string; icon: LucideIcon; isCenter?: boolean }[] = [
  { id: "explore", label: "Explore", icon: Map },
  { id: "vivere", label: "Vivere", icon: Plane },
  { id: "today", label: "Today", icon: Sun, isCenter: true },
  { id: "attendees", label: "Attendees", icon: Users },
  { id: "dispatch", label: "Dispatch", icon: Newspaper },
];

export function MiniApp({ initialSpots = [] }: { initialSpots?: RomeSpot[] }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("today");
  const [spots, setSpots] = useState<RomeSpot[]>(initialSpots);
  const [loadingSpots, setLoadingSpots] = useState(initialSpots.length === 0);
  const [selectedSpot, setSelectedSpot] = useState<RomeSpot | null>(null);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  async function refreshSpots() {
    setLoadingSpots(true);
    const rows = await getRomeSpots();
    setSpots(rows as RomeSpot[]);
    setLoadingSpots(false);
  }

  useEffect(() => {
    if (initialSpots.length > 0) return;
    refreshSpots();
  }, [initialSpots.length]);

  const categories = useMemo(() => {
    const unique = new Set(spots.map((spot) => spot.category));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [spots]);

  function openSpotFromDispatch(spotId: string) {
    const spot = spots.find((row) => row.id === spotId);
    if (!spot) {
      setActiveTab("explore");
      return;
    }
    setActiveTab("explore");
    setSelectedSpot(spot);
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-boston-gray-50">
      <header className="flex items-center justify-between px-4 py-3 shrink-0 bg-navy-bar">
        <div>
          <p className="font-black uppercase tracking-tight leading-none block t-sans-white text-base">The Rome Miniapp</p>
          <p className="leading-none block mt-0.5 t-serif-white text-xs italic opacity-60">for the builders who showed up</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddPicker(true)}
            className="transition-colors duration-150 t-sans btn-add-header"
            aria-label="Add a spot or event"
          >
            + ADD
          </button>
          {showAddPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddPicker(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-boston-gray-200 rounded-sm shadow-md min-w-[140px]">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest t-sans-navy hover:bg-boston-gray-50"
                  onClick={() => { setShowAddPicker(false); setShowAddSpot(true); }}
                >
                  Add a Spot
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest t-sans-navy hover:bg-boston-gray-50 border-t border-boston-gray-100"
                  onClick={() => { setShowAddPicker(false); setShowAddEvent(true); }}
                >
                  Add an Event
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === "explore" && (
          <ExploreTab spots={spots} loading={loadingSpots} onSelectSpot={setSelectedSpot} />
        )}
        {activeTab === "vivere" && <VivereTab />}
        {activeTab === "today" && <TodayTab />}
        {activeTab === "attendees" && <AttendeesTab />}
        {activeTab === "dispatch" && <DispatchTab onOpenSpot={openSpotFromDispatch} />}
      </main>

      <nav className="flex items-stretch shrink-0 nav-bottom" role="navigation" aria-label="Main navigation">
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
                <div className={`flex items-center justify-center transition-colors duration-150 tab-circle ${isActive ? "tab-circle-active" : "tab-circle-inactive"}`}>
                  <tab.icon size={20} strokeWidth={2} className={isActive ? "text-white" : "text-white opacity-60"} aria-hidden="true" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-widest leading-none t-sans ${isActive ? "tab-label-active" : "tab-label-inactive"}`}>
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
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 tab-indicator" />}
              <tab.icon size={20} strokeWidth={2} className={isActive ? "text-white" : "text-white opacity-45"} aria-hidden="true" />
              <span className={`text-[11px] font-bold uppercase tracking-widest leading-none t-sans ${isActive ? "tab-label-active" : "tab-label-inactive"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <SpotDetailSheet spot={selectedSpot} onClose={() => setSelectedSpot(null)} />

      {showAddSpot && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center sm:justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-xl p-4">
            <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Add Spot</h3>
            <AddSpotForm
              categories={categories}
              onSuccess={refreshSpots}
              onClose={() => setShowAddSpot(false)}
            />
          </div>
        </div>
      )}

      {showAddEvent && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center sm:justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-xl p-4">
            <h4 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Add an Event</h4>
            <AddEventForm
              onClose={() => setShowAddEvent(false)}
              onSuccess={() => setShowAddEvent(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
