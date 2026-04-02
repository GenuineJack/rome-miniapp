"use client";

import { Category, CATEGORIES, CATEGORY_ICONS, CategoryFilter } from "@/features/boston/types";

const EXTRA_FILTERS: { id: CategoryFilter; icon: string }[] = [
  { id: "Tourist Picks", icon: "✈️" },
];

type CategoryFilterBarProps = {
  active: CategoryFilter;
  onChange: (cat: CategoryFilter) => void;
};

export function CategoryFilterBar({ active, onChange }: CategoryFilterBarProps) {
  const all: CategoryFilter[] = ["All", ...EXTRA_FILTERS.map(f => f.id), ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
      {all.map((cat) => {
        const isActive = active === cat;
        const extra = EXTRA_FILTERS.find(f => f.id === cat);
        const icon = extra ? extra.icon : cat !== "All" ? CATEGORY_ICONS[cat as Category] : "✦";
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none t-sans cat-filter-btn ${
              isActive ? "bg-navy text-white" : "bg-transparent text-navy"
            }`}
          >
            <span>{icon}</span>
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
