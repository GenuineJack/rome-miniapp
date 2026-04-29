"use client";

import { Category, CATEGORIES, CATEGORY_LUCIDE, CategoryFilter } from "@/features/rome/types";
import { Plane, Sparkles, type LucideIcon } from "lucide-react";

const EXTRA_FILTERS: { id: CategoryFilter; icon: LucideIcon }[] = [
  { id: "Tourist Picks", icon: Plane },
];

type CategoryFilterBarProps = {
  active: CategoryFilter;
  onChange: (cat: CategoryFilter) => void;
};

export function CategoryFilterBar({ active, onChange }: CategoryFilterBarProps) {
  const all: CategoryFilter[] = ["All", ...EXTRA_FILTERS.map(f => f.id), ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible px-4 pb-2 scrollbar-hide md:scrollbar-default">
      {all.map((cat) => {
        const isActive = active === cat;
        const extra = EXTRA_FILTERS.find(f => f.id === cat);
        const Icon: LucideIcon = extra ? extra.icon : cat !== "All" ? (CATEGORY_LUCIDE[cat as Category] ?? Sparkles) : Sparkles;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 md:shrink flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors duration-150 focus:outline-none t-sans cat-filter-btn ${
              isActive ? "cat-filter-active" : "cat-filter-inactive"
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
