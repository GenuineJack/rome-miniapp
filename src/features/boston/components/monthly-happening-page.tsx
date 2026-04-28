"use client";

import { ExternalLink } from "@/neynar-farcaster-sdk/mini";
import type { MonthlyHappening } from "@/db/actions/monthly-happenings-actions";
import { ChevronLeft } from "lucide-react";

type Props = {
  happening: MonthlyHappening;
  onBack: () => void;
};

/**
 * Render a very small subset of markdown the AI is allowed to use:
 * - "## " headings (one per line)
 * - "### " sub-headings
 * - blank-line paragraph separation
 * Everything else is rendered as a plain paragraph.
 *
 * We deliberately avoid pulling a full markdown library here — the AI prompt
 * restricts the grammar and the rendered surface is small and editorial.
 */
function renderBody(body: string): React.ReactNode[] {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="text-sm font-bold uppercase tracking-widest t-sans-navy mt-5 mb-1"
        >
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-lg font-black t-sans-navy leading-tight mt-6 mb-2"
        >
          {block.slice(3)}
        </h2>
      );
    }
    return (
      <p
        key={i}
        className="text-[14px] leading-relaxed t-serif-body mb-3"
      >
        {block}
      </p>
    );
  });
}

export function MonthlyHappeningPage({ happening, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* Hero */}
      <div className="bg-navy px-4 pt-4 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-opacity t-sans"
        >
          <ChevronLeft size={14} strokeWidth={2.5} aria-hidden="true" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{happening.emoji}</span>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white t-sans leading-tight">
              {happening.title}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-boston-blue t-sans mt-1">
              This month in Boston
            </p>
          </div>
        </div>
        {happening.summary && (
          <p className="text-[13px] italic leading-relaxed t-serif text-white/80 mt-3">
            {happening.summary}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-5">{renderBody(happening.body)}</div>

      {/* Source links */}
      {happening.sourceLinks.length > 0 && (
        <div className="px-4 pb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest t-sans-gray mb-2">
            Sources
          </h3>
          <ul className="flex flex-col gap-1">
            {happening.sourceLinks.map((link, i) => (
              <li key={i}>
                <ExternalLink
                  href={link.url}
                  className="text-[13px] t-sans-blue hover:underline"
                >
                  {link.label} →
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
