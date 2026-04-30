"use client";

import sdk from "@farcaster/miniapp-sdk";
import { publicConfig } from "@/config/public-config";
import { buildComposeUrl } from "@/lib/farcaster-urls";

type MiniAppNavigator = {
  isInMiniApp?: () => Promise<boolean>;
};

type MiniAppActions = {
  viewCast?: (options: { hash: string; authorUsername?: string }) => Promise<void>;
  viewProfile?: (options: { fid: number }) => Promise<void>;
};

let miniAppContextHint: boolean | null = null;

function getMiniAppNavigator(): MiniAppNavigator {
  return sdk as unknown as MiniAppNavigator;
}

function getMiniAppActions(): MiniAppActions {
  return sdk.actions as unknown as MiniAppActions;
}

function normalizeCastHash(hash: string): string | null {
  const trimmed = hash.trim().toLowerCase();
  if (!trimmed) return null;
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-f]+$/.test(withPrefix)) return null;
  return withPrefix;
}

function normalizeUsername(username?: string): string | undefined {
  if (!username) return undefined;
  const trimmed = username.trim().replace(/^@/, "");
  return trimmed || undefined;
}

function inferMiniAppContextSync() {
  if (typeof window === "undefined") return false;
  if (window.self !== window.top) return true;
  const withWebView = window as Window & { ReactNativeWebView?: unknown };
  return Boolean(withWebView.ReactNativeWebView);
}

function hydrateMiniAppContextHint() {
  const navigator = getMiniAppNavigator();
  if (typeof navigator.isInMiniApp !== "function") return;
  void navigator
    .isInMiniApp()
    .then((result) => {
      miniAppContextHint = result;
    })
    .catch(() => {
      /* noop */
    });
}

if (typeof window !== "undefined") {
  miniAppContextHint = inferMiniAppContextSync();
  hydrateMiniAppContextHint();
}

export function shouldUseMiniAppNavigation() {
  if (miniAppContextHint !== null) return miniAppContextHint;
  miniAppContextHint = inferMiniAppContextSync();
  hydrateMiniAppContextHint();
  return miniAppContextHint;
}

type AddMiniAppReason =
  | "rejected_by_user"
  | "invalid_domain_manifest"
  | "unavailable_context"
  | "unknown_error";

export type AddMiniAppOutcome =
  | {
      success: true;
      source: string;
      notificationEnabled: boolean;
    }
  | {
      success: false;
      source: string;
      reason: AddMiniAppReason;
    };

type AddMiniAppLogContext = {
  source: string;
  host: string;
  canonicalDomain: string;
  homeUrl: string;
};

function getErrorSignals(error: unknown) {
  if (!error) return "";

  if (typeof error === "string") {
    return error.toLowerCase();
  }

  if (typeof error === "object") {
    const candidate = error as {
      name?: unknown;
      message?: unknown;
      reason?: unknown;
      type?: unknown;
      code?: unknown;
    };
    const values = [
      candidate.name,
      candidate.message,
      candidate.reason,
      candidate.type,
      candidate.code,
    ]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.toLowerCase());

    return values.join(" ");
  }

  return "";
}

function classifyAddMiniAppError(error: unknown): AddMiniAppReason {
  const signals = getErrorSignals(error);

  if (!signals) {
    return "unknown_error";
  }

  if (
    signals.includes("addminiapp.rejectedbyuser") ||
    signals.includes("rejectedbyuser") ||
    signals.includes("rejected_by_user") ||
    signals.includes("rejected by user")
  ) {
    return "rejected_by_user";
  }

  if (
    signals.includes("addminiapp.invaliddomainmanifest") ||
    signals.includes("invaliddomainmanifestjson") ||
    signals.includes("invalid_domain_manifest") ||
    signals.includes("invalid domain manifest") ||
    signals.includes("manifest")
  ) {
    return "invalid_domain_manifest";
  }

  if (
    signals.includes("miniapp") ||
    signals.includes("context") ||
    signals.includes("not available") ||
    signals.includes("unsupported")
  ) {
    return "unavailable_context";
  }

  return "unknown_error";
}

function emitAddMiniAppTelemetry(
  outcome: AddMiniAppOutcome,
  context: AddMiniAppLogContext,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("rome:add-miniapp", {
      detail: {
        ...outcome,
        ...context,
      },
    }),
  );
}

export async function addMiniAppWithHandling(source: string): Promise<AddMiniAppOutcome> {
  const context: AddMiniAppLogContext = {
    source,
    host: typeof window !== "undefined" ? window.location.hostname : "unknown",
    canonicalDomain: publicConfig.canonicalDomain,
    homeUrl: publicConfig.homeUrl,
  };

  try {
    const result = await sdk.actions.addMiniApp();
    const outcome: AddMiniAppOutcome = {
      success: true,
      source,
      notificationEnabled: Boolean(result.notificationDetails),
    };

    console.info("[Add Mini App] Success", {
      ...context,
      notificationEnabled: outcome.notificationEnabled,
    });
    emitAddMiniAppTelemetry(outcome, context);
    return outcome;
  } catch (error) {
    const reason = classifyAddMiniAppError(error);
    const outcome: AddMiniAppOutcome = {
      success: false,
      source,
      reason,
    };

    if (reason === "rejected_by_user") {
      console.info("[Add Mini App] User declined", context);
    } else if (reason === "invalid_domain_manifest") {
      console.error("[Add Mini App] Invalid domain/manifest configuration", {
        ...context,
        error,
      });
    } else if (reason === "unavailable_context") {
      console.warn("[Add Mini App] Not available in this runtime context", {
        ...context,
        error,
      });
    } else {
      console.error("[Add Mini App] Unexpected failure", {
        ...context,
        error,
      });
    }

    emitAddMiniAppTelemetry(outcome, context);
    return outcome;
  }
}

export async function openExternalUrl(url: string) {
  let popup: Window | null = null;
  if (typeof window !== "undefined") {
    try {
      popup = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      popup = null;
    }
  }

  if (!popup) {
    try {
      await sdk.actions.openUrl(url);
    } catch {
      if (typeof window !== "undefined") {
        try {
          window.location.href = url;
        } catch {
          /* noop */
        }
      }
    }
  }
}

export async function openExternalUrlInMiniApp(url: string) {
  try {
    await sdk.actions.openUrl(url);
  } catch {
    await openExternalUrl(url);
  }
}

export async function openFarcasterCast(options: {
  hash: string;
  authorUsername?: string;
  fallbackUrl: string;
}) {
  const actions = getMiniAppActions();
  const hash = normalizeCastHash(options.hash);
  const authorUsername = normalizeUsername(options.authorUsername);

  if (!hash || typeof actions.viewCast !== "function") {
    await openExternalUrl(options.fallbackUrl);
    return;
  }

  try {
    await actions.viewCast({ hash, authorUsername });
  } catch {
    await openExternalUrl(options.fallbackUrl);
  }
}

export async function openFarcasterProfile(options: {
  fid?: number | null;
  fallbackUrl: string;
}) {
  const actions = getMiniAppActions();
  const fid = typeof options.fid === "number" ? options.fid : null;

  if (!fid || typeof actions.viewProfile !== "function") {
    await openExternalUrl(options.fallbackUrl);
    return;
  }

  try {
    await actions.viewProfile({ fid });
  } catch {
    await openExternalUrl(options.fallbackUrl);
  }
}

export async function shareToFarcaster(text: string) {
  try {
    await sdk.actions.composeCast({ text });
    return { success: true, method: "sdk" as const };
  } catch {
    const url = buildComposeUrl(text);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return { success: false, method: "fallback" as const };
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
