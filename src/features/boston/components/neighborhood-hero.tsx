"use client";

import type { NeighborhoodInfo } from "@/features/boston/types";

type Props = {
  neighborhood: NeighborhoodInfo;
  className?: string;
};

export function NeighborhoodHero({ neighborhood, className = "" }: Props) {
  if (!neighborhood.heroImageUrl) {
    return (
      <div className={`relative w-full overflow-hidden bg-navy ${className}`} style={{ aspectRatio: "1200/400" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 t-sans mb-1">
            Boston
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white t-sans leading-none text-center">
            {neighborhood.name}
          </h2>
          <p className="text-xs italic text-white/60 t-serif mt-1.5 text-center max-w-xs">
            {neighborhood.tagline}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: "1200/400" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={neighborhood.heroImageUrl}
        alt={neighborhood.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 t-sans mb-0.5">
          Boston
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white t-sans leading-none">
          {neighborhood.name}
        </h2>
        <p className="text-xs italic text-white/70 t-serif mt-1">
          {neighborhood.tagline}
        </p>
      </div>
    </div>
  );
}
