"use client";

import sdk from "@farcaster/miniapp-sdk";

export async function shareToFarcaster(text: string) {
  try {
    await sdk.actions.composeCast({ text });
    return { success: true, method: "sdk" as const };
  } catch {
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return { success: false, method: "warpcast" as const };
  }
}

export function shareToX(text: string, url?: string) {
  if (typeof window === "undefined") return;
  const payload = url ? `${text} ${url}` : text;
  const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(payload)}`;
  window.open(intent, "_blank", "noopener,noreferrer");
}

export async function copyLink(url: string) {
  if (typeof navigator === "undefined") return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
