"use client";

import sdk from "@farcaster/miniapp-sdk";
import { AnchorHTMLAttributes, MouseEvent, useCallback } from "react";

/**
 * Opens a URL using the Farcaster miniapp SDK so it launches
 * in the system browser instead of navigating the webview.
 *
 * In a regular web browser the SDK call rejects asynchronously, which
 * causes Safari/iOS to drop the user-gesture context by the time
 * `window.open` is called — popup blockers then silently swallow the open.
 *
 * To handle both contexts reliably we synchronously call `window.open`
 * (preserving the user gesture for browsers) AND fire the SDK action.
 * Inside the Farcaster webview, `window.open` is typically blocked or
 * returns `null`; the SDK call takes over and opens the system browser.
 * Outside Farcaster, the SDK call rejects harmlessly.
 */
export function openExternalUrl(url: string) {
  let popup: Window | null = null;
  if (typeof window !== "undefined") {
    try {
      popup = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      popup = null;
    }
  }
  // Also try the Farcaster SDK so in-client launches use the system browser.
  // Only needed if window.open didn't succeed (webview / popup blocked).
  if (!popup) {
    void sdk.actions.openUrl(url).catch(() => {
      // Final fallback: top-level navigation if both paths fail.
      if (typeof window !== "undefined") {
        try {
          window.location.href = url;
        } catch {
          /* noop */
        }
      }
    });
  }
}

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Drop-in replacement for `<a target="_blank">` that uses the Farcaster
 * miniapp SDK to open URLs in the system browser, keeping the mini-app
 * loaded in the background.
 *
 * Falls back to normal `target="_blank"` behavior in non-Farcaster contexts.
 */
export function ExternalLink({ onClick, href, ...rest }: ExternalLinkProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || !href) return;
      e.preventDefault();
      openExternalUrl(href);
    },
    [onClick, href],
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...rest}
    />
  );
}
