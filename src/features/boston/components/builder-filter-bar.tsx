"use client";

import { BUILDER_CATEGORIES, BUILDER_CATEGORY_ICONS, BuilderCategory, NEIGHBORHOODS, REGION_IDS } from "@/features/boston/types";

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
      className="shrink-0"
      style={{ background: "#f3f3f3", borderBottom: "1px solid #e0e0e0" }}
    >
      {/* Category pills — horizontally scrollable */}
      <div className="overflow-x-auto py-3 px-4 no-scrollbar">
        <div className="flex items-center gap-2" style={{ width: "max-content" }}>
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat;
            const icon = cat !== "All" ? BUILDER_CATEGORY_ICONS[cat as BuilderCategory] : "✦";
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-150 focus:outline-none"
                style={{
                  fontFamily: "var(--font-sans)",
                  background: isActive ? "#091f2f" : "transparent",
                  color: isActive ? "#fff" : "#091f2f",
                  border: `1px solid ${isActive ? "#091f2f" : "#c0c0c0"}`,
                  minHeight: "36px",
                }}
              >
                {icon} {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Neighborhood dropdown */}
      <div
        className="flex items-center gap-2 px-4 pb-3"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest shrink-0"
          style={{ color: "#828282" }}
        >
          📍 Neighborhood
        </span>
        <select
          value={activeNeighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          className="flex-1 text-[11px] font-medium focus:outline-none"
          style={{
            fontFamily: "var(--font-sans)",
            color: "#091f2f",
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "3px",
            padding: "6px 8px",
            height: "30px",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23828282' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            paddingRight: "24px",
          }}
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
