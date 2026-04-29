"use client";

import { useEffect, useState } from "react";
import { ExternalLink, openExternalUrl } from "@/neynar-farcaster-sdk/mini";
import { copyLink, shareToFarcaster } from "@/features/rome/utils/share";
import type { RomeSpot } from "@/features/rome/types";

type SpotDetailSheetProps = {
  spot: RomeSpot | null;
  onClose: () => void;
};

export function SpotDetailSheet({ spot, onClose }: SpotDetailSheetProps) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (!spot) return null;
  const currentSpot = spot;

  const spotUrl = `https://rome-miniapp.com?spotId=${currentSpot.id}`;

  async function onShareToFarcaster() {
    const text = `📍 ${currentSpot.name} — ${currentSpot.neighborhood}, Rome. via @rome-miniapp ${spotUrl}`;
    await shareToFarcaster(text);
  }

  async function onCopyLink() {
    const ok = await copyLink(spotUrl);
    setToast(ok ? "Link copied" : "Copy failed");
  }

  function onMaps() {
    const query = encodeURIComponent(currentSpot.address ?? `${currentSpot.name} ${currentSpot.neighborhood} Rome`);
    openExternalUrl(`https://maps.google.com/?q=${query}`);
  }

  return (
    <>
      <button
        aria-label="Close"
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        type="button"
      />

      <section className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-4 max-h-[78vh] overflow-y-auto">
        <div className="w-12 h-1 rounded-full bg-boston-gray-200 mx-auto mb-3" />

        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest bg-boston-blue text-white">
            {currentSpot.category}
          </span>
          {currentSpot.featured && (
            <span className="px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest bg-boston-yellow text-black">
              Featured
            </span>
          )}
        </div>

        <h3 className="text-lg font-black uppercase tracking-wide t-sans-navy mb-1">{currentSpot.name}</h3>
        <p className="text-sm italic t-serif-body mb-3">{currentSpot.description}</p>

        <p className="text-xs font-bold uppercase tracking-widest t-sans-gray mb-1">{currentSpot.neighborhood}</p>
        {currentSpot.address && <p className="text-xs t-sans-gray mb-3">{currentSpot.address}</p>}

        {currentSpot.link && (
          <ExternalLink href={currentSpot.link} className="inline-flex mb-4 text-xs underline t-sans-blue">
            Visit website
          </ExternalLink>
        )}

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button type="button" onClick={onMaps} className="py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest bg-boston-blue text-white">
            Open in Maps
          </button>
          <button type="button" onClick={onShareToFarcaster} className="py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest bg-navy text-white">
            Share to Farcaster
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onCopyLink} className="py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy">
            Share Link
          </button>
          <button type="button" onClick={onClose} className="py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-gray">
            Close
          </button>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] rounded-sm bg-navy px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
          {toast}
        </div>
      )}
    </>
  );
}
