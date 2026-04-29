"use client";

import { BUILDER_CATEGORIES, BUILDER_CATEGORY_LUCIDE, BuilderCategory, NEIGHBORHOODS, REGION_IDS } from "@/features/rome/types";
import { Sparkles } from "lucide-react";

const CITY_NEIGHBORHOODS = NEIGHBORHOODS.filter((n) => !REGION_IDS.has(n.id));
const REGIONS = NEIGHBORHOODS.filter((n) => REGION_IDS.has(n.id));

type BuilderFilterBarProps = {
  activeCategory: string;
  activeNeighborhood: string;
  onCategoryChange: (cat: string) => void;
  onNeighborhoodChange: (nbr: string) => void;
};

export function BuilderFilterBar({
  activeCategory,
  activeNeighborhood,
  onCategoryChange,
  onNeighborhoodChange,
}: BuilderFilterBarProps) {
  const allCategories = ["All", ...BUILDER_CATEGORIES];

  return (
    <div
      className="shrink-0 bg-boston-gray-50 border-b border-boston-gray-100"
    >
      {/* Category pills — horizontally scrollable */}
      <div className="overflow-x-auto py-3 px-4 no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat;
            const Icon = cat !== "All" ? (BUILDER_CATEGORY_LUCIDE[cat as BuilderCategory] ?? Sparkles) : Sparkles;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`t-sans inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-150 focus:outline-none min-h-9 border ${
                  isActive
                    ? "bg-navy text-white border-navy"
                    : "bg-transparent text-navy border-boston-gray-200"
                }`}
              >
                <Icon size={14} aria-hidden="true" /> {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Neighborhood dropdown */}
      <div
        className="t-sans flex items-center gap-2 px-4 pb-3"
      >
        <span
          className="text-xs font-bold uppercase tracking-widest shrink-0 text-boston-gray-400"
        >
          📍 Neighborhood
        </span>
        <select
          value={activeNeighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          aria-label="Filter by neighborhood"
          className="t-sans-navy bg-white flex-1 text-xs font-medium focus:outline-none select-filter"
        >
          <option value="All">All neighborhoods</option>
          <optgroup label="Boston Neighborhoods">
            {CITY_NEIGHBORHOODS.map((n) => (
              <option key={n.id} value={n.name}>
                {n.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Greater Region">
            {REGIONS.map((n) => (
              <option key={n.id} value={n.name}>
                {n.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
}
